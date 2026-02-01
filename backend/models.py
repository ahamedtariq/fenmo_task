from sqlalchemy import Column, Integer, String, Float, Date, DateTime,ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class Categories(Base):
    __tablename__ ="categories"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), nullable=False,unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())

    expenses = relationship(
        "Expense",
        back_populates="category",
        cascade="all, delete"
    )


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'),nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(Date, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now())


    category = relationship("Categories",back_populates="expenses")