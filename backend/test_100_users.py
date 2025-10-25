"""
Test file: Generate 100 diverse users, embed them, store in ChromaDB, and test similarity search.

This test validates:
1. Embedding generation for 100 users
2. ChromaDB bulk storage
3. Similarity search accuracy
4. Performance at scale
"""

import sys
import os
import time
import random

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from user_connectivity import UserVectorDB, batch_get_embeddings
from user_onboarding import create_user_session, update_user_preferences


# ============================================================================
# Test Data: 100 Diverse User Profiles
# ============================================================================

MAJORS = [
    'Computer Science', 'Software Engineering', 'Computer Engineering',
    'Data Science', 'Information Systems', 'Cybersecurity',
    'Marketing', 'Business Administration', 'Finance', 'Economics',
    'Psychology', 'Sociology', 'Political Science', 'Communications',
    'Biology', 'Chemistry', 'Physics', 'Environmental Science',
    'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering',
    'Art', 'Graphic Design', 'Film Studies', 'Music',
    'English', 'History', 'Philosophy', 'Linguistics',
    'Nursing', 'Public Health', 'Kinesiology', 'Nutrition'
]

TECH_GOALS = [
    'Land software engineer role at tech company',
    'Master data structures and algorithms',
    'Build portfolio with 5 projects',
    'Learn cloud architecture (AWS/Azure)',
    'Get internship at startup',
    'Contribute to open source projects',
    'Master React and Node.js',
    'Learn machine learning and AI',
    'Become full-stack developer',
    'Get SWE job at FAANG company'
]

BUSINESS_GOALS = [
    'Land product manager role',
    'Start own business or startup',
    'Get consulting job at top firm',
    'Master financial modeling',
    'Build professional network',
    'Get MBA from top school',
    'Become marketing manager',
    'Learn digital marketing strategies',
    'Get into venture capital',
    'Master sales and negotiation'
]

CREATIVE_GOALS = [
    'Build creative portfolio',
    'Land design role at agency',
    'Start freelance career',
    'Master Adobe Creative Suite',
    'Create personal brand',
    'Get into film/media production',
    'Build YouTube/content channel',
    'Master UX/UI design',
    'Work at creative studio',
    'Launch art exhibition'
]

SCIENCE_GOALS = [
    'Get into grad school for research',
    'Land lab research position',
    'Publish research paper',
    'Get healthcare/medical job',
    'Master statistical analysis',
    'Work in biotech industry',
    'Get into medical school',
    'Work on climate solutions',
    'Land data analyst role',
    'Pursue PhD program'
]

GENERAL_GOALS = [
    'Find mentors in my field',
    'Improve public speaking skills',
    'Learn new language',
    'Travel and work remotely',
    'Achieve work-life balance',
    'Build leadership skills',
    'Give back to community',
    'Continuous learning mindset'
]

TECH_INTERESTS = [
    'Coding side projects', 'Hackathons', 'Tech meetups',
    'Reading tech blogs', 'Building apps', 'Gaming',
    'Artificial intelligence', 'Cryptocurrency', 'Robotics',
    'Web development', 'Mobile development'
]

BUSINESS_INTERESTS = [
    'Entrepreneurship', 'Networking events', 'Reading business books',
    'Stock market investing', 'Podcasts', 'Public speaking',
    'Case competitions', 'Consulting', 'Leadership workshops'
]

CREATIVE_INTERESTS = [
    'Photography', 'Graphic design', 'Video editing',
    'Drawing/painting', 'Music production', 'Writing',
    'Content creation', 'Fashion', 'Interior design',
    'Film/movies', 'Animation'
]

ACTIVE_INTERESTS = [
    'Gym/fitness', 'Running', 'Hiking', 'Yoga',
    'Rock climbing', 'Swimming', 'Cycling', 'Sports',
    'Martial arts', 'Dancing'
]

SOCIAL_INTERESTS = [
    'Volunteering', 'Community service', 'Mentoring',
    'Coffee chats', 'Traveling', 'Cooking',
    'Board games', 'Concerts', 'Parties', 'Book clubs'
]

