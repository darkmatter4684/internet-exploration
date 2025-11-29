from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class DynamicAttribute(BaseModel):
    key: str
    description: Optional[str] = None
    url: Optional[str] = None
    remarks: Optional[str] = None
    active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagUpdate(TagBase):
    pass

class Tag(TagBase):
    id: int

    class Config:
        orm_mode = True

class EntityBase(BaseModel):
    entity_type: str
    name: str
    locator: str
    description: Optional[str] = None
    tags: List[str] = []
    image_url: Optional[str] = None
    attributes: Dict[str, DynamicAttribute] = {}

class EntityCreate(EntityBase):
    pass

class EntityUpdate(EntityBase):
    pass

class Entity(EntityBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
