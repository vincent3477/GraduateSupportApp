"""
Add 400 more users to existing test_chroma_data database
This will bring the total to ~500 users
"""

import sys
import os
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from user_connectivity import UserVectorDB
from user_onboarding import create_user_session, update_user_preferences

# Import all the lists from test_100_users.py
from test_100_users import (
    MAJORS, TECH_GOALS, BUSINESS_GOALS, CREATIVE_GOALS, SCIENCE_GOALS, GENERAL_GOALS,
    TECH_INTERESTS, BUSINESS_INTERESTS, CREATIVE_INTERESTS, ACTIVE_INTERESTS, SOCIAL_INTERESTS,
    LOCATIONS, FIRST_NAMES, LAST_NAMES
)

def generate_user_profiles(num_users=400, start_id=100):
    """Generate diverse user profiles"""
    users = []

    for i in range(start_id, start_id + num_users):
        major = random.choice(MAJORS)

        # Determine field
        if major in ['Computer Science', 'Software Engineering', 'Computer Engineering',
                     'Data Science', 'Information Systems', 'Cybersecurity']:
            field = 'tech'
        elif major in ['Marketing', 'Business Administration', 'Finance', 'Economics']:
            field = 'business'
        elif major in ['Art', 'Graphic Design', 'Film Studies', 'Music', 'English']:
            field = 'creative'
        elif major in ['Biology', 'Chemistry', 'Physics', 'Environmental Science',
                      'Nursing', 'Public Health']:
            field = 'science'
        else:
            field = 'general'

        # Select goals (3 goals)
        goals = []
        if field == 'tech':
            goals.extend(random.sample(TECH_GOALS, k=2))
        elif field == 'business':
            goals.extend(random.sample(BUSINESS_GOALS, k=2))
        elif field == 'creative':
            goals.extend(random.sample(CREATIVE_GOALS, k=2))
        elif field == 'science':
            goals.extend(random.sample(SCIENCE_GOALS, k=2))
        else:
            goals.extend(random.sample(GENERAL_GOALS, k=2))

        goals.append(random.choice(GENERAL_GOALS))

        # Select interests (5-7 interests)
        interests = []
        if field == 'tech':
            interests.extend(random.sample(TECH_INTERESTS, k=random.randint(2, 3)))
        elif field == 'business':
            interests.extend(random.sample(BUSINESS_INTERESTS, k=random.randint(2, 3)))
        elif field == 'creative':
            interests.extend(random.sample(CREATIVE_INTERESTS, k=random.randint(2, 3)))

        interests.extend(random.sample(ACTIVE_INTERESTS, k=random.randint(1, 2)))
        interests.extend(random.sample(SOCIAL_INTERESTS, k=random.randint(1, 2)))

        user = {
            'name': f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            'email': f"user{i}@example.com",
            'birthday': f"200{random.randint(0, 3)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            'major': major,
            'location': random.choice(LOCATIONS),
            'preferences': {
                'goals': goals,
                'favorites': interests
            }
        }

        users.append(user)

    return users


def add_400_users():
    """Add 400 users to existing database"""
    print("=" * 80)
    print("Adding 400 Users to Existing ChromaDB")
    print("=" * 80)

    # Connect to EXISTING database
    db = UserVectorDB(persist_directory="./test_chroma_data")

    # Check current count
    current_count = db.count_users()
    print(f"\n📊 Current users in database: {current_count}")

    # Generate 400 new profiles
    print("\n[1/3] Generating 400 new user profiles...")
    users = generate_user_profiles(400, start_id=current_count)
    print(f"✓ Generated {len(users)} users")

    # Create sessions and add to database
    print("\n[2/3] Adding users to ChromaDB...")
    added = 0
    for user_data in users:
        try:
            # Create session
            session = create_user_session(user_data)

            # Update preferences
            prefs = user_data['preferences']
            update_user_preferences(session['id'], prefs)

            # Add to ChromaDB
            db.add_user(session)
            added += 1

            if added % 50 == 0:
                print(f"  ✓ Added {added}/400 users...")
        except Exception as e:
            print(f"  ✗ Error adding user: {e}")

    print(f"\n✓ Successfully added {added} users")

    # Check final count
    print("\n[3/3] Verifying database...")
    final_count = db.count_users()
    print(f"✓ Total users in database: {final_count}")

    print("\n" + "=" * 80)
    print("✅ COMPLETE!")
    print("=" * 80)
    print(f"Added: {added} new users")
    print(f"Total: {final_count} users in ChromaDB")
    print("Restart app.py to see new count!")


if __name__ == "__main__":
    add_400_users()
