from pydantic import BaseModel, Field
from typing import List, Optional, Any


class Recipe(BaseModel):

    id: int
    cuisine: Optional[str] = None
    title: str
    rating: Optional[float] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    total_time: Optional[int] = None
    description: Optional[str] = None
    nutrients: Optional[Any] = None 
    calories_int: Optional[int] = None
    serves: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedRecipes(BaseModel):
    page: int
    limit: int
    total: int
    data: List[Recipe]
