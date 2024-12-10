import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

def send_activation_email(recipient_email, activation_code):
    """
    Envoie un e-mail d'activation contenant le code d'activation.
    """
    subject = "Code d'activation pour votre compte Easy Job"
    body = f"""
    Bonjour,

    Merci pour votre incription sur notre plateforme Easy Job.
    Voici votre code d'activation : {activation_code}

    Veuillez utiliser ce code pour activer votre compte.

    Cordialement,
    L'équipe Easy Job
    """

    # Créer un e-mail multipart
    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER
    msg["To"] = recipient_email
    msg["Subject"] = subject

    # Ajouter le texte du corps
    msg.attach(MIMEText(body, "plain"))

    try:
        # Connexion au serveur SMTP
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Démarrer le mode sécurisé
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, recipient_email, msg.as_string())
        print("E-mail envoyé avec succès !")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'e-mail : {e}")
        raise e
