from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(func.lower(User.email) == email.lower())
    return db.scalar(statement)


def create_user(db: Session, user_data: UserCreate) -> User:
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        auth_provider="email",
        is_active=True,
        is_verified=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:

    user = get_user_by_email(db, email)

    if user is None:
        return None

    if user.password_hash is None:
        return None

    if not verify_password(password, user.password_hash):
        return None

    if not user.is_active:
        return None

    return user


def reset_user_password(db: Session, user: User, new_password: str) -> None:
    user.password_hash = hash_password(new_password)
    db.commit()


def get_or_create_google_user(
    db: Session,
    email: str,
    name: str,
    google_id: str,
    avatar_url: str | None = None,
) -> User:
    user = get_user_by_email(db, email)
    if user:
        if not user.google_id:
            user.google_id = google_id
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        user.is_verified = True
        db.commit()
        db.refresh(user)
        return user

    user = User(
        name=name or email.split("@")[0],
        email=email.lower(),
        password_hash=None,
        auth_provider="google",
        google_id=google_id,
        avatar_url=avatar_url,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user