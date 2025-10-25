import requests
import json
from typing import List, Dict, Any, Optional

def ask_agent(goals):
    """Query the Toolhouse agent with user goals"""
    agent_id = "de98c4c0-988b-4f31-9476-faf1ebf66e65"
    url = f"https://agents.toolhouse.ai/{agent_id}"
    
    payload = {
        "message": f"{goals}"
    }
    
    headers = {
        # Uncomment and add your API key if agent is private
        # "Authorization": "Bearer YOUR_TOOLHOUSE_API_KEY"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            return response.text
        else:
            print(f"Failed to query agent. Status code: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error querying agent: {str(e)}")
        return None


def generate_cards(file: str) -> Optional[List[Dict[str, Any]]]:
    """
    Parse the agent response and generate structured cards
    Expected format from agent: JSON array of objects
    Returns: List with structure [{name: str, desc: str, completed: bool}]
    """
    try:
        # Parse the JSON string
        data = json.loads(file)
        
        # Validate that data is a list
        if not isinstance(data, list):
            print(f"Error: Expected a list, got {type(data).__name__}")
            return None
        
        if len(data) == 0:
            print("Warning: Empty list received from agent")
            return []
        
        # Structure and validate each card
        structured_cards = []
        for idx, card in enumerate(data):
            # Validate that each item is a dictionary
            if not isinstance(card, dict):
                print(f"Warning: Item at index {idx} is not a dictionary, skipping")
                continue
            
            # Extract and validate required fields
            name = card.get("name") or card.get("title") or f"Task {idx + 1}"
            desc = card.get("desc") or card.get("description") or ""
            completed = card.get("completed") or card.get("is_completed") or False
            
            # Type checking and conversion
            if not isinstance(name, str):
                name = str(name)
            
            if not isinstance(desc, str):
                desc = str(desc)
            
            if not isinstance(completed, bool):
                # Convert to boolean if it's a string or number
                if isinstance(completed, str):
                    completed = completed.lower() in ['true', '1', 'yes']
                else:
                    completed = bool(completed)
            
            structured_card = {
                "name": name.strip(),
                "desc": desc.strip(),
                "completed": completed
            }
            
            structured_cards.append(structured_card)
        
        return structured_cards
    
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {str(e)}")
        return None
    except Exception as e:
        print(f"Error generating cards: {str(e)}")
        return None


# Placeholder for the black box function
def update_user_preference(card_name: str, completed: bool):
    """
    Black box function to update user preferences
    This is implemented elsewhere - just call it when needed
    
    Args:
        card_name: The name of the card being updated
        completed: New completion status (True/False)
    """
    pass  # Implementation handled by another module


def handle_card_completion(card_name: str, completed: bool, cards: List[Dict[str, Any]]) -> Optional[List[Dict[str, Any]]]:
    """
    Handle when a card's checkbox is toggled
    Updates the card state and calls the black box preference update function
    
    Args:
        card_name: The name of the card being updated
        completed: New completion status (True/False)
        cards: Current list of all cards
    
    Returns:
        Updated list of cards, or None if card not found
    """
    if not cards or not isinstance(cards, list):
        print("Error: Invalid cards list")
        return cards
    
    updated_cards = []
    card_found = False
    
    for card in cards:
        if card["name"] == card_name:
            card_found = True
            # Update the card's completion status
            card["completed"] = completed
            
            # Call the black box function to persist the change
            try:
                update_user_preference(card_name, completed)
                print(f"✓ Card '{card['name']}' marked as {'completed' if completed else 'incomplete'}")
            except Exception as e:
                print(f"✗ Error updating preference for card '{card_name}': {str(e)}")
                # Optionally revert the change if the API call fails
                # card["completed"] = not completed
        
        updated_cards.append(card)
    
    if not card_found:
        print(f"Warning: Card with name '{card_name}' not found")
        return cards  # Return original cards unchanged
    
    return updated_cards


def get_cards_json(cards: List[Dict[str, Any]]) -> str:
    """
    Convert cards to JSON string for API response
    This is what you'd return to the frontend
    """
    if cards is None:
        return json.dumps({
            "success": False,
            "error": "Failed to generate cards",
            "cards": []
        }, indent=2)
    
    return json.dumps(cards, indent=2)


# Example usage for testing the prototype
if __name__ == "__main__":
    print("=== Card Generation Prototype ===\n")
    
    # Example agent response in the new format
    mock_agent_response = json.dumps([
        {
            "name": "Learn Python basics",
            "desc": "Complete Python fundamentals course including variables, loops, and functions",
            "completed": False
        },
        {
            "name": "Build a web scraper",
            "desc": "Create a scraper for news articles using BeautifulSoup",
            "completed": False
        },
        {
            "name": "Set up development environment",
            "desc": "Install VS Code, Python, and necessary extensions",
            "completed": True
        }
    ])
    
    # Generate cards from mock response
    cards = generate_cards(mock_agent_response)
    
    if cards is None:
        print("Failed to generate cards")
    elif len(cards) == 0:
        print("No cards generated")
    else:
        print(f"Generated {len(cards)} cards:\n")
        for card in cards:
            status = "✓" if card["completed"] else "○"
            print(f"{status} {card['name']}")
            print(f"   {card['desc']}")
            print()
        
        # Simulate checkbox interaction
        print("\n=== Simulating Checkbox Toggle ===\n")
        print("User checks 'Learn Python basics'...")
        #cards = handle_card_completion("Learn Python basics", True, cards)
        
        print("\nUser unchecks 'Set up development environment'...")
        #cards = handle_card_completion("Set up development environment", False, cards)
        
        # Show final JSON that would be sent to frontend
        print("\n=== Final JSON Response ===\n")
        #print(get_cards_json(cards))
    
    # Test error handling
    print("\n\n=== Testing Error Handling ===\n")
    
    # Test invalid JSON
    print("1. Testing invalid JSON:")
    result = generate_cards("not valid json")
    print(f"   Result: {result}\n")
    
    # Test non-list JSON
    print("2. Testing non-list JSON:")
    result = generate_cards('{"key": "value"}')
    print(f"   Result: {result}\n")
    
    # Test list with invalid items
    print("3. Testing list with mixed valid/invalid items:")
    mixed_data = json.dumps([
        {"name": "Valid task", "desc": "This is valid", "completed": False},
        "invalid string item",
        {"name": "Another valid task", "desc": "Also valid", "completed": True}
    ])
    result = generate_cards(mixed_data)
    print(f"   Result: {result}\n")
    
    # Test missing fields with fallbacks
    print("4. Testing missing fields:")
    missing_fields = json.dumps([
        {"name": "Task with all fields", "desc": "Full description", "completed": True},
        {"name": "Task without desc"},
        {"desc": "Task without name", "completed": False},
        {}
    ])
    result = generate_cards(missing_fields)
    print(f"   Result: {json.dumps(result, indent=2)}")