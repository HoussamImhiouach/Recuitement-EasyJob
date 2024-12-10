from fastapi import APIRouter, HTTPException
from database import get_snowflake_connection
from models import User

router = APIRouter()


@router.get("/")
def get_users():
    """
    Récupérer la liste de tous les utilisateurs.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        # Sélectionner la base et le schéma
        cursor.execute("USE DATABASE RECRUITEMENT_DB")
        cursor.execute("USE SCHEMA RECRUITEMENT_PLATFORM")
        
        # Récupérer les utilisateurs
        cursor.execute("""
            SELECT UserId, Username, Email, Role, DateCreated, LastLogin
            FROM Users
        """)
        rows = cursor.fetchall()

        if not rows:
            return {"success": False, "message": "Aucun utilisateur trouvé"}

        users = [User(*row).__dict__ for row in rows]
        return {"success": True, "users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des utilisateurs : {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/{user_id}")
def get_user_by_id(user_id: int):
    """
    Récupérer les informations d'un utilisateur par ID.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT UserId, Username, Email, Role, DateCreated, LastLogin
            FROM Users WHERE UserId = %s
        """, (user_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        user = User(*row).__dict__
        return {"success": True, "user": user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de l'utilisateur : {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.delete("/{user_id}")
def delete_user(user_id: int):
    """
    Supprimer un utilisateur par ID.
    """
    conn = get_snowflake_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM Users WHERE UserId = %s", (user_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

        conn.commit()
        return {"success": True, "message": "Utilisateur supprimé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression de l'utilisateur : {str(e)}")
    finally:
        cursor.close()
        conn.close()
