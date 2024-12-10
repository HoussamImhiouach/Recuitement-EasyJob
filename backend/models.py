from pydantic import BaseModel, EmailStr
from typing import Optional, List


class User(BaseModel):
    user_id: int
    username: str
    email: EmailStr
    role: str
    date_created: Optional[str]
    last_login: Optional[str]


class Job(BaseModel):
    job_id: int
    title: str
    description: str
    location: str
    salary_range: Optional[str]
    job_type: Optional[str]
    date_posted: Optional[str]
    date_closing: Optional[str]


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    domain: Optional[str] = None
    country: Optional[str] = None
    skills: Optional[List[str]] = None


class RecruiterCreate(BaseModel):
    company_name: str
    company_size: Optional[str]
    industry: str
    location: str
    email: EmailStr
    password: str
    role: str = "Recruiter"


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class ActivationRequest(BaseModel):
    email: str
    activation_code: str

  



