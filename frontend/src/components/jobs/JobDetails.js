import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./JobDetails.css";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8085/jobs/get_job_details?id=${id}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des détails de l'offre.");
  
        const data = await response.json();
        setJob(data.data || {}); // Vérifiez que 'data' correspond au backend
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchJobDetails();
  }, [id]);
  

  if (loading) return <p className="loading-message">Chargement des détails...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="job-details">
      <h1 className="job-title">{job?.job_title || "Titre non spécifié"}</h1>
      <p><strong>Employeur : </strong>{job?.employer_name || "Employeur inconnu"}</p>
      <p><strong>Localisation : </strong>{job?.location || "Lieu non spécifié"}</p>
      <p><strong>Description : </strong>{job?.job_description || "Description non disponible"}</p>
      <p><strong>Date de publication : </strong>{job?.date_posted || "Non spécifiée"}</p>
      <a
        href={job?.job_link || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="apply-button"
      >
        Postuler
      </a>
      <button className="back-button" onClick={() => navigate("/candidate/dashboard")}>
        Retour à la liste des offres
      </button>
    </div>
  );
}

export default JobDetails;
