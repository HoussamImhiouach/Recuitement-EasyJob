import React, { useState } from "react";
import "./../LoginSignup.css";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    companySize: "",
    industry: "",
    location: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(
      "http://localhost:8085/auth/recruiter/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (response.ok) {
      alert("Registration successful!");
    } else {
      alert("Error during registration.");
    }
  };

  return (
    <div className="form-container">
      <h2>Recruiter Registration</h2>
      <form onSubmit={handleSubmit}>
        <label>Company Name:</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
        />

        <label>Company Size:</label>
        <input
          type="text"
          name="companySize"
          value={formData.companySize}
          onChange={handleChange}
          required
        />

        <label>Industry:</label>
        <input
          type="text"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          required
        />

        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignupForm;
