import secrets

# Génère une clé sécurisée de 32 octets (256 bits)
secure_key = secrets.token_hex(32)
print("Votre clé secrète :", secure_key)
