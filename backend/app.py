#!/usr/bin/python3
"""
BookQuest Backend Server

A Flask-based backend server for the BookQuest application that provides
book search functionality using Google Books API and health literacy content
integration. Supports caching, load balancing, and secure API key management.

Author: Kevin Nizy
Version: 1.0.0
"""

import json
import os
import socket
import time
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, List, Optional, Tuple

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('../.env')

# Initialize Flask app
app = Flask(__name__, static_folder='../app', static_url_path='')
CORS(app)

# Configuration
CACHE_TTL = 3600  # 1 hour cache TTL
MAX_RESULTS = 40
HEALTH_API_URL = "https://health.gov/api/myhealthfinder.json"

# In-memory cache for API responses
api_cache = {}


def get_backend_identifier() -> str:
    """Get backend instance identifier for load balancer demo."""
    return f"BookQuest-Backend-{socket.gethostname()}"


def cache_response(func):
    """Decorator to cache API responses with TTL."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        cache_key = f"{func.__name__}:{request.args.get('q', '')}"
        
        # Check cache
        if cache_key in api_cache:
            cached_data, timestamp = api_cache[cache_key]
            if time.time() - timestamp < CACHE_TTL:
                return jsonify({
                    "success": True,
                    "data": cached_data,
                    "cached": True,
                    "backend": get_backend_identifier(),
                    "timestamp": datetime.now().isoformat()
                })
        
        # Call original function
        result = func(*args, **kwargs)
        
        # Handle tuple responses (response, status_code)
        if isinstance(result, tuple):
            response_obj, status_code = result
        else:
            response_obj = result
            status_code = 200
        
        # Cache successful responses
        if status_code == 200:
            try:
                data = response_obj.get_json()
                if data.get("success"):
                    api_cache[cache_key] = (data, time.time())
            except Exception:
                pass
        
        return result
    return wrapper


def validate_api_key() -> bool:
    """Validate that Google Books API key is configured."""
    api_key = os.getenv("GOOGLE_BOOKS_API_KEY")
    return bool(api_key and api_key.strip())


def get_health_literacy_content(query: str) -> List[Dict]:
    """
    Get health literacy content related to the search query.
    
    Args:
        query: Search query string
        
    Returns:
        List of health literacy resources
    """
    try:
        # Use a simplified health API call (in real implementation, 
        # you'd use a proper health API with authentication)
        health_keywords = [
            "health", "medical", "disease", "treatment", "medicine",
            "nutrition", "exercise", "mental health", "wellness"
        ]
        
        query_lower = query.lower()
        is_health_related = any(keyword in query_lower for keyword in health_keywords)
        
        if is_health_related:
            return [{
                "type": "health_literacy",
                "title": "Health Literacy Resources",
                "description": "Find trusted health information and resources",
                "url": "https://health.gov/our-work/national-health-initiatives/health-literacy",
                "source": "Health.gov"
            }]
        
        return []
    except Exception as e:
        app.logger.error(f"Error fetching health content: {e}")
        return []


@app.route("/")
def index():
    """Serve the main application page."""
    return app.send_static_file('index.html')

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint for load balancer."""
    return jsonify({
        "status": "healthy",
        "backend": get_backend_identifier(),
        "timestamp": datetime.now().isoformat(),
        "cache_size": len(api_cache)
    })


