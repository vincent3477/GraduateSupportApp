"""
ADDED EVERYTHING FROM TASK_MANAGER.PY INTO THIS FILE, FOR CONSISTENT API CALLS BETWEEN FRONTEND AND BACKEND INTO JUST ONE SERVER
FastAPI Backend for Graduate Support App

Hybrid approach:
- Uses 100 pre-loaded test users for demo
- Allows new users to join and be stored in ChromaDB
- Everyone matches with everyone (test + new users)

"""

from fastapi import FastAPI, HTTPException, Query, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import uvicorn
import requests
import json
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone

from user_onboarding import (
    create_user_session,
    update_user_preferences,
    get_user_session,
    get_all_sessions,
    clear_all_sessions
)
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
# Authentication & Agent Integration
# ============================================================================

SECRET_KEY = 'test_key'  # TODO: Move to environment variable for production
users_list = {}  # In-memory storage for authenticated users

def ask_agent(goals):
    """Query the Toolhouse agent with user goals"""
    agent_id = "de98c4c0-988b-4f31-9476-faf1ebf66e65"
    url = f"https://agents.toolhouse.ai/{agent_id}"

    payload = {"message": f"{goals}"}
    headers = {}

    print("about to passin in the request, ", payload)

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            return response.text  # This should be a JSON string
        else:
            print(f"Failed to query agent. Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error querying agent: {str(e)}")
        return None


def parse_agent_response(json_string: str) -> Optional[List[Dict[str, Any]]]:
    """
    Parse the agent's JSON response
    Agent returns: [{name: str, desc: str, completed: bool}, ...]

    Args:
        json_string: JSON string from the agent

    Returns:
        List of card dictionaries or None if parsing fails
    """
    try:
        # Parse the JSON string
        print("string we got is ", json_string)
        cards = json.loads(json_string)

        # Validate that it's a list
        if not isinstance(cards, list):
            print(f"Error: Expected a list, got {type(cards).__name__}")
            return None

        # Validate and clean each card
        validated_cards = []
        for idx, card in enumerate(cards):
            if not isinstance(card, dict):
                print(f"Warning: Item at index {idx} is not a dictionary, skipping")
                continue

            # Extract fields (agent format is already correct)
            print(idx, type(card), card)

            name = card.get("name", f"Task {idx + 1}")
            desc = card.get("desc", "")
            completed = card.get("completed", False)

            # Type validation and conversion
            if not isinstance(name, str):
                name = str(name)
            if not isinstance(desc, str):
                desc = str(desc)
            if not isinstance(completed, bool):
                completed = bool(completed)

            validated_cards.append({
                "name": name.strip(),
                "desc": desc.strip(),
                "completed": completed
            })

        return validated_cards

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON from agent - {str(e)}")
        return None
    except Exception as e:
        print(f"Error parsing agent response: {str(e)}")
        return None


def update_user_preference(card_name: str, completed: bool):
    """
    Update user preference for card completion status

    This is a placeholder function for future implementation.
    Currently used by the update-card endpoint but doesn't persist data.

    Args:
        card_name: Name of the recommendation card
        completed: Whether the card has been completed

    TODO: Implement persistent storage of card completion status
    """
    pass  # Placeholder - implement persistence later


