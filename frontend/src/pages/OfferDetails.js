import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./OfferDetails.css";

const OfferDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;

  if (!job) {
    return (
      <div className="offer-details-container">
        <header className="offer-navbar">
          <div className="logo">
            <img src={logo} alt="Easy Job Logo" className="logo-image" />
            Easy Job
          </div>
        </header>
        <p>Aucune offre trouvée.</p>
        <button className="back-button" onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="offer-details-container">
      <header className="offer-navbar">
        <div className="logo">
          <img src={logo} alt="Easy Job Logo" className="logo-image" />
          Easy Job
        </div>
      </header>
      <div className="move-right">
        <h1 className="offer-title">{job.title || "Titre non spécifié"}</h1>
        <div className="data-content">
          <p className="offer-company">
            Publié par : {job.company || "Recruteur interne"}
          </p>
          <p className="offer-location">
            <strong>Lieu :</strong> {job.location || "Non spécifié"}
          </p>
          <p className="offer-salary">
            <strong>Salaire :</strong> {job.salary || "Non spécifié"}
          </p>
          <p className="offer-type">
            <strong>Type :</strong> {job.type || "Non spécifié"}
          </p>
          <p className="offer-description">
            <strong>Description :</strong>
          </p>
          <p>{job.description || "Aucune description disponible"}</p>
          <p className="offer-skills">
            <strong>Compétences requises :</strong>
          </p>
          <p>{job.skills || "Non spécifié"}</p>
        </div>
        <button
          className="apply-link"
          onClick={() =>
            alert("Lien Postuler cliqué (fonctionnalité à développer)")
          }
        >
          Postuler
        </button>
        <br />
        <button className="back-link" onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>
    </div>
  );
};

export default OfferDetails;