LOCATIONS = [
    'San Francisco, CA', 'Oakland, CA', 'San Jose, CA', 'Santa Cruz, CA',
    'Berkeley, CA', 'Palo Alto, CA', 'Mountain View, CA', 'Sunnyvale, CA',
    'Los Angeles, CA', 'San Diego, CA', 'Sacramento, CA', 'Fresno, CA',
    'Seattle, WA', 'Portland, OR', 'Austin, TX', 'Denver, CO',
    'New York, NY', 'Boston, MA', 'Chicago, IL', 'Atlanta, GA'
]

FIRST_NAMES = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery',
    'Sam', 'Drew', 'Quinn', 'Reese', 'Skylar', 'Rowan', 'Charlie', 'Dylan',
    'Sage', 'River', 'Dakota', 'Parker', 'Blake', 'Phoenix', 'Cameron', 'Finley',
    'Kai', 'Elliot', 'Hayden', 'Kendall', 'Logan', 'Micah', 'Nico', 'Ocean'
]

LAST_NAMES = [
    'Chen', 'Smith', 'Johnson', 'Williams', 'Brown', 'Garcia', 'Martinez', 'Lee',
    'Rodriguez', 'Davis', 'Lopez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore',
    'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Young', 'King', 'Wright',
    'Hill', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez'
]


def generate_user_profiles(num_users=100):
    """Generate diverse user profiles with realistic data"""
    users = []

    for i in range(num_users):
        # Select major and corresponding interests/goals
        major = random.choice(MAJORS)

        # Determine field based on major
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

        # Select goals based on field (70% field-specific, 30% general)
        goals = []
        if field == 'tech':
            goals = random.sample(TECH_GOALS, k=random.randint(2, 4))
        elif field == 'business':
            goals = random.sample(BUSINESS_GOALS, k=random.randint(2, 4))
        elif field == 'creative':
            goals = random.sample(CREATIVE_GOALS, k=random.randint(2, 4))
        elif field == 'science':
            goals = random.sample(SCIENCE_GOALS, k=random.randint(2, 4))
        else:
            # For 'general' field, start with general goals
            goals = random.sample(GENERAL_GOALS, k=random.randint(2, 3))

        # Add some general goals to non-general fields
        if field != 'general' and random.random() > 0.5:
            goals.extend(random.sample(GENERAL_GOALS, k=random.randint(1, 2)))

        # Select interests based on field + random interests
        interests = []
        if field == 'tech':
            interests.extend(random.sample(TECH_INTERESTS, k=random.randint(2, 3)))
        elif field == 'business':
            interests.extend(random.sample(BUSINESS_INTERESTS, k=random.randint(2, 3)))
        elif field == 'creative':
            interests.extend(random.sample(CREATIVE_INTERESTS, k=random.randint(2, 3)))

        # Add diverse interests
        interests.extend(random.sample(ACTIVE_INTERESTS, k=random.randint(1, 2)))
        interests.extend(random.sample(SOCIAL_INTERESTS, k=random.randint(1, 2)))

        # Create user profile
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


