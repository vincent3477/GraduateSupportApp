from fastapi import FastAPI, Query, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import List, Dict, Any, Optional
import requests
from pydantic import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, timezone



# CREATE THE APP INSTANCE
app = FastAPI()

SECRET_KEY = 'test_key'


# ADD CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

users_list = {}

"""
User Onboarding Handler
Handles user input from the onboarding form

How Data Flows Through This File:

  1. Frontend submits form
     ↓
  2. create_user_session() called with user data
     ↓
  3. Generate unique user ID
     ↓
  4. Create session object with all data (flat structure)
     ↓
  5. Store in user_sessions dictionary
     ↓
  6. Return user object with 'id' field (matches frontend)
     ↓
  7. Frontend saves user.id in localStorage
     ↓
  8. Later: get_user_session(id) retrieves data using ID
     ↓
  9. Later: update_user_preferences(id) adds goals/favorites

"""

import uuid  # for creating unique ids for each user session
from datetime import datetime  # for marking when a session was created

# In-memory storage for user sessions
user_sessions = {}
#  What it is: An empty Python dictionary (like a Map in JavaScript)
#  Purpose: Stores all user sessions while the program runs
#  Structure:
#  {
#   "user-id-1": { user data },
#    "user-id-2": { user data },
#    ...
#  }


def create_user_session(user_data):
    """
    Creates a new user session from onboarding form data.

    Args:
        user_data (dict): Dictionary containing user input from frontend
            - name (str): User's full name
            - email (str): User's email address
            - birthday (str, optional): User's birthday
            - major (str, optional): User's major/degree
            - location (str, optional): User's location

    Returns:
        dict: User data with id (flat structure to match frontend)
        {
            'id': str,
            'name': str,
            'email': str,
            'birthday': str,
            'major': str,
            'location': str,
            'createdAt': str

        }
    """

    # Validate required fields
    if not user_data.get('name') or not user_data.get('email'):
        raise ValueError("Name and email are required fields")

    # Generate unique user ID (matches frontend's 'id' field)
    user_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()

    # Create session object for internal storage
    # (stores flat structure with extra fields: preferences, recommendations)
    session = {
        'id': user_id,
        'name': user_data.get('name'),
        'email': user_data.get('email'),
        'birthday': user_data.get('birthday', ''),
        'major': user_data.get('major', ''),
        'location': user_data.get('location', ''),
        'preferences': None,  # Will be filled later
        'recommendations': None,  # Will be filled later with Toolhouse
        'createdAt': created_at
    }

    # Store in memory using id as key
    user_sessions[user_id] = session

    # Return structure that matches frontend
    # Frontend expects: { id, name, email, birthday, major, location, createdAt }
    return {
        'id': user_id,
        'name': session['name'],
        'email': session['email'],
        'birthday': session['birthday'],
        'major': session['major'],
        'location': session['location'],
        'createdAt': created_at
    }


def get_user_session(user_id):
    """
    Retrieves a user session by user ID.

    Args:
        user_id (str): The user's unique ID

    Returns:
        dict: Session data or None if not found
    """
    return user_sessions.get(user_id)

# post
def update_user_preferences(user_id, preferences):
    """
    Updates user session with preferences from Step 2 (favorites + goals).

    Args:
        user_id (str): The user's unique ID
        preferences (dict): Dictionary containing:
            - favorites (list): Up to 3 favorite activities
            - goals (list): Up to 3 goals

    Returns:
        dict: Updated session data or None if user not found
    """
    session = user_sessions.get(user_id)

    if not session:
        return None

    session['preferences'] = {
        'favorites': preferences.get('favorites', []),
        'goals': preferences.get('goals', [])
    }

    return session


def get_all_sessions():
    """
    Returns all stored sessions (for debugging).

    Returns:
        dict: All user sessions
    """
    return user_sessions


def clear_all_sessions():
    """
    Clears all sessions from memory (for testing/reset).
    """
    user_sessions.clear()




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
    """Black box function to update user preferences"""
    pass  # Implemented elsewhere


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

# ===== FastAPI ENDPOINTS =====

@app.get("/api/recommendations")
async def get_recommendations_endpoint(
    name: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    favorites: List[str] = Query([]),
    goals: List[str] = Query([]),
# current_user: dict = Depends(get_current_user)
):
    """
    GET endpoint to generate recommendations
    Returns: JSON array of cards [{name, desc, completed}, ...]
    """
    print(f"📥 Received request:")
    print(f"   name={name}, major={major}, location={location}")
    print(f"   favorites={favorites}")
    print(f"   goals={goals}")

    # user_id = current_user['user_id']
    
    # Build query for agent
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
    
    # For testing, use mock data that matches agent format
    # REMOVE THIS when ready to use real agent
    #mock_agent_json = json.dumps([
    #    {
    #        "name": f"Master {major or 'your field'}",
    #        "desc": f"Deep dive into {major or 'core'} fundamentals and advanced concepts",
    #        "completed": False
    #    },
    #    {
    #        "name": f"Network in {location or 'your area'}",
    #        "desc": f"Attend tech meetups and conferences in {location or 'your city'}",
    #        "completed": False
    #    },
    #    {
    #        "name": "Apply to 10 companies",
    #        "desc": "Submit tailored applications to target companies based on your goals",
    #        "completed": False
    #    }
    #])
    print("quering agent")
    # UNCOMMENT THIS when ready to use real agent:
    agent_response = ask_agent(agent_query)
    if not agent_response:
         raise HTTPException(status_code=500, detail="Failed to get response from agent")
    cards = parse_agent_response(agent_response)
    print(type(cards))
    print(cards)
    if cards is None:
        raise HTTPException(status_code=500, detail="Failed to parse agent response")
    
    print(f"📤 Returning {len(cards)} cards")
    return cards  # FastAPI automatically converts list to JSON response


@app.post("/api/update-card")
async def update_card_endpoint(request: dict):

    """POST endpoint to update a card's completion status"""
    card_name = request.get("card_name")
    completed = request.get("completed", False)
    
    if not card_name:
        raise HTTPException(status_code=400, detail="card_name is required")
    
    try:
        update_user_preference(card_name, completed)
        return {
            "success": True,
            "card_name": card_name,
            "completed": completed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class UpdateCardRequest(BaseModel):
    card_name: str
    completed: bool = False

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

# Routes
@app.post("/api/update-card")
async def update_card_endpoint(request: UpdateCardRequest):
    """POST endpoint to update a card's completion status"""
    if not request.card_name:
        raise HTTPException(status_code=400, detail="card_name is required")
    
    # try:
    #     update_user_preference(request.card_name, request.completed)
    #     return {
    #         "success": True,
    #         "card_name": request.card_name,
    #         "completed": request.completed
    #     }
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/login')
def login(credentials: LoginRequest):
    email = credentials.email
    password = credentials.password
    
    # Check if user exists (FIXED: was request.get(email), should be users_list.get(email))
    user = users_list.get(email)
    
    if not user or not check_password_hash(user['password_hash'], password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
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
    return {"success": True, "message": "Logged out successfully"}
    

@app.post('/api/register')
def register(data: RegisterRequest):
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
    print("after users lists added", data)
    # Generate token
    token = jwt.encode({
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }, SECRET_KEY, algorithm='HS256')
    print("error here?")
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