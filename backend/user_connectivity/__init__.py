"""
User Connectivity Module

This module provides functionality for connecting similar users based on
their profiles, interests, and career goals using embedding-based similarity.

Key Components:
    - embeddings: Convert user profiles to vector embeddings
    - vector_db: Store and search embeddings for similar users (coming soon)

Example Usage:
    >>> from user_connectivity import get_user_embedding
    >>> embedding = get_user_embedding(user_session)
"""

from .embeddings import (
    get_user_embedding,
    create_user_text,
    get_embedding_dimension,
    batch_get_embeddings
)

__all__ = [
    'get_user_embedding',
    'create_user_text',
    'get_embedding_dimension',
    'batch_get_embeddings'
]

__version__ = '0.1.0'
