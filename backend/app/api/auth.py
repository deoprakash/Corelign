import base64
import hashlib
import hmac
import os
import secrets
import uuid
from datetime import datetime, timedelta
from fastapi import Header

from fastapi import APIRouter, HTTPException, status
from pymongo import ASCENDING, MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError, ServerSelectionTimeoutError

from app.models.schemas import AuthResponse, AuthUserResponse, LoginRequest, RegisterRequest


router = APIRouter()

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB_NAME", "CorelignWeb-Admin")
USERS_COLLECTION = "users"
SESSION_TTL_HOURS = int(os.getenv("AUTH_SESSION_TTL_HOURS", "720"))
PASSWORD_ITERATIONS = 210000


class AuthStore:
    def __init__(self, mongo_uri: str = MONGO_URI, db_name: str = DB_NAME):
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, retryWrites=True)
            self.db = self.client[db_name]
            self.client.admin.command("ping")
            self._ensure_indexes()
            print("MongoDB auth connected successfully")
        except (ServerSelectionTimeoutError, PyMongoError, Exception) as exc:
            print(f"MongoDB auth connection failed: {exc}")
            self.client = None
            self.db = None

    def _ensure_indexes(self) -> None:
        if self.db is None:
            return

        users = self.db[USERS_COLLECTION]
        users.create_index([("email_lower", ASCENDING)], unique=True, sparse=True)
        users.create_index([("session_id", ASCENDING)])

    def available(self) -> bool:
        return self.db is not None

    def collection(self):
        if self.db is None:
            raise RuntimeError("MongoDB is unavailable")
        return self.db[USERS_COLLECTION]


auth_store = AuthStore()


def _normalize(value: str) -> str:
    return value.strip().lower()


def _hash_password(password: str, salt: bytes | None = None) -> tuple[str, str]:
    salt_bytes = salt or secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_bytes,
        PASSWORD_ITERATIONS,
    )
    return base64.b64encode(salt_bytes).decode("ascii"), base64.b64encode(derived_key).decode("ascii")


def _verify_password(password: str, salt_b64: str, hash_b64: str) -> bool:
    salt_bytes = base64.b64decode(salt_b64.encode("ascii"))
    _, candidate_hash = _hash_password(password, salt_bytes)
    return hmac.compare_digest(candidate_hash, hash_b64)


def _generate_session(expires_hours: int = SESSION_TTL_HOURS) -> tuple[str, str, datetime, str]:
    session_id = str(uuid.uuid4())
    session_token = secrets.token_urlsafe(32)
    session_token_hash = hashlib.sha256(session_token.encode("utf-8")).hexdigest()
    session_expires_at = datetime.utcnow() + timedelta(hours=expires_hours)
    return session_id, session_token, session_expires_at, session_token_hash


def _public_user(user_doc: dict) -> AuthUserResponse:
    return AuthUserResponse(
        id=str(user_doc["_id"]),
        email=user_doc["email"],
        display_name=user_doc.get("display_name"),
        created_at=user_doc.get("created_at"),
        last_login_at=user_doc.get("last_login_at"),
        device_info=user_doc.get("device_info"),
    )


def _auth_response(user_doc: dict, session_id: str, session_token: str, session_expires_at: datetime) -> AuthResponse:
    return AuthResponse(
        user=_public_user(user_doc),
        session_id=session_id,
        session_token=session_token,
        session_expires_at=session_expires_at,
    )


def _user_lookup(identifier: str):
    normalized = _normalize(identifier)
    users = auth_store.collection()
    return users.find_one(
        {
            "$or": [
                {"email_lower": normalized},
            ]
        }
    )


def _validate_registration(payload: RegisterRequest) -> None:
    if not payload.email.strip() or not payload.password.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="email, and password are required.",
        )
    if len(payload.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long.",
        )
    if "@" not in payload.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter a valid email address.",
        )


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest):
    if not auth_store.available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication database is unavailable.",
        )

    _validate_registration(payload)

    users = auth_store.collection()
    email = payload.email.strip()
    display_name = (payload.display_name or "").strip() or "User"
    email_lower = _normalize(email)
    existing_user = users.find_one(
       {"email_lower": email_lower}
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        )

    password_salt, password_hash = _hash_password(payload.password)
    session_id, session_token, session_expires_at, session_token_hash = _generate_session()
    now = datetime.utcnow()
    user_id = str(uuid.uuid4())

    user_doc = {
        "_id": user_id,
        "email": email,
        "email_lower": email_lower,
        "display_name": display_name,
        "password_salt": password_salt,
        "password_hash": password_hash,
        "created_at": now,
        "updated_at": now,
        "last_login_at": now,
        "login_count": 1,
        "is_active": True,
        "device_info": payload.device_info,
        "session_id": session_id,
        "session_token_hash": session_token_hash,
        "session_expires_at": session_expires_at,
    }

    try:
        users.insert_one(user_doc)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        ) from exc

    return _auth_response(user_doc, session_id, session_token, session_expires_at)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    if not auth_store.available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication database is unavailable.",
        )

    if not payload.identifier.strip() or not payload.password.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identifier and password are required.",
        )

    users = auth_store.collection()
    user_doc = _user_lookup(payload.identifier)
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not _verify_password(payload.password, user_doc["password_salt"], user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    session_id, session_token, session_expires_at, session_token_hash = _generate_session()
    now = datetime.utcnow()

    users.update_one(
        {"_id": user_doc["_id"]},
        {
            "$set": {
                "updated_at": now,
                "last_login_at": now,
                "device_info": payload.device_info or user_doc.get("device_info"),
                "session_id": session_id,
                "session_token_hash": session_token_hash,
                "session_expires_at": session_expires_at,
            },
            "$inc": {"login_count": 1},
        },
    )

    user_doc.update(
        {
            "updated_at": now,
            "last_login_at": now,
            "device_info": payload.device_info or user_doc.get("device_info"),
            "session_id": session_id,
            "session_token_hash": session_token_hash,
            "session_expires_at": session_expires_at,
            "login_count": user_doc.get("login_count", 0) + 1,
        }
    )

    return _auth_response(user_doc, session_id, session_token, session_expires_at)

@router.post("/logout")
def logout(authorization: str | None = Header(default=None)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is missing.",
        )

    token = authorization.replace("Bearer ", "").strip()
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()

    users = auth_store.collection()

    result = users.update_one(
        {"session_token_hash": token_hash},
        {
            "$unset": {
                "session_id": "",
                "session_token_hash": "",
                "session_expires_at": "",
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session.",
        )

    return {"message": "Logged out successfully."}
