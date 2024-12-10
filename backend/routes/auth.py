import bcrypt
from fastapi import APIRouter, HTTPException, Query
from database import get_snowflake_connection
from models import UserCreate, UserLogin, ActivationRequest
import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from email_utils import send_activation_email
import random
from enum import Enum
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import logging


# Charger les variables d'environnement
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY est manquant dans le fichier .env")

router = APIRouter()

class Role(str, Enum):
    candidat = "Candidat"
    recruteur = "Recruteur"

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Génère un token JWT avec une expiration facultative.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=1)  # Durée par défaut : 1 heure
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    """
    Décodage d'un token JWT.
    """
    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return decoded_token



@router.post("/candidate/signup")
def candidate_signup(user: UserCreate):
    """
    Inscription pour les candidats avec envoi d'un code d'activation.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        # Vérifier si l'email ou le nom d'utilisateur existe 
        cursor.execute("SELECT 1 FROM Users WHERE Email = %s OR Username = %s", (user.email, user.username))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email ou nom d'utilisateur déjà utilisé.")

        # Générer un code d'activation
        activation_code = str(random.randint(100000, 999999))
        activation_expiration = datetime.utcnow() + timedelta(minutes=10)

        # Hachage du mot de passe
        hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())

        # Gérer `skills`
        skills = ",".join(user.skills) if user.skills else None  # Convertir la liste en chaîne ou laisser `NULL`

        # Insérer l'utilisateur avec un code d'activation
        cursor.execute("""
            INSERT INTO Users (Username, Email, Password, Role, DateCreated, Activation_Code, Activation_Code_Expiration, IsActive, Skills)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP(), %s, %s, FALSE, %s)
        """, (user.username, user.email, hashed_password.decode('utf-8'), Role.candidat.value, activation_code, activation_expiration, skills))
        conn.commit()

        # Envoi de l'email
        send_activation_email(user.email, activation_code)

        return {"success": True, "message": "Inscription réussie. Vérifiez votre email pour le code d'activation."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'inscription : {str(e)}")
    finally:
        cursor.close()
        conn.close()






@router.post("/candidate/activate")
def activate_account(request: ActivationRequest):
    """
    Vérifie le code d'activation et active le compte.
    """
    email = request.email
    activation_code = request.activation_code
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT Activation_Code, Activation_Code_Expiration
            FROM Users WHERE Email = %s
        """, (email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

        db_activation_code, expiration_time = user

        if db_activation_code != activation_code:
            raise HTTPException(status_code=400, detail="Code d'activation incorrect.")
        if datetime.utcnow() > expiration_time:
            raise HTTPException(status_code=400, detail="Code d'activation expiré.")

        # Activer le compte
        cursor.execute("""
            UPDATE Users
            SET Activation_Code = NULL, Activation_Code_Expiration = NULL, IsActive = TRUE
            WHERE Email = %s
        """, (email,))
        conn.commit()

        return {"success": True, "message": "Compte activé avec succès !"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'activation du compte : {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.post("/candidate/verify-code")
def verify_activation_code(request: ActivationRequest):
    """
    Vérifie si le code d'activation est valide et active le compte.
    """
    email = request.email
    activation_code = request.activation_code
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        # Vérifier le code d'activation et sa validité
        cursor.execute("""
            SELECT Activation_Code, Activation_Code_Expiration, IsActive FROM Users
            WHERE Email = %s
        """, (email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

        db_activation_code, activation_expiration, is_active = user

        if is_active:
            raise HTTPException(status_code=400, detail="Le compte est déjà activé.")
        
        if db_activation_code != activation_code:
            raise HTTPException(status_code=400, detail="Code d'activation incorrect.")

        if datetime.utcnow() > activation_expiration:
            raise HTTPException(status_code=400, detail="Code d'activation expiré.")

        # Mettre à jour la colonne ISACTIVE et supprimer le code d'activation
        cursor.execute("""
            UPDATE Users
            SET IsActive = TRUE,
                Activation_Code = NULL,
                Activation_Code_Expiration = NULL
            WHERE Email = %s
        """, (email,))
        conn.commit()

        return {"success": True, "message": "Compte activé avec succès."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la vérification : {str(e)}")
    
    finally:
        cursor.close()
        conn.close()
        
        
class LoginRequest(BaseModel):
    email: str
    password: str
    
logger = logging.getLogger(__name__)


@router.post("/login")
def login(request: LoginRequest):
    logger.info(f"Vérification pour l'utilisateur avec l'email : {request.email}")
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        
        cursor.execute("SELECT UserId, Username, Password, Role, IsActive FROM Users WHERE Email = %s", (request.email,))
        user = cursor.fetchone()

        if not user:
            logger.error("Utilisateur introuvable.")
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

        user_id, db_username, db_password, role, is_active = user

        # Vérifiez si le compte est actif
        if not is_active:
            logger.error("Compte inactif.")
            raise HTTPException(status_code=403, detail="Compte inactif. Veuillez activer votre compte.")

        
        if not bcrypt.checkpw(request.password.encode("utf-8"), db_password.encode("utf-8")):
            logger.error("Mot de passe incorrect.")
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

        # Générer le token JWT 
        token = create_access_token(data={
            "sub": db_username,
            "user_id": user_id,
            "role": role
        })
        logger.info(f"Connexion réussie pour l'utilisateur {db_username} avec le rôle {role}")

        # Retourner les informations au frontend
        return {
            "access_token": token,
            "token_type": "bearer",
            "username": db_username,
            "recruiter_id": user_id if role.lower() == "recruteur" else None,
            "role": role
        }
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        logger.error(f"Erreur lors de la connexion : {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")
    finally:
        cursor.close()
        conn.close()




@router.get("/candidate/profile")
def get_candidate_profile(username: str = Query(...)):
    """
    Récupère les informations du profil d'un candidat.
    """
    logger.info(f"Récupération du profil pour l'utilisateur : {username}")

    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT UserId, Username, Email, Domain, Country, Skills
            FROM Users
            WHERE Username = %s
        """, (username,))
        profile = cursor.fetchone()

        if not profile:
            logger.error(f"Profil introuvable pour le username : {username}")
            raise HTTPException(status_code=404, detail="Profil introuvable.")

        # Mapper les résultats
        skills = profile[5]
        if isinstance(skills, str):
            skills_list = skills.split(",")
        elif isinstance(skills, list):
            skills_list = skills
        else:
            skills_list = []

        result = {
            "userId": profile[0],
            "username": profile[1],
            "email": profile[2],
            "domain": profile[3],
            "country": profile[4],
            "skills": skills_list
        }

        logger.info("Profil récupéré avec succès.")
        return {"success": True, "profile": result}

    except Exception as e:
        logger.error(f"Erreur lors de la récupération du profil : {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération du profil : {str(e)}")
    finally:
        cursor.close()
        conn.close()






class UpdateProfileRequest(BaseModel):
    email: str
    username: str  
    new_username: Optional[str] = None  
    domain: Optional[str] = None
    country: Optional[str] = None
    skills: Optional[List[str]] = None  



@router.put("/candidate/update-profile")
def update_candidate_profile(update_request: UpdateProfileRequest):
    """
    Met à jour le profil d'un candidat et retourne l'ID de l'utilisateur.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        logger.info(f"Payload reçu : {update_request.dict()}")

        # Vérifiez si l'utilisateur existe
        cursor.execute("""SELECT UserId FROM Users WHERE Email = %s""", (update_request.email,))
        user = cursor.fetchone()

        if not user:
            logger.error("Utilisateur introuvable.")
            raise HTTPException(status_code=404, detail="Identifiant du profil introuvable. Veuillez vous reconnecter.")

        user_id = user[0]  # Récupérer l'ID de l'utilisateur

        # Mettre à jour le `username` si un nouveau est fourni
        if update_request.new_username:
            cursor.execute("""SELECT 1 FROM Users WHERE Username = %s""", (update_request.new_username,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Le nouveau nom d'utilisateur est déjà pris.")
            cursor.execute("""UPDATE Users SET Username = %s WHERE Email = %s""",
                           (update_request.new_username, update_request.email))

        # Mettre à jour les autres informations
        cursor.execute("""
            UPDATE Users
            SET Domain = %s, Country = %s, Skills = %s
            WHERE Email = %s
        """, (
            update_request.domain,
            update_request.country,
            ",".join(update_request.skills) if update_request.skills else None,
            update_request.email,
        ))

        conn.commit()

        # Renvoyer l'ID de l'utilisateur dans la réponse
        logger.info("Profil mis à jour avec succès.")
        return {
            "success": True,
            "message": "Profil mis à jour avec succès.",
            "user_id": user_id  # Inclure l'ID dans la réponse
        }

    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour : {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour : {str(e)}")

    finally:
        cursor.close()
        conn.close()



@router.put("/candidate/update-skills")
def update_candidate_skills(email: str, skills: List[str]):
    """
    Met à jour les compétences d'un candidat.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        # Récupérer le UserID de l'utilisateur
        cursor.execute("""
            SELECT UserID FROM Users WHERE Email = %s
        """, (email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

        user_id = user[0]

        # Supprimer les anciennes compétences
        cursor.execute("""
            DELETE FROM CandidateSkills WHERE UserID = %s
        """, (user_id,))

        # Insérer les nouvelles compétences
        for skill in skills:
            if skill.strip():  # Vérifier que la compétence n'est pas vide
                cursor.execute("""
                    INSERT INTO CandidateSkills (UserID, Skill)
                    VALUES (%s, %s)
                """, (user_id, skill.strip()))

        conn.commit()
        return {"success": True, "message": "Compétences mises à jour avec succès."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour des compétences : {str(e)}")
    finally:
        cursor.close()
        conn.close()

@router.get("/candidate/applications")
def get_candidate_applications(user_id: int):
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT a.ApplicationID, j.JobTitle, a.ApplicationDate, a.Status
            FROM Applications a
            JOIN Jobs j ON a.JobID = j.JobID
            WHERE a.UserId = %s
        """, (user_id,))
        applications = cursor.fetchall()

        result = [
            {"applicationId": row[0], "jobTitle": row[1], "applicationDate": row[2], "status": row[3]}
            for row in applications
        ]
        return {"success": True, "applications": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des candidatures : {str(e)}")
    finally:
        cursor.close()
        conn.close()

class RecruiterCreate(BaseModel):
    companyName: str
    companySize: str
    industry: str
    location: str
    email: EmailStr
    password: str
    role: str = "Recruteur"  # Par défaut pour recruteur
    
@router.post("/recruiter/signup")
def recruiter_signup(user: RecruiterCreate):
    """
    Inscription d'un recruteur dans les tables USERS et RECRUITERS.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    # Hachage du mot de passe
    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

    try:
        # Vérifier si l'email est déjà utilisé
        cursor.execute("""
            SELECT 1 FROM USERS WHERE EMAIL = %s
        """, (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email déjà utilisé.")

        # Insérer le recruteur dans la table USERS
        cursor.execute("""
            INSERT INTO USERS (USERNAME, EMAIL, PASSWORD, ROLE, DATECREATED)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP())
        """, (user.companyName, user.email, hashed_password.decode("utf-8"), "Recruteur"))

        # Récupérer USERID du recruteur récemment ajouté
        cursor.execute("""
            SELECT USERID FROM USERS WHERE EMAIL = %s
        """, (user.email,))
        user_id = cursor.fetchone()
        if not user_id:
            raise HTTPException(status_code=500, detail="Impossible de récupérer l'ID utilisateur.")

        # Insérer les informations spécifiques dans la table RECRUITERS
        cursor.execute("""
            INSERT INTO RECRUITERS (USERID, COMPANYNAME, COMPANYSIZE, INDUSTRY, LOCATION, DATEJOINED)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP())
        """, (user_id[0], user.companyName, user.companySize, user.industry, user.location))

        conn.commit()
        return {"message": "Recruteur enregistré avec succès."}

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        print(f"Erreur : {e}")  # Log pour aider à déboguer en cas d'erreur inattendue
        raise HTTPException(status_code=500, detail="Erreur d'inscription du recruteur.")
    finally:
        cursor.close()
        conn.close()


        
@router.post("/auth/login")
def recruiter_login(request: LoginRequest):
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        # Récupérer les informations utilisateur
        cursor.execute("""
            SELECT UserId, Password, Role
            FROM USERS
            WHERE Email = %s
        """, (request.email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")

        user_id, db_password, role = user

        # Vérification du mot de passe
        if not bcrypt.checkpw(request.password.encode("utf-8"), db_password.encode("utf-8")):
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")

        # Vérification du rôle
        if role.lower() != "recruteur":
            raise HTTPException(status_code=403, detail="Accès refusé. Ce compte n'est pas un recruteur.")

        # Générer le token JWT
        token = create_access_token(
            data={"sub": request.email, "role": role, "recruiter_id": user_id},
            expires_delta=timedelta(hours=1)
        )

        # Retourner les informations de connexion
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": role,
            "recruiter_id": user_id
        }

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur interne du serveur.")
    finally:
        cursor.close()
        conn.close()


