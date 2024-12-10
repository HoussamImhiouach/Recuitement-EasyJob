import React, { useState } from "react";

const CreateJobForm = () => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    requiredSkills: "",
    location: "",
    salaryRange: "",
    jobType: "",
    dateClosing: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Veuillez vous connecter pour créer une offre.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8085/recruiter/create-job", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Offre créée avec succès !");
        setFormData({
          jobTitle: "",
          jobDescription: "",
          requiredSkills: "",
          location: "",
          salaryRange: "",
          jobType: "",
          dateClosing: "",
        });
      } else {
        const error = await response.json();
        alert(`Erreur : ${error.detail}`);
      }
    } catch (error) {
      console.error("Erreur lors de la création :", error);
      alert("Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Créer une Offre</h2>
      <form onSubmit={handleSubmit}>
        <label>Titre de l'offre :</label>
        <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />

        <label>Description :</label>
        <textarea name="jobDescription" value={formData.jobDescription} onChange={handleChange} required></textarea>

        <label>Compétences requises :</label>
        <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} required />

        <label>Localisation :</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required />

        <label>Échelle salariale :</label>
        <input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleChange} required />

        <label>Type de poste :</label>
        <input type="text" name="jobType" value={formData.jobType} onChange={handleChange} required />

        <label>Date de clôture :</label>
        <input type="date" name="dateClosing" value={formData.dateClosing} onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </div>
  );
};

export default CreateJobForm;
