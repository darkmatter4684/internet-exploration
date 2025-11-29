from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, crud, database
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Internet Entity Logger")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/entities/", response_model=schemas.Entity)
def create_entity(entity: schemas.EntityCreate, db: Session = Depends(get_db)):
    return crud.create_entity(db=db, entity=entity)

@app.get("/entities/", response_model=List[schemas.Entity])
def read_entities(
    q: Optional[str] = None,
    search_field: Optional[str] = None,
    exact_match: bool = False,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    if q:
        return crud.search_entities(db, q, search_field=search_field, exact_match=exact_match, skip=skip, limit=limit)
    return crud.get_entities(db, skip=skip, limit=limit)

@app.get("/tags/", response_model=List[schemas.Tag])
def read_tags(q: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_tags(db, query=q, skip=skip, limit=limit)

@app.put("/tags/{tag_id}", response_model=schemas.Tag)
def update_tag(tag_id: int, tag: schemas.TagUpdate, db: Session = Depends(get_db)):
    db_tag = crud.update_tag(db, tag_id, tag)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag

@app.delete("/tags/{tag_id}", response_model=schemas.Tag)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    db_tag = crud.delete_tag(db, tag_id)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag

@app.get("/entities/{entity_id}", response_model=schemas.Entity)
def read_entity(entity_id: int, db: Session = Depends(get_db)):
    db_entity = crud.get_entity(db, entity_id=entity_id)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    return db_entity

@app.put("/entities/{entity_id}", response_model=schemas.Entity)
def update_entity(entity_id: int, entity: schemas.EntityUpdate, db: Session = Depends(get_db)):
    db_entity = crud.update_entity(db, entity_id, entity)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    return db_entity

from fastapi.staticfiles import StaticFiles
from fastapi import File, UploadFile, Body
import shutil
import os
import uuid
import httpx

# Mount media directory
os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    file_extension = os.path.splitext(file.filename)[1]
    if not file_extension:
        file_extension = ".jpg" # Default
    
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = f"media/{file_name}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/media/{file_name}"}

@app.post("/fetch-media/")
async def fetch_media(payload: dict = Body(...)):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
        
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, follow_redirects=True)
            resp.raise_for_status()
            
            # Try to guess extension from content-type or url
            content_type = resp.headers.get("content-type", "")
            ext = ".jpg" # Default fallback
            
            # Images
            if "image/png" in content_type: ext = ".png"
            elif "image/jpeg" in content_type: ext = ".jpg"
            elif "image/webp" in content_type: ext = ".webp"
            elif "image/gif" in content_type: ext = ".gif"
            # Videos
            elif "video/mp4" in content_type: ext = ".mp4"
            elif "video/webm" in content_type: ext = ".webm"
                
            file_name = f"{uuid.uuid4()}{ext}"
            file_path = f"media/{file_name}"
            
            with open(file_path, "wb") as f:
                f.write(resp.content)
                
            return {"url": f"/media/{file_name}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch media: {str(e)}")

@app.delete("/entities/{entity_id}", response_model=schemas.Entity)
def delete_entity(entity_id: int, db: Session = Depends(get_db)):
    db_entity = crud.delete_entity(db, entity_id)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    return db_entity
