import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EditJob = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;

  if (!job) {
    alert("Aucune offre trouvée pour modification.");
    navigate("/recruiter/dashboard");
    return null;
  }

  const [formData, setFormData] = useState({
    title: job.title || "",
    description: job.description || "",
    location: job.location || "",
    salary: job.salary_range || "",
    job_type: job.job_type || "",
    date_closing: job.date_closing || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Veuillez vous connecter pour modifier une offre.");
      setLoading(false);
      return;
    }

    const payload = {
      job_id: job.job_id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      salary_range: formData.salary.trim(),
      job_type: formData.job_type.trim(),
      date_closing: formData.date_closing || null,
    };

    console.log("Payload envoyé :", payload);

    try {
      const response = await fetch(
        `http://localhost:8085/recruiter/edit-job/${job.job_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Offre mise à jour avec succès !");
        navigate("/recruiter/dashboard");
      } else {
        const error = await response.json();
        console.error("Erreur backend :", error);
        alert(`Erreur : ${JSON.stringify(error, null, 2)}`);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Une erreur réseau s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Modifier une Offre</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <label>Titre de l'offre :</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Description :</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>

        <label>Localisation :</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <label>Échelle salariale :</label>
        <input
          type="text"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
        />

        <label>Type d'offre :</label>
        <input
          type="text"
          name="job_type"
          value={formData.job_type}
          onChange={handleChange}
        />

        <label>Date de clôture :</label>
        <input
          type="date"
          name="date_closing"
          value={formData.date_closing}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Mise à jour..." : "Sauvegarder"}
        </button>
        <button type="button" onClick={() => navigate("/recruiter/dashboard")}>
          Annuler
        </button>
      </form>
    </div>
  );
};

export default EditJob;
