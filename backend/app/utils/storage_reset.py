import asyncio
import json
import os
import shutil
import time
from pathlib import Path


DATA_DIR = Path(os.getenv("DATA_DIR", "data"))
RESET_AFTER_DAYS = int(os.getenv("DATA_RESET_DAYS", "3"))
CHECK_INTERVAL_HOURS = int(os.getenv("DATA_RESET_CHECK_INTERVAL_HOURS", "24"))
STATE_FILE = DATA_DIR / ".storage_reset_state.json"


def _target_directories() -> list[Path]:
    return [
        DATA_DIR / "raw_docs",
        DATA_DIR / "vector_store",
        DATA_DIR / "chroma_db",
    ]


def _read_last_reset_at() -> float | None:
    if not STATE_FILE.exists():
        return None

    try:
        with STATE_FILE.open("r", encoding="utf-8") as file_handle:
            payload = json.load(file_handle)
        value = float(payload.get("last_reset_at", 0))
        return value if value > 0 else None
    except (ValueError, TypeError, OSError, json.JSONDecodeError):
        return None


def _write_last_reset_at(timestamp: float) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with STATE_FILE.open("w", encoding="utf-8") as file_handle:
        json.dump({"last_reset_at": timestamp}, file_handle)


def clear_storage() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    for target_dir in _target_directories():
        if target_dir.exists():
            shutil.rmtree(target_dir)
        target_dir.mkdir(parents=True, exist_ok=True)


def should_reset(now: float | None = None) -> bool:
    now = now or time.time()
    last_reset_at = _read_last_reset_at()
    if last_reset_at is None:
        return True

    return (now - last_reset_at) >= RESET_AFTER_DAYS * 24 * 60 * 60


def ensure_storage_reset() -> bool:
    now = time.time()
    if not should_reset(now):
        return False

    clear_storage()
    _write_last_reset_at(now)
    return True


async def storage_reset_loop() -> None:
    while True:
        ensure_storage_reset()
        await asyncio.sleep(CHECK_INTERVAL_HOURS * 60 * 60)