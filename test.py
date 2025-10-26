import json


mock_agent_json = json.dumps([

        {
            "name": f"Master {'your field'}",
            "desc": f"Deep dive into fundamentals and advanced concepts",
            "completed": False
        },
        {
            "name": f"Network in {'your area'}",
            "desc": f"Attend tech meetups and conferences in {'your city'}",
            "completed": False
        },
        {
            "name": "Apply to 10 companies",
            "desc": "Submit tailored applications to target companies based on your goals",
            "completed": False
        }
    ])

print(mock_agent_json)
print(type(mock_agent_json))