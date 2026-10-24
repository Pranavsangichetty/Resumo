from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ATSEvaluation(Base):
    __tablename__ = "ats_evaluations"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    resume_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    score: Mapped[int] = mapped_column(Integer, nullable=False)
    keyword_match: Mapped[int] = mapped_column(Integer, nullable=False)
    skills_match: Mapped[int] = mapped_column(Integer, nullable=False)
    experience_match: Mapped[int] = mapped_column(Integer, nullable=False)
    education_match: Mapped[int] = mapped_column(Integer, nullable=False)

    matched_keywords: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    missing_keywords: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
