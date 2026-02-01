from pydantic import BaseModel
from typing import Optional
from datetime import datetime



class CategoryCreate(BaseModel):
    category_name: str



class CategoryUpdate(BaseModel):
    category_name: str



class ExpenseCreate(BaseModel):
    category_id:int
    description : Optional[str] = None
    amount : Optional[int] = None
    date : Optional[datetime] = None