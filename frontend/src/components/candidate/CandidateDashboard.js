import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CandidateDashboard.css";

const CandidateDashboard = ({ profileData }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!profileData?.userId) {
        alert(
          "Erreur : Identifiant du profil introuvable. Veuillez vous reconnecter."
        );
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8085/candidate/applications?user_id=${profileData.userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok)
          throw new Error("Erreur lors de la récupération des candidatures.");

        const data = await response.json();
        setApplications(data.applications || []);
      } catch (err) {
        alert(err.message);
      }
    };

    fetchApplications();
  }, [profileData?.userId]);

  return (
    <div className="dashboard-container">
      <header>
        <h1>Bienvenue, {profileData?.username || "Candidat"}</h1>
        <button onClick={() => navigate("/candidate/edit-profile")}>
          Modifier mon profil
        </button>
      </header>

      <main>
        <section className="profile-section">
          <h2>Mes informations</h2>
          <p>
            <strong>Email :</strong> {profileData?.email || "Non renseigné"}
          </p>
          <p>
            <strong>Domaine :</strong> {profileData?.domain || "Non renseigné"}
          </p>
          <p>
            <strong>Pays :</strong> {profileData?.country || "Non renseigné"}
          </p>
        </section>

        <section className="history-section">
          <h2>Historique de candidatures</h2>
          {loading ? (
            <p>Chargement...</p>
          ) : applications.length === 0 ? (
            <p>Vous n'avez postulé à aucune offre.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Titre de l'offre</th>
                  <th>Date de candidature</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.applicationId}>
                    <td>{app.jobTitle || "Non spécifié"}</td>
                    <td>
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td>{app.status || "En attente"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="offers-section">
          <h2>Découvrir de nouvelles offres</h2>
          <button onClick={() => navigate("/job-listings")}>
            Voir les offres d'emploi
          </button>
        </section>
      </main>
    </div>
  );
};

export default CandidateDashboard;
