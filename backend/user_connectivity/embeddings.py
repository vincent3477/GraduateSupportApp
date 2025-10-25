"""
Embedding generation for user profiles.

This module converts user session data into vector embeddings that capture
semantic meaning. Similar users will have similar embedding vectors, enabling
intelligent user matching and recommendations.

Key Functions:
    - create_user_text(): Converts user session to natural language text
    - get_user_embedding(): Generates 384-dimensional embedding vector
    - get_embedding_dimension(): Returns the embedding dimensionality

"""

from sentence_transformers import SentenceTransformer

# Load the embedding model once at module import (cached for reuse)
# Model: all-MiniLM-L6-v2
# - Small and fast (~80MB)
# - 384-dimensional embeddings
# - Good balance of speed and quality
# - Perfect for sentence/paragraph encoding
model = SentenceTransformer('all-MiniLM-L6-v2')


def create_user_text(session):
    """
    Preprocessing before actual embedding.
    Convert user session object to natural language text for embedding.

    Extracts relevant fields from the user session and formats them into
    a coherent text description. This text captures the user's educational
    background, location, interests, and career goals.

    Takes session dictionary from user_onboarding and a returns a natural language description of the user profile.
    Returns empty string if no relevant fields are present.

    Example:
        >>> session = {
        ...     'major': 'Computer Science',
        ...     'location': 'Santa Cruz, CA',
        ...     'preferences': {
        ...         'favorites': ['Coding side projects', 'Reading sci-fi'],
        ...         'goals': ['Land a SWE role', 'Build portfolio']
        ...     }
        ... }
        >>> text = create_user_text(session)
        >>> print(text)
        Major: Computer Science. Location: Santa Cruz, CA. Interests: Coding side projects, Reading sci-fi. Career goals: Land a SWE role, Build portfolio

    Notes:
        - Only includes fields that are present and non-empty
        - Fields are separated by periods for natural reading
        - Skips personal identifiers (name, email, id) for privacy
        - Empty or None values are gracefully handled
    """
    parts = []

    # Extract major (educational background)
    if session.get('major'):
        major = session['major'].strip()
        if major:  # Check it's not empty after stripping
            parts.append(f"Major: {major}")

    # Extract location (geographic context)
    if session.get('location'):
        location = session['location'].strip()
        if location:
            parts.append(f"Location: {location}")

    # Extract preferences if they exist
    preferences = session.get('preferences')
    if preferences and isinstance(preferences, dict):

        # Extract favorite activities/interests
        favorites = preferences.get('favorites')
        if favorites and isinstance(favorites, list) and len(favorites) > 0:
            # Filter out empty strings
            valid_favorites = [f.strip() for f in favorites if f and f.strip()]
            if valid_favorites:
                favorites_str = ', '.join(valid_favorites)
                parts.append(f"Interests: {favorites_str}")

        # Extract career goals
        goals = preferences.get('goals')
        if goals and isinstance(goals, list) and len(goals) > 0:
            # Filter out empty strings
            valid_goals = [g.strip() for g in goals if g and g.strip()]
            if valid_goals:
                goals_str = ', '.join(valid_goals)
                parts.append(f"Career goals: {goals_str}")

    # Join all parts with periods and spaces
    # Returns empty string if no parts were added
    return ". ".join(parts)


def get_user_embedding(session):
    """
    Generate embedding vector for a user session.

    Converts the user's profile into a 384-dimensional vector that captures
    the semantic meaning of their background, interests, and goals. Users
    with similar profiles will have similar vectors (measured by cosine
    similarity or Euclidean distance (should test to see which one is better)).

    The embedding process:
    1. Convert session dict -> natural language text
    2. Pass text through transformer model
    3. Get 384-dimensional vector representation
    4. Convert to Python list for JSON serialization

    Args:
        session (dict): User session from user_onboarding.py

    Returns:
        list[float]: 384-dimensional embedding vector.
                     Each element is a float between -1 and 1.

    Raises:
        Exception: If model encoding fails (rare)

    Example:
        >>> session = {
        ...     'major': 'Computer Science',
        ...     'preferences': {
        ...         'goals': ['Software Engineer role', 'Learn React']
        ...     }
        ... }
        >>> embedding = get_user_embedding(session)
        >>>
        >>> # Check properties
        >>> len(embedding)
        384
        >>> type(embedding)
        <class 'list'>
        >>> type(embedding[0])
        <class 'float'>
        >>>
        >>> # Values are normalized (roughly between -1 and 1)
        >>> all(-2 < val < 2 for val in embedding)
        True

    Performance:
        - CPU: ~50-100ms per embedding
        - GPU: ~10-20ms per embedding
        - Model is cached after first use

    Notes:
        - Returns same vector for same input (deterministic)
        - Empty/minimal profiles still get embeddings (all-zero or near-zero)
        - Model uses mean pooling of token embeddings
    """
    # Step 1: Convert session to text
    text = create_user_text(session)

    # Step 2: Generate embedding using transformer model
    # model.encode() returns a numpy array
    embedding = model.encode(text)

    # Step 3: Convert numpy array to Python list
    # This makes it JSON-serializable for API responses
    embedding_list = embedding.tolist()

    return embedding_list


