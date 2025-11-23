from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class DynamicAttribute(BaseModel):
    key: str
    description: Optional[str] = None
    url: Optional[str] = None
    remarks: Optional[str] = None
    active: bool = True

class Tag(BaseModel):
    id: int
    name: str

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

    class Config:
        orm_mode = True
