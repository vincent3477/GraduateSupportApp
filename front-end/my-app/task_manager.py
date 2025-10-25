from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import List, Dict, Any, Optional
import requests

# CREATE THE APP INSTANCE
app = FastAPI()

# ADD CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ask_agent(goals):
    """Query the Toolhouse agent with user goals"""
    agent_id = "de98c4c0-988b-4f31-9476-faf1ebf66e65"
    url = f"https://agents.toolhouse.ai/{agent_id}"
    
    payload = {"message": f"{goals}"}
    headers = {}
    
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


# ===== FastAPI ENDPOINTS =====

@app.get("/api/recommendations")
async def get_recommendations_endpoint(
    name: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    favorites: List[str] = Query([]),
    goals: List[str] = Query([])
):
    """
    GET endpoint to generate recommendations
    Returns: JSON array of cards [{name, desc, completed}, ...]
    """
    print(f"📥 Received request:")
    print(f"   name={name}, major={major}, location={location}")
    print(f"   favorites={favorites}")
    print(f"   goals={goals}")
    
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
    mock_agent_json = json.dumps([
        {
            "name": f"Master {major or 'your field'}",
            "desc": f"Deep dive into {major or 'core'} fundamentals and advanced concepts",
            "completed": False
        },
        {
            "name": f"Network in {location or 'your area'}",
            "desc": f"Attend tech meetups and conferences in {location or 'your city'}",
            "completed": False
        },
        {
            "name": "Apply to 10 companies",
            "desc": "Submit tailored applications to target companies based on your goals",
            "completed": False
        }
    ])
    
    # UNCOMMENT THIS when ready to use real agent:
    # agent_response = ask_agent(agent_query)
    # if not agent_response:
    #     raise HTTPException(status_code=500, detail="Failed to get response from agent")
    # cards = parse_agent_response(agent_response)
    
    # Using mock data for now
    cards = parse_agent_response(mock_agent_json)
    
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