def get_current_user(request: Request):
    """Extracts and verifies JWT token from Authorization header"""
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="No token provided")

    token = auth_header.split(' ')[1]

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return {
            "user_id": decoded['user_id'],
            "email": decoded['email']
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

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


class UpdateCardRequest(BaseModel):
    """Schema for updating card completion status"""
    card_name: str
    completed: bool = False


class LoginRequest(BaseModel):
    """Schema for login credentials"""
    email: str
    password: str


class RegisterRequest(BaseModel):
    """Schema for user registration"""
    email: str
    password: str
    name: str


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
            "user_management": {
                "create_user": "POST /api/users",
                "add_preferences": "POST /api/users/{user_id}/preferences",
                "find_similar": "GET /api/users/{user_id}/similar",
                "stats": "GET /api/stats"
            },
            "recommendations": {
                "get_recommendations": "GET /api/recommendations",
                "update_card": "POST /api/update-card"
            },
            "authentication": {
                "register": "POST /api/register",
                "login": "POST /api/login",
                "logout": "POST /api/logout",
                "verify_token": "GET /api/verify-token"
            }
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


@app.get("/api/recommendations")
async def get_recommendations_endpoint(
    name: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    favorites: List[str] = Query([]),
    goals: List[str] = Query([]),
    # current_user: dict = Depends(get_current_user)  # Auth disabled for demo
):
    """
    Generate AI-powered recommendations using Toolhouse agent

    Takes user profile data and returns personalized career recommendations.

    Parameters:
        name: User's name
        major: User's major/degree
        location: User's location
        favorites: List of favorite activities/interests
        goals: List of career goals

    Returns:
        List of recommendation cards: [{name, desc, completed}, ...]
    """
    print(f"📥 Received recommendations request:")
    print(f"   name={name}, major={major}, location={location}")
    print(f"   favorites={favorites}")
    print(f"   goals={goals}")

    # Build query for Toolhouse agent
    query_parts = []
    if name:
        query_parts.append(f"User: {name}")
    if major:
        query_parts.append(f"Major: {major}")
    if location:
        query_parts.append(f"Location: {location}")
    if favorites:
        query_parts.append(f"Interests: {', '.join(favorites)}")
    if goals:
        query_parts.append(f"Goals: {', '.join(goals)}")
    agent_query = ". ".join(query_parts) if query_parts else "Generate personalized recommendations"

    print("🤖 Querying Toolhouse agent...")
    agent_response = ask_agent(agent_query)
    if not agent_response:
        raise HTTPException(status_code=500, detail="Failed to get response from agent")

    cards = parse_agent_response(agent_response)
    if cards is None:
        raise HTTPException(status_code=500, detail="Failed to parse agent response")

    print(f"📤 Returning {len(cards)} recommendation cards")
    return cards


@app.post("/api/update-card")
async def update_card_endpoint(request: UpdateCardRequest):
    """
    Update a card's completion status

    This endpoint is a placeholder for tracking which recommendations
    users have completed. Currently returns success without persistence.

    Parameters:
        request: UpdateCardRequest with card_name and completed status

    Returns:
        Success status with card details
    """
    if not request.card_name:
        raise HTTPException(status_code=400, detail="card_name is required")

    # TODO: Implement persistent storage of card completion status
    return {
        "success": True,
        "card_name": request.card_name,
        "completed": request.completed
    }


@app.post('/api/login')
def login(credentials: LoginRequest):
    """
    Authenticate user and return JWT token

    Parameters:
        credentials: LoginRequest with email and password

    Returns:
        JWT token and user details
    """
    email = credentials.email
    password = credentials.password

    # Check if user exists
    user = users_list.get(email)

    if not user or not check_password_hash(user['password_hash'], password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate JWT token
    token = jwt.encode({
        'user_id': user['id'],
        'email': user['email'],
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        }
    }


@app.post('/api/logout')
def logout():
    """
    Logout endpoint (stateless - client should discard token)

    Returns:
        Success message
    """
    return {"success": True, "message": "Logged out successfully"}


@app.post('/api/register')
def register(data: RegisterRequest):
    """
    Register a new user account

    Parameters:
        data: RegisterRequest with email, password, and name

    Returns:
        JWT token and user details
    """
    email = data.email
    password = data.password
    name = data.name

    # Check if user already exists
    if email in users_list:
        raise HTTPException(status_code=400, detail="User already exists")

    # Create new user
    user_id = len(users_list) + 1
    users_list[email] = {
        "id": user_id,
        "email": email,
        "name": name,
        "password_hash": generate_password_hash(password)
    }

    # Generate JWT token
    token = jwt.encode({
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": name
        }
    }


@app.get('/api/verify-token')
def verify_token(request: Request):
    """
    Verify JWT token validity

    Checks Authorization header for valid Bearer token.

    Returns:
        User ID and email from token
    """
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="No token provided")

    token = auth_header.split(' ')[1]

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return {
            "success": True,
            "user_id": decoded['user_id'],
            "email": decoded['email']
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


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