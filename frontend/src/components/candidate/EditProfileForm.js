import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../LoginSignup.css";

const EditProfileForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    domain: "",
    country: "",
    skills: [],
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const username = localStorage.getItem("username");
      if (!username) {
        alert(
          "Erreur : Nom d'utilisateur introuvable. Veuillez vous reconnecter."
        );
        navigate("/candidate/login");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8085/auth/candidate/profile?username=${username}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || "Erreur lors de la récupération du profil."
          );
        }

        const data = await response.json();
        setFormData({
          username: data.profile.username || "",
          email: data.profile.email || "",
          domain: data.profile.domain || "",
          country: data.profile.country || "",
          skills: Array.isArray(data.profile.skills)
            ? data.profile.skills
            : data.profile.skills
            ? data.profile.skills.split(",")
            : [],
        });
      } catch (error) {
        alert("Erreur lors de la récupération du profil : " + error.message);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillsChange = (e, index) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = e.target.value;
    setFormData({ ...formData, skills: updatedSkills });
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ""] });
  };

  const removeSkill = (index) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: updatedSkills });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(""); // Réinitialiser le message de succès

    const payload = {
      email: formData.email,
      username: localStorage.getItem("username"),
      new_username:
        formData.username !== localStorage.getItem("username")
          ? formData.username
          : null,
      domain: formData.domain,
      country: formData.country,
      skills: formData.skills,
    };

    console.log("Payload envoyé au backend :", payload);

    try {
      const response = await fetch(
        "http://localhost:8085/auth/candidate/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Erreur lors de la mise à jour du profil."
        );
      }

      setSuccessMessage("Profil mis à jour avec succès !");
    } catch (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Modifier Profil</h2>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>Nom d'utilisateur :</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label>Email :</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          readOnly
        />

        <label>Domaine :</label>
        <input
          type="text"
          name="domain"
          value={formData.domain}
          onChange={handleChange}
          required
        />

        <label>Pays :</label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        />

        <label>Compétences :</label>
        {formData.skills.map((skill, index) => (
          <div key={index}>
            <input
              type="text"
              value={skill}
              onChange={(e) => handleSkillsChange(e, index)}
            />
            <button type="button" onClick={() => removeSkill(index)}>
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" onClick={addSkill}>
          Ajouter une compétence
        </button>

        <label>Télécharger un CV :</label>
        <input
          type="file"
          name="file"
          onChange={(e) =>
            setFormData({ ...formData, file: e.target.files[0] })
          }
        />

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
          <button type="button" onClick={() => navigate("/")}>
            Retour à l'accueil
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;
