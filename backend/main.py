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
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    if q:
        return crud.search_entities(db, q, skip=skip, limit=limit)
    return crud.get_entities(db, skip=skip, limit=limit)

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

@app.delete("/entities/{entity_id}", response_model=schemas.Entity)
def delete_entity(entity_id: int, db: Session = Depends(get_db)):
    db_entity = crud.delete_entity(db, entity_id)
    if db_entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    return db_entity