@app.route("/api/search", methods=["GET"])
@cache_response
def search_books():
    """
    Search for books using Google Books API with health literacy integration.
    
    Query Parameters:
        q: Search query (required)
        maxResults: Maximum number of results (optional, default 20)
        
    Returns:
        JSON response with book data and health literacy content
    """
    try:
        # Validate API key
        if not validate_api_key():
            return jsonify({
                "success": False,
                "error": "Google Books API key not configured",
                "backend": get_backend_identifier()
            }), 500
        
        # Get search parameters
        query = request.args.get("q", "").strip()
        max_results = min(int(request.args.get("maxResults", 20)), MAX_RESULTS)
        
        if not query:
            return jsonify({
                "success": False,
                "error": "Search query is required",
                "backend": get_backend_identifier()
            }), 400
        
        # Google Books API call
        api_key = os.getenv("GOOGLE_BOOKS_API_KEY")
        google_books_url = "https://www.googleapis.com/books/v1/volumes"
        
        params = {
            "q": query,
            "maxResults": max_results,
            "key": api_key
        }
        
        response = requests.get(google_books_url, params=params, timeout=10)
        response.raise_for_status()
        
        books_data = response.json()
        
        # Process books data
        books = []
        if "items" in books_data:
            for item in books_data["items"]:
                volume_info = item.get("volumeInfo", {})
                
                book = {
                    "id": item.get("id"),
                    "title": volume_info.get("title", "Unknown Title"),
                    "authors": volume_info.get("authors", ["Unknown Author"]),
                    "publisher": volume_info.get("publisher", "Unknown Publisher"),
                    "publishedDate": volume_info.get("publishedDate"),
                    "description": volume_info.get("description", "No description available"),
                    "pageCount": volume_info.get("pageCount"),
                    "categories": volume_info.get("categories", []),
                    "averageRating": volume_info.get("averageRating"),
                    "ratingsCount": volume_info.get("ratingsCount"),
                    "imageLinks": volume_info.get("imageLinks", {}),
                    "previewLink": volume_info.get("previewLink"),
                    "infoLink": volume_info.get("infoLink")
                }
                books.append(book)
        
        # Get health literacy content
        health_content = get_health_literacy_content(query)
        
        return jsonify({
            "success": True,
            "data": {
                "books": books,
                "totalItems": books_data.get("totalItems", 0),
                "healthContent": health_content
            },
            "backend": get_backend_identifier(),
            "timestamp": datetime.now().isoformat(),
            "query": query
        })
        
    except requests.RequestException as e:
        app.logger.error(f"Google Books API error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch books from Google Books API",
            "backend": get_backend_identifier()
        }), 503
        
    except ValueError as e:
        app.logger.error(f"Invalid parameter error: {e}")
        return jsonify({
            "success": False,
            "error": "Invalid search parameters",
            "backend": get_backend_identifier()
        }), 400
        
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "backend": get_backend_identifier()
        }), 500


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Get available book categories for filtering."""
    categories = [
        "Fiction", "Non-Fiction", "Science Fiction", "Mystery", "Romance",
        "Biography", "History", "Science", "Technology", "Health & Fitness",
        "Self-Help", "Business", "Education", "Children's Books", "Poetry",
        "Drama", "Comics & Graphic Novels", "Travel", "Cooking", "Art"
    ]
    
    return jsonify({
        "success": True,
        "data": categories,
        "backend": get_backend_identifier(),
        "timestamp": datetime.now().isoformat()
    })


@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    """Clear the API response cache."""
    global api_cache
    api_cache.clear()
    
    return jsonify({
        "success": True,
        "message": "Cache cleared successfully",
        "backend": get_backend_identifier(),
        "timestamp": datetime.now().isoformat()
    })


@app.route("/api/cache/stats", methods=["GET"])
def cache_stats():
    """Get cache statistics."""
    cache_size = len(api_cache)
    cache_keys = list(api_cache.keys())
    
    return jsonify({
        "success": True,
        "data": {
            "size": cache_size,
            "keys": cache_keys,
            "ttl_seconds": CACHE_TTL
        },
        "backend": get_backend_identifier(),
        "timestamp": datetime.now().isoformat()
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "backend": get_backend_identifier()
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "backend": get_backend_identifier()
    }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    debug = os.getenv("FLASK_ENV") == "development"
    
    app.logger.info(f"Starting BookQuest Backend on port {port}")
    app.logger.info(f"Backend identifier: {get_backend_identifier()}")
    
    app.run(host="0.0.0.0", port=port, debug=debug) 