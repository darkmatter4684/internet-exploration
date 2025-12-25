# Internet Entity Logger

A full-stack application designed to track, log, and manage entities discovered across the internet. This project allows users to create entity records with metadata, tags, and associated media (images/videos).

## Features

- **Entity Management**: Create, read, update, and delete entity records.
- **Tagging System**: Organize entities using a flexible tagging system.
- **Media Support**: Upload local media or fetch media directly from URLs to associate with entities.
- **Advanced Search**: Search entities by name, description, or tags with support for exact matching and fuzzy search.
- **Responsive Design**: Modern UI built with React and Tailwind CSS.

## Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Database**: SQLite (default)
- **Utilities**: Pydantic, RapidFuzz (for search), HTTPX (for fetching media)

### Frontend
- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: Axios

---

## Getting Started

### Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- **npm** or **yarn**

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`. You can access the automatic interactive API documentation at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## Project Structure

```text
internet-exploration/
├── backend/                # FastAPI application
│   ├── main.py             # Entry point & API routes
│   ├── models.py           # SQLAlchemy database models
│   ├── schemas.py          # Pydantic data schemas
│   ├── crud.py             # Database operations (Create, Read, Update, Delete)
│   ├── database.py         # Database configuration
│   ├── requirements.txt    # Python dependencies
│   └── media/              # Directory for stored images/videos
├── frontend/               # React Vite application
│   ├── src/                # Component & application logic
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies & scripts
│   └── tailwind.config.js  # Styling configuration
└── README.md
```

## API Endpoints Summary

- `GET /entities/`: List or search entities.
- `POST /entities/`: Create a new entity.
- `GET /entities/{id}`: Get details for a specific entity.
- `PUT /entities/{id}`: Update an entity.
- `DELETE /entities/{id}`: Delete an entity.
- `GET /tags/`: List tags.
- `POST /upload/`: Upload local media files.
- `POST /fetch-media/`: Fetch media from a URL and save it locally.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
