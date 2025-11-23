from sqlalchemy.orm import Session
import models, schemas
from rapidfuzz import process, fuzz
import json

def get_entity(db: Session, entity_id: int):
    return db.query(models.Entity).filter(models.Entity.id == entity_id).first()

def get_entities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Entity).order_by(models.Entity.id.desc()).offset(skip).limit(limit).all()

def create_entity(db: Session, entity: schemas.EntityCreate):
    # Convert Pydantic models to dicts for JSON storage
    attributes_dict = {k: v.dict() for k, v in entity.attributes.items()}
    
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
    db_entity.attributes = {k: v.dict() for k, v in entity.attributes.items()}
    
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

def search_entities(db: Session, query: str, skip: int = 0, limit: int = 10):
    all_entities = db.query(models.Entity).all()
    
    if not query:
        # Return newest first if no query
        return sorted(all_entities, key=lambda x: x.id, reverse=True)[skip : skip + limit]

    # Prepare data for fuzzy search
    # We'll search across name, description, tags, and attribute values
    scored_entities = []
    
    for entity in all_entities:
        searchable_text = f"{entity.name} {entity.description or ''} {entity.entity_type} {' '.join(entity.tags)}"
        
        # Add dynamic attributes to searchable text
        if entity.attributes:
            for attr in entity.attributes.values():
                if isinstance(attr, dict) and attr.get('active', True):
                    searchable_text += f" {attr.get('key', '')} {attr.get('description', '')} {attr.get('remarks', '')}"
        
        score = fuzz.partial_ratio(query.lower(), searchable_text.lower())
        if score > 50: # Threshold
            scored_entities.append((score, entity))
            
    # Sort by score desc
    scored_entities.sort(key=lambda x: x[0], reverse=True)
    
    # Pagination
    start = skip
    end = skip + limit
    return [x[1] for x in scored_entities[start:end]]

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
