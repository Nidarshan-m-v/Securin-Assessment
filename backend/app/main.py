from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Tuple, Dict, Any
import psycopg2
import math

from .schemas import PaginatedRecipes


DB_PARAMS = {
    "host": "localhost",
    "database": "recipe_db",
    "user": "postgres",
    "password": "ADMIN" 
}

RECIPE_FIELDS = [
    'id', 'cuisine', 'title', 'rating', 'prep_time', 'cook_time', 
    'total_time', 'description', 'nutrients', 'calories_int', 'serves'
]

app = FastAPI(title="Simplified Recipes API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ExecuteConnection():

    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except psycopg2.Error as e:
        raise ConnectionError(f"Database connection error: {e}")

def QueryExecution(query: str, params: Optional[Tuple] = None) -> List[Dict[str, Any]]:

    conn = None
    try:
        conn = ExecuteConnection()
        cursor = conn.cursor()
        cursor.execute(query, params)
        
    
        data = []
        for row in cursor.fetchall():
            data.append(dict(zip(RECIPE_FIELDS, row)))
        
        return data
    
    except Exception as e:
        print(f"Query execution error: {e}")
        return []
    finally:
        if conn:
            conn.close()

def getCount() -> int:
    conn = None
    try:
        conn = ExecuteConnection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM recipes;")
        return cursor.fetchone()[0]
    except Exception as e:
        print(f"Error fetching total count: {e}")
        return 0
    finally:
        if conn:
            conn.close()


@app.get("/api/recipes", response_model=PaginatedRecipes)
def getAllRecipes(
    page: int = Query(1, ge=1), 
    limit: int = Query(10, ge=10, le=50) 
):
   
    offset = (page - 1) * limit
    total = getCount()

 
    recipe_query = f"""
        SELECT {', '.join(RECIPE_FIELDS)} 
        FROM recipes
        ORDER BY rating DESC, title ASC
        LIMIT %s OFFSET %s;
    """
    
    items = QueryExecution(recipe_query, (limit, offset))

    return {
        "page": page, 
        "limit": limit, 
        "total": total, 
        "data": items
    }



@app.get("/api/recipes/search", response_model=PaginatedRecipes)
def searchRecipes(
  
    title: Optional[str] = Query(None, description="Partial match on recipe title."),
    cuisine: Optional[str] = Query(None, description="Exact match on cuisine."),

    calories_min: Optional[int] = Query(None, ge=0),
    calories_max: Optional[int] = Query(None, ge=0),
    rating_min: Optional[float] = Query(None, ge=0),
    rating_max: Optional[float] = Query(None, le=5),
    total_time_min: Optional[int] = Query(None, ge=0),
    total_time_max: Optional[int] = Query(None, ge=0),
):
    
    query_parts = []
    params = []
    
   
    if title:
        query_parts.append("title ILIKE %s")
        params.append(f"%{title}%")
        
    
    if cuisine:
        query_parts.append("cuisine = %s")
        params.append(cuisine)


    if calories_min is not None:
        query_parts.append("calories_int >= %s")
        params.append(calories_min)
    if calories_max is not None:
        query_parts.append("calories_int <= %s")
        params.append(calories_max)

    
    if rating_min is not None:
        query_parts.append("rating >= %s")
        params.append(rating_min)
    if rating_max is not None:
        query_parts.append("rating <= %s")
        params.append(rating_max)
        
    
    if total_time_min is not None:
        query_parts.append("total_time >= %s")
        params.append(total_time_min)
    if total_time_max is not None:
        query_parts.append("total_time <= %s")
        params.append(total_time_max)
        

    
    where_clause = " WHERE " + " AND ".join(query_parts) if query_parts else ""
    

    search_query = f"""
        SELECT {', '.join(RECIPE_FIELDS)} 
        FROM recipes
        {where_clause}
        ORDER BY rating DESC, title ASC;
    """
    
    items = QueryExecution(search_query, tuple(params))
    
    return {
        "page": 1, 
        "limit": len(items), 
        "total": len(items), 
        "data": items
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
