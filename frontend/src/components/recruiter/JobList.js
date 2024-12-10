import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Veuillez vous connecter pour consulter vos offres.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8085/recruiter/my-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        const error = await response.json();
        alert(`Erreur : ${error.detail}`);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération :", error);
      alert("Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (job) => {
    navigate("/recruiter/edit-job", { state: { job } });
  };

  return (
    <div className="job-listings">
      <h2>Mes Offres</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : jobs.length > 0 ? (
        <ul>
          {jobs.map((job) => (
            <li key={job.job_id}>
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p>
                <strong>Localisation :</strong> {job.location}
              </p>
              <p>
                <strong>Salaire :</strong> {job.salary_range}
              </p>
              <button onClick={() => handleEditClick(job)}>Modifier</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune offre trouvée.</p>
      )}
    </div>
  );
};

export default JobList;
