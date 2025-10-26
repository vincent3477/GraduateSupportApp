"""
FastAPI Backend for Graduate Support App

Hybrid approach:
- Uses 100 pre-loaded test users for demo
- Allows new users to join and be stored in ChromaDB
- Everyone matches with everyone (test + new users)


Implemented so far:
  - ✅ Create user
  - ✅ Add preferences + generate embedding
  - ✅ Find similar users
  - ✅ Database stats
  - ✅ CORS configuration
  - ✅ Error handling (basic)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uvicorn

from user_onboarding import create_user_session, update_user_preferences
from user_connectivity import UserVectorDB

# ============================================================================
# FastAPI App Setup
# ============================================================================

app = FastAPI(
    title="Graduate Support API",
    description="Connect graduates with similar peers using AI-powered matching",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # React default
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB - Uses test_chroma_data with 100 pre-loaded users
vector_db = UserVectorDB(persist_directory="./test_chroma_data")

# ============================================================================
# Pydantic Models (Request/Response Schemas)
# ============================================================================

class UserCreate(BaseModel):
    """Schema for creating a new user"""
    name: str
    email: EmailStr
    birthday: Optional[str] = None
    major: Optional[str] = None
    location: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Alex Chen",
                "email": "alex@example.com",
                "birthday": "2002-05-15",
                "major": "Computer Science",
                "location": "San Francisco, CA"
            }
        }
    }


class UserPreferences(BaseModel):
    """Schema for user preferences (favorites and goals)"""
    favorites: List[str] = []
    goals: List[str] = []

    model_config = {
        "json_schema_extra": {
            "example": {
                "favorites": ["Coding side projects", "Reading tech blogs", "Gym"],
                "goals": ["Land SWE role at FAANG", "Master system design", "Build portfolio"]
            }
        }
    }


class SimilarUser(BaseModel):
    """Schema for similar user in response (no similarity score per requirements)"""
    user_id: str
    name: str
    major: str
    location: str
    goals: List[str]  # Top 3 goals only


class SimilarUsersResponse(BaseModel):
    """Schema for similar users endpoint response"""
    user_id: str
    total_matches: int
    similar_users: List[SimilarUser]


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """
    API Health Check

    Returns API status and quick links to documentation
    """
    return {
        "status": "online",
        "message": "Graduate Support API is running",
        "version": "1.0.0",
        "docs": "http://localhost:8000/docs",
        "endpoints": {
            "create_user": "POST /api/users",
            "add_preferences": "POST /api/users/{user_id}/preferences",
            "find_similar": "GET /api/users/{user_id}/similar",
            "stats": "GET /api/stats"
        }
    }


@app.post("/api/users", status_code=201)
async def create_user(user_data: UserCreate):
    """
    Create a new user account

    This is Step 1 of onboarding. Creates a user session with:
    - Unique UUID
    - Basic profile info (name, email, birthday, major, location)
    - Timestamp

    User is NOT added to ChromaDB yet (that happens after preferences are added).

    Returns:
        User object with generated ID
    """
    try:
        # Convert Pydantic model to dict
        user_dict = user_data.model_dump()

        # Create user session using existing function
        user_session = create_user_session(user_dict)

        return {
            "status": "success",
            "message": "User created successfully",
            "user": user_session
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user: {str(e)}"
        )


@app.post("/api/users/{user_id}/preferences")
async def add_user_preferences(user_id: str, preferences: UserPreferences):
    """
    Add user preferences and generate embedding

    This is Step 2 of onboarding. It:
    1. Saves user preferences (favorites, goals)
    2. Generates 384-dimensional embedding from full profile
    3. Stores user + embedding in ChromaDB

    After this, the user can be matched with others!

    Returns:
        Updated user session with preferences
    """
    try:
        # Convert Pydantic model to dict
        prefs_dict = preferences.model_dump()

        # Update preferences using existing function
        user_session = update_user_preferences(user_id, prefs_dict)

        # Generate embedding and store in ChromaDB
        # This adds the user to the same database as the 100 test users
        vector_db.add_user(user_session)

        return {
            "status": "success",
            "message": "Preferences saved and user added to matching pool",
            "user": user_session,
            "embedding_generated": True
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save preferences: {str(e)}"
        )


@app.get("/api/users/{user_id}/similar", response_model=SimilarUsersResponse)
async def get_similar_users(user_id: str, top_k: int = 10):
    """
    Find similar users based on profile matching

    Uses ChromaDB vector similarity search to find graduates with:
    - Similar majors
    - Similar interests (favorites)
    - Similar career goals

    Searches across ALL users (100 test users + new sign-ups).

    Parameters:
        user_id: The user to find matches for
        top_k: Number of matches to return (default: 10)

    Returns:
        List of similar users with:
        - name
        - major
        - location
        - top 3 goals

    NOTE: Similarity score is NOT included per requirements.
    """
    try:
        # Query ChromaDB for similar users
        similar_users = vector_db.find_similar_users(user_id, top_k=top_k)

        # Format response according to requirements:
        # Include: name, major, location, top 3 goals ONLY
        # Exclude: similarity score, favorites, email, birthday
        formatted_users = []

        for match in similar_users:
            metadata = match['metadata']

            # Extract and parse goals (might be JSON string from ChromaDB)
            goals = metadata.get('goals', [])
            if isinstance(goals, str):
                import json
                try:
                    goals = json.loads(goals)
                except:
                    goals = []

            # Top 3 goals only
            goals = goals[:3] if isinstance(goals, list) else []

            formatted_user = SimilarUser(
                user_id=match['user_id'],
                name=metadata.get('name', 'Unknown'),
                major=metadata.get('major', 'Not specified'),
                location=metadata.get('location', 'Not specified'),
                goals=goals
            )
            formatted_users.append(formatted_user)

        return SimilarUsersResponse(
            user_id=user_id,
            total_matches=len(formatted_users),
            similar_users=formatted_users
        )

    except ValueError as e:
        # User not found in database
        raise HTTPException(
            status_code=404,
            detail=f"User not found. Make sure preferences have been added first."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to find similar users: {str(e)}"
        )


@app.get("/api/stats")
async def get_stats():
    """
    Get database statistics

    Returns:
        - Total users in matching pool
        - Embedding model details
        - Database info
    """
    try:
        user_count = vector_db.count_users()

        return {
            "status": "online",
            "total_users": user_count,
            "test_users": 100,
            "new_users": max(0, user_count - 100),
            "database": {
                "type": "ChromaDB",
                "embedding_dimension": 384,
                "model": "all-MiniLM-L6-v2",
                "similarity_metric": "cosine"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get stats: {str(e)}"
        )


# ============================================================================
# Run Server
# ============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 Graduate Support API")
    print("=" * 70)
    print(f"📊 Database: {vector_db.count_users()} users loaded")
    print(f"🔗 API Docs: http://localhost:8000/docs")
    print(f"💚 Health Check: http://localhost:8000/")
    print("=" * 70)

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )