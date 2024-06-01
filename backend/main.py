from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import tempfile
from sqlalchemy import create_engine, Column, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Database config
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Model for storing code execution results
class CodeExecution(Base):
    __tablename__ = "code_executions"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(Text, nullable=False)
    output = Column(Text, nullable=False)

Base.metadata.create_all(bind=engine)

class Code(BaseModel):
    code: str

app = FastAPI()

# CORS settings
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/execute")
async def execute_code(code: Code, db: Session = Depends(get_db)):
    """
    Endpoint to execute the submitted code and store the result in the database.
    """
    print("Received code:", code.code)  
    with tempfile.NamedTemporaryFile(suffix=".py") as temp_file:
        temp_file.write(code.code.encode('utf-8'))
        temp_file.flush()
        try:
            result = subprocess.run(
                ['python3', temp_file.name],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5  # Prevents long running code and should timeout
            )
            output = result.stdout.decode('utf-8') + result.stderr.decode('utf-8')
            code_execution = CodeExecution(code=code.code, output=output)
            db.add(code_execution)
            db.commit()
            db.refresh(code_execution)
            return {"stdout": result.stdout.decode('utf-8'), "stderr": result.stderr.decode('utf-8')}
        except subprocess.TimeoutExpired:
            return {"error": "Execution timed out"}