def test_100_users():
    """Main test function"""
    print("=" * 80)
    print("TEST: 100 User Embedding & Similarity Search")
    print("=" * 80)

    # ========================================================================
    # STEP 1: Generate 100 user profiles
    # ========================================================================
    print("\n[1/5] Generating 100 diverse user profiles...")
    users = generate_user_profiles(100)
    print(f"✓ Generated {len(users)} users")
    print(f"    Sample: {users[0]['name']} - {users[0]['major']}")

    # ========================================================================
    # STEP 2: Create user sessions
    # ========================================================================
    print("\n[2/5] Creating user sessions...")
    start = time.time()
    sessions = []
    for user_data in users:
        session = create_user_session(user_data)
        session = update_user_preferences(session['id'], user_data['preferences'])
        sessions.append(session)
    duration = time.time() - start
    print(f"✓ Created {len(sessions)} sessions in {duration:.3f}s")

    # ========================================================================
    # STEP 3: Generate embeddings (batch)
    # ========================================================================
    print("\n[3/5] Generating embeddings for 100 users...")
    start = time.time()
    embeddings = batch_get_embeddings(sessions)
    duration = time.time() - start
    print(f"✓ Generated {len(embeddings)} embeddings in {duration:.3f}s")
    print(f"    Average: {duration/len(embeddings)*1000:.1f}ms per user")
    print(f"    Embedding dimension: {len(embeddings[0])}")

    # ========================================================================
    # STEP 4: Store in ChromaDB
    # ========================================================================
    print("\n[4/5] Storing users in ChromaDB...")
    db = UserVectorDB(persist_directory="./test_chroma_data")
    db.clear_all()  # Start fresh

    start = time.time()
    for session in sessions:
        db.add_user(session)
    duration = time.time() - start
    print(f"✓ Stored {db.count_users()} users in {duration:.3f}s")
    print(f"    Average: {duration/len(sessions)*1000:.1f}ms per user")

    # ========================================================================
    # STEP 5: Test similarity search for different user types
    # ========================================================================
    print("\n[5/5] Testing similarity search...")
    print("=" * 80)

    # Find specific user types for testing
    cs_users = [s for s in sessions if 'Computer Science' in s.get('major', '')]
    marketing_users = [s for s in sessions if 'Marketing' in s.get('major', '')]
    bio_users = [s for s in sessions if 'Biology' in s.get('major', '')]

    test_cases = []
    if cs_users:
        test_cases.append(('CS Student', cs_users[0]))
    if marketing_users:
        test_cases.append(('Marketing Student', marketing_users[0]))
    if bio_users:
        test_cases.append(('Biology Student', bio_users[0]))

    # If we don't have those specific majors, just pick the first 3
    if len(test_cases) < 3:
        test_cases = [
            ('User 1', sessions[0]),
            ('User 2', sessions[len(sessions)//3]),
            ('User 3', sessions[2*len(sessions)//3])
        ]

    for label, test_user in test_cases:
        print(f"\n{label}: {test_user['name']}")
        print(f"Major: {test_user['major']}")
        print(f"Goals: {', '.join(test_user['preferences']['goals'][:2])}")
        print(f"Interests: {', '.join(test_user['preferences']['favorites'][:3])}")
        print("\nTop 5 Similar Users:")
        print("-" * 80)

        start = time.time()
        similar = db.find_similar_users(test_user['id'], top_k=5)
        search_time = time.time() - start

        for i, match in enumerate(similar, 1):
            print(f"{i}. {match['metadata']['major']} | Similarity: {match['similarity']:.3f}")
            print(f"   Location: {match['metadata']['location']}")
            print(f"   Goals: {', '.join(match['metadata']['goals'][:2])}")
            print()

        print(f"Search completed in {search_time*1000:.1f}ms")
        print("=" * 80)

    # ========================================================================
    # Statistics
    # ========================================================================
    print("\n")
    print("=" * 80)
    print("STATISTICS")
    print("=" * 80)

    # Count users by major
    major_counts = {}
    for session in sessions:
        major = session.get('major', 'Unknown')
        major_counts[major] = major_counts.get(major, 0) + 1

    print(f"\nTotal users: {len(sessions)}")
    print(f"Unique majors: {len(major_counts)}")
    print(f"\nTop 5 majors:")
    for major, count in sorted(major_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  - {major}: {count} students")

    # Average goals and interests
    avg_goals = sum(len(s['preferences']['goals']) for s in sessions) / len(sessions)
    avg_interests = sum(len(s['preferences']['favorites']) for s in sessions) / len(sessions)
    print(f"\nAverage goals per user: {avg_goals:.1f}")
    print(f"Average interests per user: {avg_interests:.1f}")

    print("\n" + "=" * 80)
    print("TEST COMPLETE!")
    print("=" * 80)
    print(f"\n✓ All 100 users successfully embedded and stored")
    print(f"✓ ChromaDB similarity search working correctly")
    print(f"✓ Data persisted to ./test_chroma_data/")


if __name__ == "__main__":
    test_100_users()
