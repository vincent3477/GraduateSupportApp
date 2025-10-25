"""
ChromaDB Vector Database for User Embeddings

This module provides persistent storage and similarity search for user embeddings.
Uses ChromaDB to enable efficient matching of similar graduates based on their
profiles, goals, and interests.

Key Features:
    - Persistent storage (survives server restarts)
    - Automatic similarity search using cosine distance
    - Metadata filtering support
    - Upsert pattern (handles both new and existing users)

Example Usage:
    >>> from user_connectivity.vector_db import UserVectorDB
    >>> db = UserVectorDB()
    >>>
    >>> # Add a user
    >>> session = {
    ...     'id': 'user-123',
    ...     'major': 'Computer Science',
    ...     'location': 'Santa Cruz, CA',
    ...     'preferences': {
    ...         'goals': ['Land SWE role', 'Build portfolio'],
    ...         'favorites': ['Coding', 'Reading']
    ...     }
    ... }
    >>> db.add_user(session)
    >>>
    >>> # Find similar users
    >>> similar = db.find_similar_users('user-123', top_k=5)
    >>> for user in similar:
    ...     print(f"{user['user_id']}: {user['similarity']:.3f}")
"""

import chromadb
import json
from typing import List, Dict, Optional
from .embeddings import get_user_embedding, create_user_text


