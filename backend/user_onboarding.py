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


# EXAMPLE TEST USAGE:
if __name__ == "__main__":
    # Test the functions
    print("Testing user_onboarding.py...")

    # Create a test user
    test_user = {
        'name': 'Victor Chen',
        'email': 'vchen44@ucsc.edu',
        'birthday': '2004-09-19',
        'major': 'Computer Science',
        'location': 'Santa Cruz, CA'
    }

    # Create session
    user = create_user_session(test_user)
    print(f"\nCreated user: {user['id']}")
    print(f"  Name: {user['name']}")
    print(f"  Email: {user['email']}")
    print(f"  Major: {user['major']}")
    print(f"  Location: {user['location']}")

    # Retrieve session
    retrieved = get_user_session(user['id'])
    print(f"\nRetrieved session: {retrieved['id']}")
    print(f"  Name: {retrieved['name']}")

    # Update with preferences
    prefs = {
        'favorites': ['Producing music', 'Reading fantasy', 'Gym'],
        'goals': ['Land a SWE role', 'Network', 'Build portfolio']
    }
    updated = update_user_preferences(user['id'], prefs)
    print(f"\nUpdated preferences:")
    print(f"  Favorites: {updated['preferences']['favorites']}")
    print(f"  Goals: {updated['preferences']['goals']}")

    # Show all sessions
    print(f"\nTotal sessions in memory: {len(get_all_sessions())}")
