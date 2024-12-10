import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LoginSignup.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [faceLoginLoading, setFaceLoginLoading] = useState(false);
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

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.detail || "Erreur de connexion.");
        return;
      }

      const data = await response.json();
      localStorage.setItem("username", data.username); // Stocke le `username`
      localStorage.setItem("token", data.access_token); // Stocke le token
      localStorage.setItem("isLoggedIn", true);

      navigate("/"); // Redirection correcte vers la page d'accueil
    } catch (error) {
      setErrorMessage("Erreur lors de la connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async () => {
    setFaceLoginLoading(true);
    setErrorMessage("");
    try {
      const video = document.createElement("video");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      setTimeout(() => {
        ctx.drawImage(video, 0, 0, 640, 480);
        const imageData = canvas.toDataURL("image/png");

        fetch("http://localhost:8085/auth/candidate/validate-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              localStorage.setItem("username", data.username);
              localStorage.setItem("isLoggedIn", true);
              localStorage.setItem("token", data.access_token);
              navigate("/");
            } else {
              setErrorMessage("Échec de la connexion avec Face ID.");
            }
          })
          .catch(() => {
            setErrorMessage("Erreur lors de la connexion avec Face ID.");
          })
          .finally(() => {
            stream.getTracks().forEach((track) => track.stop());
            setFaceLoginLoading(false);
          });
      }, 3000);
    } catch {
      setErrorMessage("Impossible d'accéder à la caméra.");
      setFaceLoginLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Connexion</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email :</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          aria-label="Email"
        />
        <label>Mot de passe :</label>
        <input
          type="password"
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
      <div className="or-divider">
        <span>Ou</span>
      </div>
      <button
        type="button"
        onClick={handleFaceLogin}
        disabled={faceLoginLoading}
        className="face-login-btn"
      >
        {faceLoginLoading ? "Validation du visage..." : "Connexion via Face ID"}
      </button>
      <p>
        Pas encore membre ?{" "}
        <button onClick={() => navigate("/candidate/signup")}>
          Inscrivez-vous
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
