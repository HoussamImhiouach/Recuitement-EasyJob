import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import CandidateLogin from "./components/candidate/LoginForm";
import CandidateSignup from "./components/candidate/SignupForm";
import RecruiterLogin from "./components/recruiter/LoginForm";
import RecruiterSignup from "./components/recruiter/SignupForm";
import JobListings from "./components/jobs/JobListings";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateJobForm from "./components/recruiter/CreateJobForm";
import OfferDetails from "./pages/OfferDetails";
import EditJob from "./components/recruiter/EditJob";
import JobDetails from "./components/jobs/JobDetails";
import UploadCV from "./components/candidate/UploadCV";
import EditProfileForm from "./components/candidate/EditProfileForm";
import ResumeGeneration from "./components/ResumeGeneration";
import CoverLetterGenerator from "./components/CoverLetterGenerator";
import CandidateDashboard from "./components/candidate/CandidateDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/signup" element={<CandidateSignup />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/job-details/:id" element={<JobDetails />} />
        <Route path="/candidate/upload-cv" element={<UploadCV />} />
        <Route path="/candidate/edit-profile" element={<EditProfileForm />} />
        <Route path="/recruiter/login" element={<RecruiterLogin />} />
        <Route path="/recruiter/signup" element={<RecruiterSignup />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/edit-job" element={<EditJob />} />
        <Route path="/recruiter/create-job" element={<CreateJobForm />} />
        <Route path="/offer-details" element={<OfferDetails />} />
        <Route path="/resume-generation" element={<ResumeGeneration />} />
        <Route
          path="/cover-letter-generator"
          element={<CoverLetterGenerator />}
        />
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h1>404 - Page Not Found</h1>
              <a
                href="/"
                style={{ textDecoration: "underline", color: "blue" }}
              >
                Retour à l'accueil
              </a>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
