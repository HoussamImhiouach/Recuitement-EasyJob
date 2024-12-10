import React, { useState } from "react";

const UploadCV = () => {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8085/candidate/upload-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.detail || "Erreur lors du téléchargement du CV.");
      }

      const data = await response.json();
      setSkills(data.skills || []);
    } catch (error) {
      setError(error.message || "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Uploader votre CV</h2>
      <input type="file" onChange={handleFileChange} accept=".pdf,.docx" />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer"}
      </button>

      {error && <p className="error-message">{error}</p>}

      {skills.length > 0 && (
        <div>
          <h3>Compétences Extraites :</h3>
          <ul>
            {skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadCV;
