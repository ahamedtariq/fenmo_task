from fastapi import FastAPI,HTTPException,Depends,Query
from fastapi.middleware.cors import CORSMiddleware  
from sqlalchemy.orm import Session
from database import engine,Base,get_db
import models
from models import Categories , Expense
from schemas import CategoryCreate,CategoryUpdate,ExpenseCreate
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc, asc


app = FastAPI()

Base.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# @app.get("/home")
# async def home():
#     try:
#         print("Yes It is Ok")
#         return {"message":"Success"}
#     except Exception as e:
#         raise HTTPException(status_code = 500, detail = "Error on ")



#  ---------------------------------------------------------------------------------------------------
#  ---------------------------------- Categories Crud -----------------------------------------------
#  ---------------------------------------------------------------------------------------------------

@app.get("/get_categories")
async def get_categories(db:Session=Depends(get_db)):
    try:
        categories = db.query(Categories).all()
        data = []
        for category in categories:
            temp = {}
            temp["id"] = category.id
            temp["name"] = category.category_name
            data.append(temp)
        
        return {"data": data}

    except Exception as e:
        raise HTTPException(status_code =500,detail=f"Error on Get Categories {e}")
    


@app.post("/save_categories")
async def save_categories(payload:CategoryCreate,db:Session=Depends(get_db)):
    try:
        category = Categories(
            category_name = payload.category_name
        )

        db.add(category)
        db.commit()
        db.refresh(category)

        return {"message":"Category Saved Successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )
    except Exception as e:
        raise HTTPException(status_code =500,detail=f"Error on Get Categories {e}")



@app.put("/update_categories/{category_id}")
async def update_categories(category_id:int,payload:CategoryUpdate,db:Session=Depends(get_db)):
    category = db.query(Categories).filter(Categories.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404,detail=f"Category Not Found")
    try:
        category.category_name = payload.category_name
        db.commit()
        db.refresh(category)

        return {"message":"Category Updated Successfully"}
    
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )
    except Exception as e:
        raise HTTPException(status_code =500,detail=f"Error on Get Categories {e}")
    





#  ---------------------------------------------------------------------------------------------------
#  ---------------------------------- Expenses Crud -----------------------------------------------
#  ---------------------------------------------------------------------------------------------------

@app.get("/expenses")
def get_expenses(
    category_id: int | None = Query(default=None),
    sort: str | None = Query(default="newest"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Expense)

        
        if category_id:
            query = query.filter(Expense.category_id == category_id)

    
        if sort == "newest":
            query = query.order_by(desc(Expense.date))
        elif sort == "oldest":
            query = query.order_by(asc(Expense.date))

        expenses = query.all()

        data = [
            {
                "id": e.id,
                "amount": e.amount,
                "description": e.description,
                "category_name": e.category.category_name,
                "date": e.date,
            }
            for e in expenses
        ]

        return {"data": data}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching expenses: {str(e)}"
        )

    


@app.post("/expenses")
async def save_expense(payload:ExpenseCreate,db:Session=Depends(get_db)):
    try:
        expense = Expense(
            category_id = payload.category_id,
            description = payload.description,
            amount = payload.amount,
            date = payload.date
        )

        db.add(expense)
        db.commit()
        db.refresh(expense)

        return {"message":"Expense Saved Successfully"}
    except Exception as e:
        raise HTTPException(status_code =500,detail=f"Error on Saving Expense {e}")



@app.put("/update_expense/{expense_id}")
async def update_categories(expense_id:int,payload:ExpenseCreate,db:Session=Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404,detail=f"Expense Not Found")
    try:
        if payload.description is not None:
            expense.description = payload.description
        if payload.amount is not None:
            expense.amount = payload.amount
        if payload.date is not None:
            expense.date = payload.date

        db.commit()
        db.refresh(expense)

        return {"message":"Expense Updated Successfully"}
    
    
    except Exception as e:
        raise HTTPException(status_code =500,detail=f"Error on Updating Expense {e}")
    




