const CandidateProfile = ({ profileData }) => {
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <h1>Profil Candidat</h1>
      <p>
        <strong>Nom d'utilisateur :</strong> {profileData?.username}
      </p>
      <p>
        <strong>Email :</strong> {profileData?.email}
      </p>
      <p>
        <strong>Domaine :</strong> {profileData?.domain}
      </p>
      <p>
        <strong>Pays :</strong> {profileData?.country}
      </p>
      {/* Supprimez temporairement cette section pour ignorer les compétences */}
      {/* <p>
        <strong>Compétences :</strong>{" "}
        {Array.isArray(profileData?.skills)
          ? profileData.skills.join(", ") // Si `skills` est un tableau
          : profileData?.skills || "Non spécifiées"}{" "}
      </p> */}
      <button onClick={() => navigate("/candidate/edit-profile")}>
        Modifier Profil
      </button>
    </div>
  );
};

export default CandidateProfile;
