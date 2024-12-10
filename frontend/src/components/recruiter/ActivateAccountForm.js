import React, { useState } from "react";

const ActivateAccountForm = ({ role = "Recruteur" }) => {
  const [formData, setFormData] = useState({
    email: "",
    activationCode: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8085/${role.toLowerCase()}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Compte activé avec succès !");
      } else {
        const error = await response.json();
        alert(`Erreur : ${error.detail}`);
      }
    } catch (error) {
      console.error("Erreur d'activation :", error);
      alert("Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Activer votre compte {role}</h2>
      <form onSubmit={handleSubmit}>
        <label>Email :</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Code d'activation :</label>
        <input
          type="text"
          name="activationCode"
          value={formData.activationCode}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Activation..." : "Activer"}
        </button>
      </form>
    </div>
  );
};

export default ActivateAccountForm;