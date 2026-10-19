import json
import logging
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    ResetPasswordRequest,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_user,
    create_user,
    get_or_create_google_user,
    get_user_by_email,
    reset_user_password,
)
from app.services.email_service import send_password_reset_email

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    return create_user(db, user_data)


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        login_data.email,
        login_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        subject=str(user.id),
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
    )

def verify_google_token(credential: str) -> dict | None:
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(credential)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Resumo/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                iss = data.get("iss", "")
                if "accounts.google.com" in iss or iss == "https://accounts.google.com":
                    configured_client_id = (settings.GOOGLE_CLIENT_ID or "").strip().strip("\"'")
                    if configured_client_id and data.get("aud") != configured_client_id:
                        logger.warning(
                            f"Google token aud mismatch: token aud={data.get('aud')} vs configured={configured_client_id}"
                        )
                        return None
                    return data
    except Exception as e:
        logger.error(f"Error validating Google token: {e}")
    return None


@router.post(
    "/google",
    response_model=Token,
    status_code=status.HTTP_200_OK,
)
def google_auth(
    payload: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    google_data = verify_google_token(payload.credential)
    if not google_data or not google_data.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired Google authentication credential.",
        )

    email = google_data["email"].lower()
    name = google_data.get("name") or email.split("@")[0]
    google_id = google_data.get("sub") or ""
    avatar_url = google_data.get("picture")

    user = get_or_create_google_user(
        db=db,
        email=email,
        name=name,
        google_id=google_id,
        avatar_url=avatar_url,
    )

    access_token = create_access_token(
        subject=str(user.id),
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
    )


@router.post(
    "/forgot-password",
    status_code=status.HTTP_200_OK,
)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, payload.email)
    email_sent = False
    reset_link = None
    email_detail = "User not found in database. Please register an account first."

    if user:
        token = create_password_reset_token(payload.email)
        frontend_base = (
            settings.FRONTEND_URL.rstrip("/")
            if getattr(settings, "FRONTEND_URL", None)
            else "https://resumo-zeta.vercel.app"
        )
        reset_link = f"{frontend_base}/reset-password?token={token}"
        email_sent, email_detail = send_password_reset_email(payload.email, reset_link)

    return {
        "message": (
            "A password reset link has been sent to your email. Check your inbox and spam folder."
            if email_sent
            else "Password reset link generated. Follow the link below to set a new password."
        ),
        "email_sent": email_sent,
        "reset_link": reset_link if not email_sent else None,
        "detail": email_detail,
    }


@router.post(
    "/reset-password",
    status_code=status.HTTP_200_OK,
)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    email = verify_password_reset_token(payload.token)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user = get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    reset_user_password(db, user, payload.new_password)
    return {"message": "Password has been reset successfully."}


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user