from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from database import get_snowflake_connection
import os
import tempfile
from docx import Document
import PyPDF2
import requests

router = APIRouter()
# saluuuuuuuut

@router.get("/jobs")
def get_candidate_jobs(query: str = "", location: str = ""):
    """
    Récupérer les offres d'emploi internes et externes.
    """
    api_key = os.getenv("RAPIDAPI_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Clé API manquante dans l'environnement.")

    conn = get_snowflake_connection()
    cursor = conn.cursor()
    try:
        # Récupérer les offres internes
        cursor.execute("""
            SELECT JOBID, JOBTITLE, JOBDESCRIPTION, LOCATION, SALARYRANGE, JOBTYPE, DATEPOSTED
            FROM JOBS
        """)
        recruiter_jobs = cursor.fetchall()
        recruiter_job_list = [
            {
                "job_id": row[0],
                "title": row[1],
                "description": row[2],
                "location": row[3],
                "salary": row[4],
                "type": row[5],
                "source": "Recruiter",
                "date_posted": row[6],
            }
            for row in recruiter_jobs
        ]

        # Récupérer les offres via l'API externe
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        }
        params = {"query": query, "location": location}
        response = requests.get("https://jsearch.p.rapidapi.com/search", headers=headers, params=params)

        if response.status_code != 200:
            return recruiter_job_list  # Retourner uniquement les offres internes en cas d'échec API.

        api_jobs = response.json().get("data", [])
        api_job_list = [
            {
                "job_id": idx,
                "title": job.get("job_title", "Non spécifié"),
                "description": job.get("job_description", "Non spécifié"),
                "location": job.get("location", "Non spécifié"),
                "salary": job.get("salary", "N/A"),
                "type": job.get("job_employment_type", "Non spécifié"),
                "source": "API",
                "date_posted": job.get("posted_at", "Non spécifié"),
            }
            for idx, job in enumerate(api_jobs)
        ]

        return recruiter_job_list + api_job_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/candidate/upload-cv")
async def upload_cv(file: UploadFile = File(...), user_id: int = Form(...)):
    """
    Traiter le CV d'un candidat et extraire les compétences.
    """
    temp_file_path = None
    try:
        # Sauvegarde temporaire du fichier
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(file.file.read())
            temp_file_path = temp_file.name

        # Extraire le texte du CV
        text = extract_text_from_file(file.filename, temp_file_path)

        # Extraire les compétences
        skills = extract_skills(text)

        # Enregistrer les compétences dans la base de données
        save_skills_to_db(user_id, skills)

        return {"message": "CV traité avec succès.", "skills": skills}
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


def extract_text_from_file(filename: str, file_path: str) -> str:
    """
    Extraire le texte d'un fichier CV.
    """
    if filename.endswith(".pdf"):
        with open(file_path, "rb") as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            return "".join(page.extract_text() for page in pdf_reader.pages)
    elif filename.endswith(".docx"):
        doc = Document(file_path)
        return " ".join([p.text for p in doc.paragraphs])
    else:
        raise HTTPException(status_code=400, detail="Type de fichier non pris en charge.")


def extract_skills(text: str):
    """
    Extraire les compétences à partir du texte.
    """
    skill_keywords = {"Python", "Java", "React", "FastAPI", "Machine Learning", "Data Analysis"}
    return [skill for skill in skill_keywords if skill.lower() in text.lower()]


def save_skills_to_db(user_id: int, skills: list):
    """
    Enregistrer les compétences dans la base de données.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()
    try:
        for skill in skills:
            cursor.execute("""
                INSERT INTO CANDIDATE_SKILLS (USER_ID, SKILL)
                SELECT %s, %s WHERE NOT EXISTS (
                    SELECT 1 FROM CANDIDATE_SKILLS WHERE USER_ID = %s AND SKILL = %s
                )
            """, (user_id, skill, user_id, skill))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

@router.post("/apply")
def apply_to_job(user_id: int, job_id: int):
    """
    Enregistrer une candidature pour un utilisateur donné et un job donné.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        # Vérifiez si la candidature existe déjà
        cursor.execute("""
            SELECT 1 FROM Applications WHERE UserId = %s AND JobId = %s
        """, (user_id, job_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Vous avez déjà postulé à ce poste.")

        # Insérez la nouvelle candidature
        cursor.execute("""
            INSERT INTO Applications (UserId, JobId, ApplicationDate, Status)
            VALUES (%s, %s, CURRENT_TIMESTAMP, 'En attente')
        """, (user_id, job_id))
        conn.commit()

        return {"success": True, "message": "Candidature enregistrée avec succès."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la candidature : {str(e)}")
    finally:
        cursor.close()
        conn.close()
