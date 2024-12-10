from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, users, jobs, recruiter, candidate


app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(recruiter.router, prefix="/recruiter", tags=["Recruiter"])
app.include_router(recruiter.router, prefix="/auth", tags=["Recruiter"])
app.include_router(candidate.router, prefix="/candidate", tags=["Candidate"])


@app.get("/")
def read_root():
    return {"success": True, "message": "Server is running!"}

# Lancement du serveur
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8085, reload=True)
