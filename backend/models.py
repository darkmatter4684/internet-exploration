from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from database import Base

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, index=True)
    name = Column(String, index=True)
    locator = Column(String)
    description = Column(String, nullable=True)
    tags = Column(JSON)  # Storing tags as a JSON list
    image_url = Column(String, nullable=True)
    attributes = Column(JSON, default={})  # Dynamic attributes: {key: {key, description, url, remarks, active}}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
