import json
import logging
import os
import smtplib
import urllib.parse
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_resend_api_key() -> str:
    key = os.environ.get("RESEND_API_KEY") or settings.RESEND_API_KEY or ""
    key = key.strip("'\" \r\n\t")
    if key.startswith("re_"):
        return key

    smtp_pwd = os.environ.get("SMTP_PASSWORD") or settings.SMTP_PASSWORD or ""
    smtp_pwd = smtp_pwd.strip("'\" \r\n\t")
    if smtp_pwd.startswith("re_"):
        return smtp_pwd

    # Auto-detect any secret/env variable on the system starting with re_
    for _, v in os.environ.items():
        if isinstance(v, str):
            clean = v.strip("'\" \r\n\t")
            if clean.startswith("re_") and len(clean) > 10:
                return clean

    return ""


def get_smtp_host() -> str:
    return os.environ.get("SMTP_HOST") or settings.SMTP_HOST


def get_smtp_port() -> int:
    try:
        return int(os.environ.get("SMTP_PORT") or settings.SMTP_PORT or 587)
    except Exception:
        return 587


def get_smtp_username() -> str:
    return os.environ.get("SMTP_USERNAME") or settings.SMTP_USERNAME


def get_smtp_password() -> str:
    return os.environ.get("SMTP_PASSWORD") or settings.SMTP_PASSWORD


def get_smtp_from() -> str:
    return os.environ.get("SMTP_FROM") or settings.SMTP_FROM


def is_smtp_configured() -> bool:
    """Check if Resend API key or SMTP credentials are valid."""
    if get_resend_api_key().startswith("re_"):
        return True
    host = get_smtp_host()
    user = get_smtp_username()
    pwd = get_smtp_password()
    if not host or not user or not pwd:
        return False
    if pwd in ("your_app_password", "your_password", "password", ""):
        return False
    return True


def send_via_resend(to_email: str, subject: str, html_content: str, text_content: str) -> tuple[bool, str]:
    """Send email using Resend REST API."""
    key = get_resend_api_key()
    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "Resumo/1.0",
        }
        sender = "Resumo <onboarding@resend.dev>"
        smtp_from = get_smtp_from()
        if smtp_from and "resend.dev" in smtp_from:
            sender = smtp_from

        payload = {
            "from": sender,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
            "text": text_content,
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                logger.info(f"[Resend] Email sent successfully to {to_email}")
                print(f"[SUCCESS] [Resend] Password reset email sent to {to_email}")
                return True, "Email sent via Resend"
    except urllib.error.HTTPError as he:
        body = he.read().decode("utf-8")
        logger.error(f"[Resend HTTPError {he.code}] {body}")
        print(f"[ERROR] [Resend HTTP {he.code}]: {body}")
        return False, f"Resend HTTP {he.code}: {body}"
    except Exception as e:
        logger.error(f"[Resend Error] Failed to send email to {to_email}: {e}")
        print(f"[ERROR] [Resend Error]: {e}")
        return False, f"Resend Error: {e}"
    return False, "Failed to send via Resend"


def send_password_reset_email(to_email: str, reset_link: str) -> tuple[bool, str]:
    """
    Attempts to send a password reset email via Resend API or SMTP.
    Returns (True, "success message") if sent, or (False, "reason") otherwise.
    """
    print(f"\n========================================================")
    print(f"[*] [PASSWORD RESET LINK FOR {to_email}]")
    print(f"--> Link: {reset_link}")
    print(f"========================================================\n")

    resend_key = get_resend_api_key()
    smtp_host = get_smtp_host()
    smtp_user = get_smtp_username()
    smtp_pwd = get_smtp_password()

    if not is_smtp_configured():
        msg = f"No email provider configured (resend_key present: {bool(resend_key)}, smtp_user: {bool(smtp_user)})"
        logger.warning(msg)
        return False, msg

    html = f"""
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
      <h2 style="font-size: 20px; color: #1f2937; margin-bottom: 8px;">Reset your password</h2>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
        You requested a password reset for your Resumo account. Click the button below to set a new password.
        This link expires in <strong>15 minutes</strong>.
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="{reset_link}" style="display: inline-block; padding: 12px 32px; background: #4f46e5; color: #ffffff; font-weight: 600; font-size: 14px; border-radius: 12px; text-decoration: none;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
        If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center;">Resumo · Career Intelligence Hub</p>
    </div>
    """
    text = (
        f"Hi,\n\n"
        f"You requested a password reset for your Resumo account.\n\n"
        f"Click the link below to set a new password (expires in 15 minutes):\n"
        f"{reset_link}\n\n"
        f"If you didn't request this, just ignore this email.\n\n"
        f"- Resumo"
    )

    if resend_key.startswith("re_"):
        return send_via_resend(to_email, "Resumo - Reset Your Password", html, text)

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Resumo - Reset Your Password"
        msg["From"] = get_smtp_from() or smtp_user
        msg["To"] = to_email
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(smtp_host, get_smtp_port(), timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_pwd)
            server.sendmail(msg["From"], to_email, msg.as_string())
        logger.info(f"Password reset email sent successfully to {to_email}")
        print(f"[SUCCESS] [SMTP] Email sent successfully to {to_email}")
        return True, "Email sent via SMTP"
    except Exception as exc:
        logger.error(f"Failed to send email to {to_email} via SMTP: {exc}")
        print(f"[ERROR] [SMTP Error]: {exc}")
        return False, f"SMTP Error: {exc}"
