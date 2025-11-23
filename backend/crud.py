from sqlalchemy.orm import Session
import models, schemas
from rapidfuzz import process, fuzz
import json
from datetime import datetime

def get_entity(db: Session, entity_id: int):
    return db.query(models.Entity).filter(models.Entity.id == entity_id).first()

def get_entities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Entity).order_by(models.Entity.id.desc()).offset(skip).limit(limit).all()

def create_entity(db: Session, entity: schemas.EntityCreate):
    # Convert Pydantic models to dicts for JSON storage
    attributes_dict = {}
    now = datetime.utcnow().isoformat()
    
    for k, v in entity.attributes.items():
        attr_data = v.dict()
        attr_data['created_at'] = now
        attr_data['updated_at'] = now
        attributes_dict[k] = attr_data

    # Sync tags
    if entity.tags:
        sync_tags(db, entity.tags)

    db_entity = models.Entity(
        entity_type=entity.entity_type,
        name=entity.name,
        locator=entity.locator,
        description=entity.description,
        tags=entity.tags,
        image_url=entity.image_url,
        attributes=attributes_dict
    )
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    return db_entity

def update_entity(db: Session, entity_id: int, entity: schemas.EntityUpdate):
    db_entity = get_entity(db, entity_id)
    if not db_entity:
        return None
    
    db_entity.entity_type = entity.entity_type
    db_entity.name = entity.name
    db_entity.locator = entity.locator
    db_entity.description = entity.description
    db_entity.tags = entity.tags
    db_entity.image_url = entity.image_url
    db_entity.tags = entity.tags
    db_entity.image_url = entity.image_url
    
    # Handle dynamic attributes timestamps
    current_attributes = db_entity.attributes or {}
    new_attributes = {}
    now = datetime.utcnow().isoformat()

    for k, v in entity.attributes.items():
        attr_data = v.dict()
        
        if k in current_attributes:
            # Preserve created_at, update updated_at
            attr_data['created_at'] = current_attributes[k].get('created_at', now)
            attr_data['updated_at'] = now
        else:
            # New attribute
            attr_data['created_at'] = now
            attr_data['updated_at'] = now
            
        new_attributes[k] = attr_data

    db_entity.attributes = new_attributes
    
    # Sync tags
    if entity.tags:
        sync_tags(db, entity.tags)
    
    db.commit()
    db.refresh(db_entity)
    return db_entity

def delete_entity(db: Session, entity_id: int):
    db_entity = get_entity(db, entity_id)
    if db_entity:
        db.delete(db_entity)
        db.commit()
    return db_entity

def search_entities(db: Session, query: str, search_field: str = None, skip: int = 0, limit: int = 10):
    entities = db.query(models.Entity).all()
    
    scored_entities = []
    for entity in entities:
        # Determine text to search based on field
        if search_field == 'name':
            text_to_search = entity.name or ""
        elif search_field == 'description':
            text_to_search = entity.description or ""
        elif search_field == 'tags':
            text_to_search = " ".join(entity.tags) if entity.tags else ""
        elif search_field == 'locator':
            text_to_search = entity.locator or ""
        elif search_field == 'type':
            text_to_search = entity.entity_type or ""
        else:
            # Default: Search all fields
            text_to_search = f"{entity.name} {entity.description} {entity.locator} {entity.entity_type} {' '.join(entity.tags) if entity.tags else ''}"
            
            # Add dynamic attributes to searchable text if searching all
            if entity.attributes:
                for attr in entity.attributes.values():
                    if isinstance(attr, dict) and attr.get('active', True):
                        text_to_search += f" {attr.get('key', '')} {attr.get('description', '')} {attr.get('remarks', '')}"
        
        score = fuzz.partial_ratio(query.lower(), text_to_search.lower())
        if score > 60:
            scored_entities.append((score, entity))
    
    scored_entities.sort(key=lambda x: x[0], reverse=True)
    return [entity for score, entity in scored_entities[skip : skip + limit]]

def sync_tags(db: Session, tags: list[str]):
    """Ensures all tags in the list exist in the Tag table."""
    if not tags:
        return
    
    for tag_name in tags:
        tag_name = tag_name.strip()
        if not tag_name:
            continue
            
        # Check if exists
        existing_tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
        if not existing_tag:
            new_tag = models.Tag(name=tag_name)
            db.add(new_tag)
            try:
                db.commit()
            except:
                db.rollback() # Handle race condition or unique constraint violation gracefully

def get_tags(db: Session, query: str = None, limit: int = 10):
    """Fuzzy search for tags."""
    if not query:
        return db.query(models.Tag).limit(limit).all()
    
    # Using ILIKE for case-insensitive partial match (fuzzy-ish)
    # For true fuzzy matching we'd need to load all tags and use rapidfuzz, 
    # but for auto-complete ILIKE %query% is usually what users expect (substring match).
    return db.query(models.Tag).filter(models.Tag.name.ilike(f"%{query}%")).limit(limit).all()
