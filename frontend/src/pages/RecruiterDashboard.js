import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chatbox from "../components/Chatbox"; // Import du composant Chatbox
import { FaComments } from "react-icons/fa"; // Import de l'icône du chatbot

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChat, setShowChat] = useState(false); // État pour gérer le chatbot
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    fetch("http://localhost:8085/recruiter/my-jobs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  const handleDelete = async (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:8085/recruiter/delete-job/${jobId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        alert("Job deleted successfully");
        fetchJobs(); // Refresh the job list after deletion
      } else {
        alert("Failed to delete the job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleEdit = (job) => {
    navigate("/recruiter/edit-job", { state: { job } });
  };

  const toggleChatbox = () => setShowChat((prev) => !prev); // afficher/masquer le chatbot

  if (loading) {
    return <p>Loading jobs...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Recruiter Dashboard</h1>
      <button
        onClick={() => {
          window.location.href = "/recruiter/create-job";
        }}
      >
        Create New Job
      </button>
      <ul>
        {jobs.map((job) => (
          <li key={job.job_id}>
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <p>Location: {job.location}</p>
            <p>Salary: {job.salary}</p>
            <button onClick={() => handleEdit(job)}>Edit</button>
            <button onClick={() => handleDelete(job.job_id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Icône du chatbot */}
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

      {/* Composant Chatbox */}
      {showChat && <Chatbox toggleChat={toggleChatbox} />}
    </div>
  );
};

export default RecruiterDashboard;
