import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../assets/logo.png";
import bannerImage from "../assets/banner-image.png";
import JobListings from "./jobs/JobListings";
import Chatbox from "./Chatbox";
import { FaComments } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showInternalJobs, setShowInternalJobs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedLoggedInStatus = localStorage.getItem("isLoggedIn");

    if (storedLoggedInStatus) {
      setIsLoggedIn(true);
      setUsername(storedUsername || "Utilisateur");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    alert("Vous vous êtes déconnecté avec succès.");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Recherche : ${searchQuery} à ${location}`);
  };

  const toggleChatbox = () => setShowChat((prev) => !prev);

  return (
    <div className="home-container">
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="Easy Job Logo" className="logo-image" />
          <span>Easy Job</span>
        </div>
        <nav>
          <ul className="user-roles">
            {isLoggedIn ? (
              <>
                <li>
                  <span className="nav-text">Bonjour, {username}</span>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/candidate/edit-profile")}
                    className="edit-profile-button"
                  >
                    Modifier mon profil
                  </button>
                </li>
                <li>
                  <button
                    className="edit-profile-button"
                    onClick={() => {
                      const dropdown =
                        document.getElementById("generate-dropdown");
                      dropdown.style.display =
                        dropdown.style.display === "block" ? "none" : "block";
                    }}
                  >
                    Generate
                  </button>
                  <div
                    id="generate-dropdown"
                    style={{
                      display: "none",
                      position: "absolute",
                      top: "60px",
                      right: "20px",
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                      zIndex: 1000,
                      padding: "10px",
                    }}
                  >
                    <button
                      onClick={() => navigate("/resume-generation")}
                      style={{
                        display: "block",
                        margin: "5px 0",
                        padding: "10px 20px",
                        width: "100%",
                        textAlign: "left",
                        backgroundColor: "#f0f0f0",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Resume Generator
                    </button>
                    <button
                      onClick={() => navigate("/cover-letter-generator")}
                      style={{
                        display: "block",
                        margin: "5px 0",
                        padding: "10px 20px",
                        width: "100%",
                        textAlign: "left",
                        backgroundColor: "#f0f0f0",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Cover Letter Generator
                    </button>
                  </div>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-button">
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    onClick={() => navigate("/recruiter/login")}
                    className="role-button"
                  >
                    Recruteur
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/candidate/login")}
                    className="role-button"
                  >
                    Candidat
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Rechercher un emploi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Localisation..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <button type="submit">Rechercher</button>
        </form>
      </div>

      <div className="banner">
        <div className="banner-content">
          <h1>Transformez votre avenir professionnel</h1>
          <p>
            Découvrez les meilleures offres d'emploi grâce à notre plateforme
            intelligente.
          </p>
        </div>
        <div className="banner-image">
          <img src={bannerImage} alt="Banner Illustration" />
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${showInternalJobs ? "active" : ""}`}
          onClick={() => setShowInternalJobs(true)}
        >
          Offres Internes
        </button>
        <button
          className={`tab-button ${!showInternalJobs ? "active" : ""}`}
          onClick={() => setShowInternalJobs(false)}
        >
          Offres Externes
        </button>
      </div>

      <JobListings showInternalJobs={showInternalJobs} />

      {!showChat && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#007bff",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
          onClick={toggleChatbox}
        >
          <FaComments style={{ color: "white", fontSize: "24px" }} />
        </div>
      )}
      {showChat && <Chatbox toggleChat={toggleChatbox} />}
    </div>
  );
}

export default Home;