class UserVectorDB:
    """
    ChromaDB-based vector database for storing and querying user embeddings.

    This class handles the storage, retrieval, and similarity search of user
    profile embeddings. It automatically manages the ChromaDB collection and
    provides a simple API for common operations.

    Attributes:
        client: ChromaDB persistent client
        collection: ChromaDB collection for graduate users
    """

    def __init__(self, persist_directory="./chroma_data"):
        """
        Initialize ChromaDB client and collection.

        Args:
            persist_directory (str): Path where ChromaDB will store data.
                                    Defaults to './chroma_data' in current directory.

        Notes:
            - Creates directory if it doesn't exist
            - Uses persistent storage (data survives restarts)
            - Collection is created if it doesn't exist
        """
        # Create persistent client (data saved to disk)
        self.client = chromadb.PersistentClient(path=persist_directory)

        # Get or create collection for graduate users
        # Uses L2 distance by default (equivalent to cosine for normalized vectors)
        self.collection = self.client.get_or_create_collection(
            name="graduate_users",
            metadata={"description": "User embeddings for graduate matching"}
        )

    def add_user(self, session: Dict) -> None:
        """
        Add or update a user in the vector database.

        Generates an embedding from the user session and stores it in ChromaDB
        along with metadata. Uses upsert pattern, so calling this multiple times
        with the same user_id will update the existing record.

        Args:
            session (dict): User session from user_onboarding.py
                Required fields:
                    - id (str): Unique user identifier
                    - major (str, optional): User's major/degree
                    - location (str, optional): User's location
                    - preferences (dict, optional): User preferences
                        - goals (list[str]): Career goals
                        - favorites (list[str]): Favorite activities

        Raises:
            ValueError: If session is missing required 'id' field
            Exception: If embedding generation fails

        Example:
            >>> db = UserVectorDB()
            >>> session = {
            ...     'id': 'user-123',
            ...     'major': 'CS',
            ...     'preferences': {'goals': ['SWE job']}
            ... }
            >>> db.add_user(session)
        """
        # Validate required fields
        if not session.get('id'):
            raise ValueError("Session must have an 'id' field")

        # Generate embedding vector (384 dimensions)
        embedding = get_user_embedding(session)

        # Generate natural language description (for reference/debugging)
        text = create_user_text(session)

        # Prepare metadata (convert lists to JSON strings)
        metadata = self._prepare_metadata(session)

        # Upsert: add if new, update if exists
        # This is idempotent - safe to call multiple times
        self.collection.upsert(
            ids=[session['id']],
            embeddings=[embedding],
            metadatas=[metadata],
            documents=[text]  # Natural language text for reference
        )

    def find_similar_users(
        self,
        user_id: str,
        top_k: int = 5,
        include_metadata: bool = True
    ) -> List[Dict]:
        """
        Find the K most similar users to a given user.

        Uses cosine similarity (via L2 distance on normalized vectors) to find
        users with similar profiles, goals, and interests.

        Args:
            user_id (str): ID of the user to find matches for
            top_k (int): Number of similar users to return (default: 5)
            include_metadata (bool): Whether to include user metadata in results

        Returns:
            list[dict]: List of similar users, sorted by similarity (highest first)
                Each dict contains:
                    - user_id (str): The similar user's ID
                    - similarity (float): Similarity score (0-1, higher is more similar)
                    - metadata (dict, optional): User metadata if include_metadata=True
                        - major (str)
                        - location (str)
                        - goals (list[str])
                        - favorites (list[str])

        Raises:
            ValueError: If user_id not found in database

        Example:
            >>> similar = db.find_similar_users('user-123', top_k=3)
            >>> for user in similar:
            ...     print(f"{user['user_id']}: similarity {user['similarity']:.2f}")
            user-456: similarity 0.92
            user-789: similarity 0.87
            user-234: similarity 0.81

        Notes:
            - The queried user is automatically excluded from results
            - Empty database returns empty list
            - Returns fewer than top_k if not enough users in database
        """
        # Get the user's embedding from the database
        user_data = self.collection.get(
            ids=[user_id],
            include=["embeddings"]
        )

        # Check if user exists
        if user_data['embeddings'] is None or len(user_data['embeddings']) == 0:
            raise ValueError(f"User '{user_id}' not found in database")

        # Query for similar users
        # Request top_k + 1 because results include the query user
        results = self.collection.query(
            query_embeddings=user_data['embeddings'],
            n_results=top_k + 1,  # +1 to account for self
            include=["metadatas", "distances"]
        )

        # Process and format results
        similar_users = []

        # Handle empty database or single user case
        if not results['ids'] or not results['ids'][0]:
            return []

        for i, returned_id in enumerate(results['ids'][0]):
            # Skip the query user (exclude self from results)
            if returned_id == user_id:
                continue

            # Convert L2 distance to similarity score
            # Distance ranges from 0 (identical) to ~2 (very different)
            # Similarity: 1 = most similar, 0 = least similar
            distance = results['distances'][0][i]
            similarity = max(0, 1 - (distance / 2))  # Normalize to 0-1 range

            # Build result object
            result = {
                'user_id': returned_id,
                'similarity': similarity
            }

            # Add metadata if requested
            if include_metadata:
                raw_metadata = results['metadatas'][0][i]
                result['metadata'] = self._parse_metadata(raw_metadata)

            similar_users.append(result)

        # Return only top_k results (after filtering out self)
        return similar_users[:top_k]

    def get_user(self, user_id: str) -> Optional[Dict]:
        """
        Retrieve a user's data from the database.

        Useful for debugging or displaying user profiles.

        Args:
            user_id (str): The user's ID

        Returns:
            dict or None: User data including metadata and text description
                {
                    'id': str,
                    'text': str,
                    'metadata': dict,
                    'embedding': list[float]
                }

        Example:
            >>> user = db.get_user('user-123')
            >>> print(user['text'])
            Major: Computer Science. Location: Santa Cruz, CA. ...
        """
        result = self.collection.get(
            ids=[user_id],
            include=["embeddings", "metadatas", "documents"]
        )

        if not result['ids'] or len(result['ids']) == 0:
            return None

        return {
            'id': result['ids'][0],
            'text': result['documents'][0] if result['documents'] else '',
            'metadata': self._parse_metadata(result['metadatas'][0]) if result['metadatas'] else {},
            'embedding': result['embeddings'][0] if result['embeddings'] else []
        }

    def delete_user(self, user_id: str) -> bool:
        """
        Delete a user from the database.

        Useful for testing or GDPR compliance.

        Args:
            user_id (str): The user's ID

        Returns:
            bool: True if user was deleted, False if not found

        Example:
            >>> db.delete_user('user-123')
            True
        """
        try:
            self.collection.delete(ids=[user_id])
            return True
        except Exception as e:
            print(f"Error deleting user {user_id}: {e}")
            return False

    def count_users(self) -> int:
        """
        Get the total number of users in the database.

        Returns:
            int: Number of users stored

        Example:
            >>> db.count_users()
            42
        """
        return self.collection.count()

    def clear_all(self) -> None:
        """
        Delete all users from the database.

        WARNING: This is irreversible! Use only for testing.

        Example:
            >>> db.clear_all()  # Deletes all users
        """
        # Delete the collection and recreate it
        self.client.delete_collection(name="graduate_users")
        self.collection = self.client.get_or_create_collection(
            name="graduate_users",
            metadata={"description": "User embeddings for graduate matching"}
        )

    def _prepare_metadata(self, session: Dict) -> Dict:
        """
        Convert user session to ChromaDB-compatible metadata.

        ChromaDB only supports primitive types (str, int, float, bool).
        Lists must be serialized to JSON strings.

        Args:
            session (dict): User session from user_onboarding.py

        Returns:
            dict: Metadata dictionary with JSON-serialized lists
        """
        preferences = session.get('preferences', {}) or {}

        # Extract list fields and serialize to JSON
        goals = preferences.get('goals', [])
        favorites = preferences.get('favorites', [])

        return {
            'major': session.get('major', ''),
            'location': session.get('location', ''),
            'goals_json': json.dumps(goals),
            'favorites_json': json.dumps(favorites),
            'created_at': session.get('createdAt', '')
        }

    def _parse_metadata(self, raw_metadata: Dict) -> Dict:
        """
        Parse metadata from ChromaDB format back to Python objects.

        Deserializes JSON strings back to lists.

        Args:
            raw_metadata (dict): Metadata from ChromaDB

        Returns:
            dict: Parsed metadata with lists restored
        """
        try:
            goals = json.loads(raw_metadata.get('goals_json', '[]'))
        except json.JSONDecodeError:
            goals = []

        try:
            favorites = json.loads(raw_metadata.get('favorites_json', '[]'))
        except json.JSONDecodeError:
            favorites = []

        return {
            'major': raw_metadata.get('major', ''),
            'location': raw_metadata.get('location', ''),
            'goals': goals,
            'favorites': favorites,
            'created_at': raw_metadata.get('created_at', '')
        }


