import base64
import os
from email.message import EmailMessage

from fastapi import APIRouter, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.models.schemas import DemoRequest, DemoRequestResponse

router = APIRouter()


def _get_sender_email() -> str:
    sender = os.getenv('GMAIL_SENDER_EMAIL')
    if not sender:
        raise ValueError('GMAIL_SENDER_EMAIL must be configured.')
    return sender


def _build_owner_notification_email(payload: DemoRequest, sender: str) -> EmailMessage:
    recipient = os.getenv('DEMO_RECEIVER_EMAIL', 'deoprakash364@gmail.com')

    msg = EmailMessage()
    msg['Subject'] = f"Corelign Demo Request: {payload.name}"
    msg['From'] = sender
    msg['To'] = recipient
    msg['Reply-To'] = payload.email

    body = (
        'A new demo request was submitted from the Corelign website.\n\n'
        f'Name: {payload.name}\n'
        f'Email: {payload.email}\n'
        f'Contact Number: {payload.contact_number}\n\n'
        'Message:\n'
        f'{payload.message}\n'
    )

    msg.set_content(body)
    return msg


def _build_user_confirmation_email(payload: DemoRequest, sender: str) -> EmailMessage:
    msg = EmailMessage()
    msg['Subject'] = 'Corelign Demo Request Received'
    msg['From'] = sender
    msg['To'] = payload.email

    body = (
        f'Hi {payload.name},\n\n'
        'Thanks for reaching out to Corelign. We have received your demo request and will contact you shortly.\n\n'
        'Your submitted details:\n'
        f'- Name: {payload.name}\n'
        f'- Email: {payload.email}\n'
        f'- Contact Number: {payload.contact_number}\n'
        f'- Message: {payload.message}\n\n'
        'Regards,\n'
        'Corelign Team\n'
    )

    msg.set_content(body)
    return msg


def _gmail_service():
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    refresh_token = os.getenv('GOOGLE_REFRESH_TOKEN')

    if not client_id or not client_secret or not refresh_token:
        raise ValueError('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN must be configured.')

    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri='https://oauth2.googleapis.com/token',
        client_id=client_id,
        client_secret=client_secret,
        scopes=['https://www.googleapis.com/auth/gmail.send'],
    )

    return build('gmail', 'v1', credentials=creds, cache_discovery=False)


def _send_gmail_api_messages(messages: list[EmailMessage]) -> None:
    service = _gmail_service()
    for msg in messages:
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
        service.users().messages().send(userId='me', body={'raw': raw}).execute()


@router.post('/demo-request', response_model=DemoRequestResponse)
async def send_demo_request(payload: DemoRequest):
    if not payload.name.strip() or not payload.email.strip() or not payload.contact_number.strip() or not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='All fields are required.',
        )

    try:
        sender = _get_sender_email()
        owner_notification = _build_owner_notification_email(payload, sender)
        user_confirmation = _build_user_confirmation_email(payload, sender)
        await run_in_threadpool(_send_gmail_api_messages, [owner_notification, user_confirmation])
    except ValueError as cfg_error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(cfg_error),
        ) from cfg_error
    except Exception as exc:
        print(f"Demo email send failed: {exc!r}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to send demo request emails: {type(exc).__name__}",
        ) from exc

    return {
        'status': 'success',
        'message': 'Demo request submitted and confirmation sent.',
    }
