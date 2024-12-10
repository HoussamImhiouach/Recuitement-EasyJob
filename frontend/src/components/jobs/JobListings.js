import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./JobListing.css";

function JobListings({ showInternalJobs, isAuthenticated }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Utiliser pour rediriger l'utilisateur

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token"); // Récupération du token
        if (!token)
          throw new Error("Vous devez être connecté pour voir les offres.");

        const endpoint = showInternalJobs
          ? "http://localhost:8085/jobs/internal-jobs"
          : "http://localhost:8085/jobs/external-jobs";

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok)
          throw new Error("Erreur lors de la récupération des offres.");
        const data = await response.json();
        setJobs(data.jobs || []); // Vérifiez que 'jobs' correspond au backend
      } catch (err) {
        setError(err.message || "Une erreur s'est produite.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [showInternalJobs]);

  const handleApply = async (jobId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Veuillez vous connecter pour postuler à une offre.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8085/candidate/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: profileData.userId, job_id: jobId }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || "Erreur lors de la candidature.");

      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return <p className="loading-message">Chargement des offres...</p>;
  if (error) return <p className="error-message">Erreur : {error}</p>;

  return (
    <div className="job-listings">
      <h2>{showInternalJobs ? "Offres Internes" : "Offres Externes"}</h2>
      {jobs.length === 0 ? (
        <p className="no-results-message">Aucune offre trouvée.</p>
      ) : (
        <div className="job-grid">
          {jobs.map((job, index) => (
            <div
              key={index}
              className={`job-card ${
                showInternalJobs ? "internal-job" : "external-job"
              }`}
            >
              <h3>{job.jobTitle || "Titre non spécifié"}</h3>
              <p>{job.jobDescription || "Description non spécifiée"}</p>
              <p>
                <strong>Localisation :</strong> {job.location || "Non précisée"}
              </p>
              <p>
                <strong>Salaire :</strong> {job.salaryRange || "Non précisé"}
              </p>
              <p>
                <strong>Type :</strong> {job.jobType || "Non spécifié"}
              </p>
              <p>
                <strong>Date :</strong>{" "}
                {new Date(job.datePosted).toLocaleDateString()}
              </p>
              <button
                className="apply-button"
                onClick={() => handleApply(job.jobTitle || "Poste inconnu")}
              >
                Postuler
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JobListings;
