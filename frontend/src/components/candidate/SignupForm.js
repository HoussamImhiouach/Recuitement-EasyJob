import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LoginSignup.css";

const CandidateSignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    domain: "",
    country: "",
    skills: [],
  });
  const [activationCode, setActivationCode] = useState("");
  const [step, setStep] = useState(1); // Étape 1 : Inscription, Étape 2 : Vérification
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Options pour les listes déroulantes
  const domainOptions = [
    "Informatique",
    "Marketing",
    "Finance",
    "Santé",
    "Éducation",
    "Droit",
    "Ingénierie",
    "Design",
    "Communication",
    "Recherche",
  ];

  const countryOptions = [
    "France",
    "Canada",
    "États-Unis",
    "Maroc",
    "Allemagne",
    "Inde",
    "Japon",
    "Brésil",
    "Royaume-Uni",
    "Australie",
  ];

  const skillOptions = [
    "Python",
    "Java",
    "React",
    "Machine Learning",
    "Data Analysis",
    "Design Thinking",
    "SEO",
    "Cloud Computing",
    "Cybersécurité",
    "Gestion de projet",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    const selectedSkills = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData({ ...formData, skills: selectedSkills });
  };

  const handleSignup = async (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire
    setLoading(true); // Active l'état de chargement

    // Validation des champs requis avant l'envoi de la requête
    if (!formData.username || !formData.email || !formData.password) {
      alert("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8085/auth/candidate/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        // Succès : Afficher un message et passer à l'étape suivante
        alert("Un code d'activation a été envoyé à votre email.");
        setStep(2); // Passer à l'étape de vérification
      } else {
        // Gestion des erreurs renvoyées par le serveur
        const error = await response.json();
        alert(
          `Erreur : ${
            error.detail || "Une erreur s'est produite lors de l'inscription."
          }`
        );
      }
    } catch (error) {
      // Gestion des erreurs côté client
      console.error("Erreur d'inscription :", error);
      alert("Une erreur s'est produite. Veuillez vérifier votre connexion.");
    } finally {
      setLoading(false); // Désactive l'état de chargement dans tous les cas
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8085/auth/candidate/verify-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            activation_code: activationCode, // Correction ici
          }),
        }
      );

      if (response.ok) {
        alert("Code vérifié avec succès !");
        navigate("/candidate/login");
      } else {
        const error = await response.json();
        console.error("Erreur côté serveur :", error);
        alert(`Erreur : ${error.detail || "Erreur inconnue."}`);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification :", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {step === 1 ? (
        <form onSubmit={handleSignup}>
          <h2>Inscription Candidat</h2>
          <label>Nom d'utilisateur :</label>
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label>Email :</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Mot de passe :</label>
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label>Domaine :</label>
          <select
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir un domaine --</option>
            {domainOptions.map((domain, index) => (
              <option key={index} value={domain}>
                {domain}
              </option>
            ))}
          </select>

          <label>Pays :</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir un pays --</option>
            {countryOptions.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>

          <label>Compétences :</label>
          <select
            name="skills"
            multiple
            value={formData.skills}
            onChange={handleSkillChange}
            required
          >
            {skillOptions.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <h2>Vérification du Code</h2>
          <label>Email :</label>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <label>Code d'activation :</label>
          <input
            type="text"
            placeholder="Code d'activation"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Vérification..." : "Vérifier"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CandidateSignupForm;
