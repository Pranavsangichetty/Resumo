from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    theme: Mapped[str] = mapped_column(
        String(20),
        default="system",
        nullable=False,
    )

    target_ats_score: Mapped[int] = mapped_column(
        Integer,
        default=85,
        nullable=False,
    )

    resume_length: Mapped[str] = mapped_column(
        String(20),
        default="one_page",
        nullable=False,
    )

    max_optimization_attempts: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
    )

    notifications_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )