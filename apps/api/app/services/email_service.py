import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def is_smtp_configured() -> bool:
    """Check if SMTP credentials are valid and not default placeholders."""
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        return False
    if settings.SMTP_PASSWORD in ("your_app_password", "your_password", "password", ""):
        return False
    return True


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """
    Attempts to send a password reset email via SMTP.
    Returns True if sent successfully, False otherwise.
    Always prints the reset link to the console for easy local access.
    """
    print(f"\n========================================================")
    print(f"[*] [PASSWORD RESET LINK FOR {to_email}]")
    print(f"--> Link: {reset_link}")
    print(f"========================================================\n")

    if not is_smtp_configured():
        logger.warning(
            f"SMTP not configured with real password (placeholder detected). "
            f"Reset link printed to terminal for {to_email}."
        )
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Resumo - Reset Your Password"
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USERNAME
    msg["To"] = to_email

    text = (
        f"Hi,\n\n"
        f"You requested a password reset for your Resumo account.\n\n"
        f"Click the link below to set a new password (expires in 15 minutes):\n"
        f"{reset_link}\n\n"
        f"If you didn't request this, just ignore this email.\n\n"
        f"- Resumo"
    )

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

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM or settings.SMTP_USERNAME, to_email, msg.as_string())
        logger.info(f"Password reset email sent successfully to {to_email}")
        print(f"[SUCCESS] [SMTP] Email sent successfully to {to_email}")
        return True
    except Exception as exc:
        logger.error(f"Failed to send email to {to_email} via SMTP: {exc}")
        print(f"[ERROR] [SMTP Error]: {exc}")
        return False
