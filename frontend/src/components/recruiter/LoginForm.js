import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../LoginSignup.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8085/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Réponse de l'API :", data); // Log pour vérifier les données
        localStorage.setItem("token", data.access_token); // Stocker le token JWT
        localStorage.setItem("role", data.role); // Stocker le rôle
        localStorage.setItem("recruiter_id", data.recruiter_id); // Stocker l'ID recruteur
        alert("Connexion réussie !");
        navigate("/recruiter/dashboard");
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || "Identifiants incorrects.");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      setErrorMessage(
        "Une erreur s'est produite. Vérifiez votre connexion et réessayez."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Recruteur - Connexion</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email :</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-label="Email"
        />
        <label htmlFor="password">Mot de passe :</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          aria-label="Mot de passe"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p>
        Pas encore recruteur ?{" "}
        <button
          onClick={() => navigate("/recruiter/signup")}
          className="signup-link"
        >
          Inscrivez-vous
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
