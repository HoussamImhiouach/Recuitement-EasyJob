from fastapi import APIRouter, HTTPException
from database import get_snowflake_connection
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class JobCreate(BaseModel):
    jobTitle: str
    jobDescription: str
    requiredSkills: str
    location: str
    salaryRange: str
    jobType: str
    dateClosing: str
    
class Job(BaseModel):
    job_id: int
    title: str
    description: str
    location: str
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    date_posted: Optional[str] = None
    date_closing: Optional[str] = None


@router.post("/create-job")
def create_job(job: JobCreate, recruiter_id: int = 1):  
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO JOBS (RECRUITERID, JOBTITLE, JOBDESCRIPTION, REQUIREDSKILLS, LOCATION, SALARYRANGE, JOBTYPE, DATECLOSING)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (recruiter_id, job.jobTitle, job.jobDescription, job.requiredSkills, job.location, job.salaryRange, job.jobType, job.dateClosing))
        conn.commit()
        return {"message": "Job created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/my-jobs")
def get_jobs(recruiter_id: int = 1):  
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    try:
        
        cursor.execute("""
            SELECT JOBID, JOBTITLE, JOBDESCRIPTION, REQUIREDSKILLS, LOCATION, SALARYRANGE, JOBTYPE, DATEPOSTED, DATECLOSING
            FROM JOBS WHERE RECRUITERID = %s
        """, (recruiter_id,))
        jobs = cursor.fetchall()
        
        # Convertir le résultat en un format JSON
        job_list = [
            {
                "job_id": row[0],
                "title": row[1],
                "description": row[2],
                "skills": row[3],
                "location": row[4],
                "salary": row[5],
                "type": row[6],
                "date_posted": row[7],
                "date_closing": row[8],
            }
            for row in jobs
        ]
        
        return job_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
        
@router.delete("/delete-job/{job_id}")
def delete_job(job_id: int):
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM JOBS WHERE JOBID = %s", (job_id,))
        if cursor.rowcount == 0:  # Si aucune ligne n'est affectée
            raise HTTPException(status_code=404, detail="Job not found")
        conn.commit()
        return {"message": "Job deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

        
@router.put("/edit-job/{job_id}")
def edit_job(job_id: int, job: Job):
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    # Log incoming data
    print(f"Job ID reçu : {job_id}")
    print(f"Données reçues : {job.dict()}")

    try:
        # Requête SQL pour mettre à jour le job
        cursor.execute(
            """
            UPDATE JOBS
            SET JOBTITLE = %s, JOBDESCRIPTION = %s, LOCATION = %s,
                SALARYRANGE = %s, JOBTYPE = %s, DATECLOSING = %s
            WHERE JOBID = %s
            """,
            (
                job.title,
                job.description,
                job.location,
                job.salary_range,
                job.job_type,
                job.date_closing,
                job_id,
            ),
        )
        conn.commit()

        if cursor.rowcount == 0:  # Si aucune ligne n'a été affectée
            raise HTTPException(status_code=404, detail="Job non trouvé")

        return {"message": "Offre mise à jour avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
