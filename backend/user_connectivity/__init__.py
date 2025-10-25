"""
User Connectivity Module

This module provides functionality for connecting similar users based on
their profiles, interests, and career goals using embedding-based similarity.

Key Components:
    - embeddings: Convert user profiles to vector embeddings
    - vector_db: Store and search embeddings for similar users using ChromaDB

Example Usage:
    >>> from user_connectivity import get_user_embedding, UserVectorDB
    >>>
    >>> # Generate embedding
    >>> embedding = get_user_embedding(user_session)
    >>>
    >>> # Store and find similar users
    >>> db = UserVectorDB()
    >>> db.add_user(user_session)
    >>> similar = db.find_similar_users(user_id, top_k=5)
"""

from .embeddings import (
    get_user_embedding,
    create_user_text,
    get_embedding_dimension,
    batch_get_embeddings
)

from .vector_db import (
    UserVectorDB,
    get_db,
    add_user,
    find_similar_users
)

__all__ = [
    # Embedding functions
    'get_user_embedding',
    'create_user_text',
    'get_embedding_dimension',
    'batch_get_embeddings',
    # Vector DB class and functions
    'UserVectorDB',
    'get_db',
    'add_user',
    'find_similar_users'
]

__version__ = '0.1.0'
