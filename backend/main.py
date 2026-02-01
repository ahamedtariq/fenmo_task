from fastapi import FastAPI,HTTPException
from database import engine,Base

app = FastAPI()

Base.metadata.create_all(engine)


@app.get("/home")
async def home():
    try:
        print("Yes It is Ok")
        return {"message":"Success"}
    except Exception as e:
        raise HTTPException(status_code = 500, detail = "Error on ")