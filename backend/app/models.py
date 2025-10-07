from sqlalchemy import Column, Integer, String, Float, Text, JSON, TIMESTAMP, func
from .database import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    cuisine = Column(String(255), index=True)
    title = Column(String(500), index=True)
    rating = Column(Float, nullable=True, index=True)
    prep_time = Column(Integer, nullable=True)
    cook_time = Column(Integer, nullable=True)
    total_time = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    nutrients = Column(JSON, nullable=True)
    calories_int = Column(Integer, nullable=True)
    serves = Column(String(100), nullable=True)
    created_at = Column(TIMESTAMP(timezone=False), server_default=func.now())
