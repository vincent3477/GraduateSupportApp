import requests
import json

def ask_agent(goals):

    # Replace with your actual agent ID from Toolhouse
    agent_id = "de98c4c0-988b-4f31-9476-faf1ebf66e65"

    # The URL of your agent's API endpoint
    url = f"https://agents.toolhouse.ai/{agent_id}"

    # Your message to the agent
    payload = {
        "message": f"{goals}"
    }

    # If your agent is private, include your Toolhouse API key here
    headers = {
        # Uncomment the next line if your agent is private
        # "Authorization": "Bearer YOUR_TOOLHOUSE_API_KEY"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        return response.text
    else:
        print(f"Failed to query agent. Status code: {response.status_code}")
        print(response.text)


def generate_cards(file):
    print(file)
    data = json.loads(file)
    return data


"""
How tasks be listed out:
- they should be a longer term goal
- what kind of category
- description
- a checkbox attribute, if checked = true then remove from sql remove flashcard from display..

"""
def main():
    question = input("ask agent here")
    result = ask_agent(question) 
    cards = generate_cards(result)
    print(cards)

if __name__ == "__main__":
    main()