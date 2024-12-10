from fastapi import APIRouter, HTTPException, Query
import requests
import os
from database import get_snowflake_connection
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

# Créer le routeur FastAPI pour les jobs
router = APIRouter()

# Clé et hôte de l'API
API_KEY = os.getenv("RAPIDAPI_KEY")
API_HOST = "jsearch.p.rapidapi.com"

if not API_KEY:
    raise RuntimeError("RAPIDAPI_KEY est manquant dans le fichier .env")


@router.get("/get_jobs")
def get_jobs(
    query: str = Query(..., description="Le mot-clé ou titre du poste"),
    location: str = Query(..., description="La localisation du poste"),
    page: int = Query(1, description="Numéro de la page à récupérer"),
    skills: str = Query("", description="Compétences associées au poste")
):
    """
    Endpoint pour récupérer les offres d'emploi via JSearch API
    """
    if not query or not location:
        raise HTTPException(status_code=400, detail="Les champs 'query' et 'location' sont obligatoires.")

    # URL pour l'API
    url = f"https://{API_HOST}/search"

    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST
    }

    params = {
        "query": f"{query} {skills}",
        "location": location,
        "page": page
    }

    try:
        # Appel à l'API
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Lève une exception si une erreur HTTP survient
        data = response.json()

        # Vérifier si les données contiennent des résultats
        if "data" in data and data["data"]:
            return {"success": True, "data": data["data"]}
        else:
            return {"success": False, "message": "Aucune offre trouvée pour cette recherche."}

    except requests.exceptions.RequestException as e:
        # Gestion des erreurs API
        raise HTTPException(
            status_code=response.status_code if response else 500,
            detail=f"Erreur lors de la récupération des offres : {str(e)}"
        )


@router.get("/get_job_details")
def get_job_details(id: str):
    """
    Endpoint pour récupérer les détails d'une offre d'emploi spécifique via JSearch API
    """
    if not id:
        raise HTTPException(status_code=400, detail="L'identifiant de l'offre est obligatoire.")

    url = f"https://{API_HOST}/job-details?id={id}"
    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST,
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Lève une exception si une erreur HTTP survient

        data = response.json()
        if data:
            return {"success": True, "data": data}
        else:
            raise HTTPException(status_code=404, detail="Détails de l'offre introuvables.")
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=response.status_code if response else 500,
            detail=f"Erreur lors de la récupération des détails : {str(e)}"
        )

@router.get("/internal-jobs")
def get_internal_jobs():
    """
    Récupère les offres internes.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT JobID, JobTitle, JobDescription, Location, SalaryRange, JobType, DatePosted
            FROM Jobs
        """)
        jobs = cursor.fetchall()

        # Formater les données pour l'API
        result = [
            {
                "jobId": job[0],
                "jobTitle": job[1],
                "jobDescription": job[2],
                "location": job[3],
                "salaryRange": job[4],
                "jobType": job[5],
                "datePosted": job[6]
            }
            for job in jobs
        ]

        return {"success": True, "jobs": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des offres : {str(e)}")
    finally:
        cursor.close()
        conn.close()




@router.get("/external-jobs")
async def get_external_jobs():
    # Exemple de données fictives pour test
    jobs = [
        {
            "job_id": 2,
            "title": "Designer UX/UI",
            "description": "Rejoignez une start-up en pleine croissance.",
            "location": "New York, USA",
            "salary": "60k-70k",
            "type": "Temps partiel",
        }
    ]
    return {"data": jobs}

