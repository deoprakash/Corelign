import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from fastapi import APIRouter, HTTPException, status
from fastapi.concurrency import run_in_threadpool

from app.models.schemas import DemoRequest, DemoRequestResponse

router = APIRouter()


def _get_sender_email() -> str:
    sender = os.getenv('SMTP_SENDER_EMAIL') or os.getenv('GMAIL_SENDER_EMAIL')
    if not sender:
        raise ValueError('SMTP_SENDER_EMAIL must be configured.')
    return sender


def _get_smtp_settings() -> tuple[str, int, str, str, bool]:
    host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    port = int(os.getenv('SMTP_PORT', '587'))
    username = os.getenv('SMTP_USERNAME')
    password = os.getenv('SMTP_PASSWORD')
    use_ssl = os.getenv('SMTP_USE_SSL', '').lower() in {'1', 'true', 'yes'}

    if not username or not password:
        raise ValueError('SMTP_USERNAME and SMTP_PASSWORD must be configured.')

    return host, port, username, password, use_ssl


def _build_owner_notification_email(payload: DemoRequest, sender: str) -> EmailMessage:
    recipient = os.getenv('DEMO_RECEIVER_EMAIL', 'deoprakash364@gmail.com')

    msg = EmailMessage()
    msg['Subject'] = f"Corelign Demo Request: {payload.name}"
    msg['From'] = formataddr(("Corelign Team", sender))
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
        'Thanks for reaching out to Corelign. \nWe have received your demo request and will contact you shortly.\n\n'
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


def _send_smtp_messages(messages: list[EmailMessage]) -> None:
    host, port, username, password, use_ssl = _get_smtp_settings()

    if use_ssl:
        with smtplib.SMTP_SSL(host, port) as server:
            server.login(username, password)
            for msg in messages:
                server.send_message(msg)
        return

    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(username, password)
        for msg in messages:
            server.send_message(msg)


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
        await run_in_threadpool(_send_smtp_messages, [owner_notification, user_confirmation])
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
