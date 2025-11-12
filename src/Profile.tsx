import React, { useState } from "react";
import "./Profile.css";

const Profile: React.FC = () => {
  const [name, setName] = useState("Syed Shuaib");
  const [bio, setBio] = useState("Exploring calm technology & AI 🌿");
  const [editing, setEditing] = useState(false);
  const [xp, setXp] = useState(65);

  return (
    <div className="profile-container">
      <img
        src={process.env.PUBLIC_URL + "/avatar_orbi.png"}
        alt="Orbi Avatar"
        className="profile-img"
      />

      {editing ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="profile-input"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="profile-textarea"
          />
          <button className="profile-save" onClick={() => setEditing(false)}>
            Save
          </button>
        </>
      ) : (
        <>
          <h2 className="profile-name">{name}</h2>
          <p className="profile-bio">{bio}</p>
          <button className="profile-edit" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </>
      )}

      <div className="xp-bar-wrap">
        <div className="xp-label">Level Progress</div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xp}%` }} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