def get_embedding_dimension():
    """
    Get the dimensionality of embeddings produced by this model.

    Returns:
        int: Number of dimensions (384 for all-MiniLM-L6-v2)

    Example:
        >>> dim = get_embedding_dimension()
        >>> print(dim)
        384

    Notes:
        - Useful for initializing vector databases
        - Different models have different dimensions:
          * all-MiniLM-L6-v2: 384
          * all-mpnet-base-v2: 768
          * OpenAI ada-002: 1536
    """
    return model.get_sentence_embedding_dimension()


def batch_get_embeddings(sessions):
    """
    Generate embeddings for multiple users at once (more efficient).

    Uses batch processing to encode multiple users simultaneously,
    which is faster than calling get_user_embedding() in a loop.

    Args:
        sessions (list[dict]): List of user session objects

    Returns:
        list[list[float]]: List of embedding vectors, one per session

    Example:
        >>> sessions = [
        ...     {'major': 'CS', 'preferences': {'goals': ['SWE job']}},
        ...     {'major': 'Marketing', 'preferences': {'goals': ['Brand manager']}}
        ... ]
        >>> embeddings = batch_get_embeddings(sessions)
        >>> len(embeddings)
        2
        >>> len(embeddings[0])
        384

    Performance:
        - Batch of 10: ~2x faster than individual calls
        - Batch of 100: ~5x faster than individual calls
        - Diminishing returns after ~100 items
    """
    # Convert all sessions to text
    texts = [create_user_text(session) for session in sessions]

    # Batch encode (much faster than loop)
    embeddings = model.encode(texts)

    # Convert to list of lists
    return [emb.tolist() for emb in embeddings]


# ============================================================================
# Testing and validation functions
# ============================================================================

def test_embedding_generation():
    """
    Test the embedding generation with sample data.
    Run this to verify the module is working correctly.
    """
    print("Testing embedding generation...")
    print("=" * 60)

    # Test 1: Full profile
    print("\nTest 1: Full user profile")
    test_session_1 = {
        'id': 'test-123',
        'name': 'Test User',
        'email': 'test@example.com',
        'major': 'Computer Science',
        'location': 'Santa Cruz, CA',
        'preferences': {
            'favorites': ['Coding side projects', 'Reading sci-fi', 'Gym'],
            'goals': ['Land a SWE role', 'Improve DSA', 'Build portfolio']
        }
    }

    text_1 = create_user_text(test_session_1)
    print(f"Generated text: {text_1}")

    embedding_1 = get_user_embedding(test_session_1)
    print(f"Embedding dimension: {len(embedding_1)}")
    print(f"First 5 values: {embedding_1[:5]}")
    print(f"Min value: {min(embedding_1):.3f}, Max value: {max(embedding_1):.3f}")

    # Test 2: Minimal profile (no preferences)
    print("\nTest 2: Minimal profile (no preferences)")
    test_session_2 = {
        'major': 'Marketing',
        'location': 'San Francisco, CA'
    }

    text_2 = create_user_text(test_session_2)
    print(f"Generated text: {text_2}")

    embedding_2 = get_user_embedding(test_session_2)
    print(f"Embedding dimension: {len(embedding_2)}")

    # Test 3: Empty profile
    print("\nTest 3: Empty profile")
    test_session_3 = {}

    text_3 = create_user_text(test_session_3)
    print(f"Generated text: '{text_3}'")

    embedding_3 = get_user_embedding(test_session_3)
    print(f"Embedding dimension: {len(embedding_3)}")

    # Test 4: Similarity comparison
    print("\nTest 4: Similarity between users")
    import numpy as np

    # Similar users (both CS)
    cs_user_1 = {
        'major': 'Computer Science',
        'preferences': {'goals': ['Software Engineer', 'Learn React']}
    }
    cs_user_2 = {
        'major': 'CS',
        'preferences': {'goals': ['Developer role', 'Master JavaScript']}
    }

    # Different user (Marketing)
    marketing_user = {
        'major': 'Marketing',
        'preferences': {'goals': ['Brand Manager', 'Social Media Strategy']}
    }

    emb_cs_1 = np.array(get_user_embedding(cs_user_1))
    emb_cs_2 = np.array(get_user_embedding(cs_user_2))
    emb_marketing = np.array(get_user_embedding(marketing_user))

    # Calculate cosine similarity
    def cosine_similarity(a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    sim_cs = cosine_similarity(emb_cs_1, emb_cs_2)
    sim_diff = cosine_similarity(emb_cs_1, emb_marketing)

    print(f"Similarity between CS users: {sim_cs:.3f}")
    print(f"Similarity between CS and Marketing: {sim_diff:.3f}")
    print(f"Expected: CS similarity > CS-Marketing similarity")
    print(f"Result: {sim_cs > sim_diff}" if sim_cs > sim_diff else f"Result: {sim_cs > sim_diff}")

    print("\n" + "=" * 60)
    print("All tests completed!")


# ============================================================================
# Run tests if this file is executed directly
# ============================================================================

if __name__ == "__main__":
    print("Embeddings module")
    print("=" * 60)
    print(f"Model: all-MiniLM-L6-v2")
    print(f"Embedding dimension: {get_embedding_dimension()}")
    print("=" * 60)

    # Run tests
    test_embedding_generation()