# ============================================================================
# Convenience functions (simpler API for quick usage)
# ============================================================================

# Global database instance (singleton pattern)
_db_instance = None

def get_db(persist_directory="./chroma_data") -> UserVectorDB:
    """
    Get or create a global UserVectorDB instance.

    Uses singleton pattern to avoid creating multiple connections.

    Args:
        persist_directory (str): Path to ChromaDB storage

    Returns:
        UserVectorDB: Global database instance
    """
    global _db_instance
    if _db_instance is None:
        _db_instance = UserVectorDB(persist_directory)
    return _db_instance


def add_user(session: Dict) -> None:
    """Convenience function to add user to global database."""
    db = get_db()
    db.add_user(session)


def find_similar_users(user_id: str, top_k: int = 5) -> List[Dict]:
    """Convenience function to find similar users using global database."""
    db = get_db()
    return db.find_similar_users(user_id, top_k)


# ============================================================================
# Testing and demo code
# ============================================================================

def test_vector_db():
    """
    Test the vector database with sample users.

    Creates test users, adds them to the database, and finds similar matches.
    """
    print("Testing ChromaDB Vector Database")
    print("=" * 60)

    # Create a fresh database for testing
    db = UserVectorDB(persist_directory="./test_chroma_data")
    db.clear_all()

    # Test User 1: CS major interested in SWE
    print("\nAdding Test User 1: CS major interested in SWE")
    user1 = {
        'id': 'test-user-1',
        'name': 'Alice Chen',
        'major': 'Computer Science',
        'location': 'San Francisco, CA',
        'preferences': {
            'goals': ['Land SWE role', 'Learn React', 'Build portfolio'],
            'favorites': ['Coding side projects', 'Reading tech blogs', 'Gym']
        },
        'createdAt': '2025-10-25T10:00:00'
    }
    db.add_user(user1)

    # Test User 2: Similar CS major
    print("Adding Test User 2: Similar CS major")
    user2 = {
        'id': 'test-user-2',
        'name': 'Bob Smith',
        'major': 'Computer Science',
        'location': 'Oakland, CA',
        'preferences': {
            'goals': ['Get developer job', 'Master JavaScript', 'Contribute to open source'],
            'favorites': ['Programming', 'Reading documentation', 'Fitness']
        },
        'createdAt': '2025-10-25T10:15:00'
    }
    db.add_user(user2)

    # Test User 3: Marketing major (different field)
    print("Adding Test User 3: Marketing major (different field)")
    user3 = {
        'id': 'test-user-3',
        'name': 'Carol Johnson',
        'major': 'Marketing',
        'location': 'San Jose, CA',
        'preferences': {
            'goals': ['Brand manager role', 'Social media strategy', 'Build personal brand'],
            'favorites': ['Content creation', 'Networking events', 'Writing']
        },
        'createdAt': '2025-10-25T10:30:00'
    }
    db.add_user(user3)

    # Test User 4: Another CS major
    print("Adding Test User 4: Another CS major")
    user4 = {
        'id': 'test-user-4',
        'name': 'David Lee',
        'major': 'Computer Engineering',
        'location': 'Santa Cruz, CA',
        'preferences': {
            'goals': ['Software engineer position', 'Learn Python', 'System design'],
            'favorites': ['Coding', 'Tech podcasts', 'Running']
        },
        'createdAt': '2025-10-25T10:45:00'
    }
    db.add_user(user4)

    print(f"\nTotal users in database: {db.count_users()}")

    # Test similarity search
    print("\n" + "=" * 60)
    print("Finding similar users to Test User 1 (CS major, SWE goals):")
    print("=" * 60)

    similar = db.find_similar_users('test-user-1', top_k=3)

    for i, user in enumerate(similar, 1):
        print(f"\n{i}. User: {user['user_id']}")
        print(f"   Similarity: {user['similarity']:.3f}")
        print(f"   Major: {user['metadata']['major']}")
        print(f"   Location: {user['metadata']['location']}")
        print(f"   Goals: {', '.join(user['metadata']['goals'][:2])}")

    # Test retrieval
    print("\n" + "=" * 60)
    print("Retrieving User 1 details:")
    print("=" * 60)

    user_data = db.get_user('test-user-1')
    print(f"ID: {user_data['id']}")
    print(f"Text: {user_data['text']}")
    print(f"Major: {user_data['metadata']['major']}")

    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)


if __name__ == "__main__":
    # Run tests
    test_vector_db()
