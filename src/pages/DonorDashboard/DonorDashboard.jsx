import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DonorDashboard.module.css";

import ProfileCard from "./ProfileCard/Profilecard"
import AboutCard from "./AboutCard/Aboutcard";
import EligibilityCard from "./EligibilityCard/Eligibilitycard";
import HealthCard from "./HealthCard/HealthCard";
import DonationHistory from "./DonationHistory/Donationhistory";
import QRModal from "./QRModal/QRmodal";
import LocationPicker from "../../components/LocationPicker";
import BadgeCard from "../../components/BadgeCard";
import NotificationBell from "../../components/NotificationBell";

// ── LocationCard — self-contained, no notifications needed here ──
const LocationCard = ({ donor }) => {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");

  const coords = donor.location?.coordinates;
  const hasLocation = coords && (coords[0] !== 0 || coords[1] !== 0);

  const handleUpdateLocation = ({ lat, lng }) => {
    setStatus("Saving...");
    const token = localStorage.getItem("token");
    fetch("https://qr-server-29l8.onrender.com/api/donor/update-location", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    })
      .then((r) => r.json())
      .then(() => {
        setStatus("✅ Location updated.");
        setEditing(false);
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch(() => setStatus("❌ Failed to update location."));
  };

  return (
    <div className={styles.locationCard}>
      <h3>📍 My Location</h3>

      {hasLocation ? (
        <p className={styles.locationText}>
          Saved location: ({coords[1].toFixed(5)}, {coords[0].toFixed(5)})
        </p>
      ) : (
        <p className={styles.locationText}>No location set yet.</p>
      )}

      {!editing ? (
        <button className={styles.editLocationBtn} onClick={() => setEditing(true)}>
          {hasLocation ? "Update Location" : "Set Location"}
        </button>
      ) : (
        <>
          <LocationPicker
            onLocationSelect={handleUpdateLocation}
            initialPosition={hasLocation ? [coords[1], coords[0]] : null}
          />
          <button className={styles.cancelBtn} onClick={() => setEditing(false)}>
            Cancel
          </button>
        </>
      )}

      {status && <p className={styles.locationStatus}>{status}</p>}
    </div>
  );
};

// ── Main Dashboard ──
export default function DonorDashboard() {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ── Fetch donor profile ──
  useEffect(() => {
    fetch("https://qr-server-29l8.onrender.com/api/donor/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setDonor(data);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [token]);


  if (loading) return <div className={styles.center}>Loading your dashboard…</div>;
  if (error)   return <div className={styles.center}>⚠ {error}</div>;
  if (!donor)  return null;

  return (
    <div className={styles.page}>

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#7f1d1d" strokeWidth="2" />
            <path
              d="M20 8 C14 14 10 18 10 23 a10 10 0 0 0 20 0 C30 18 26 14 20 8z"
              fill="#9f1239"
            />
          </svg>
        </div>

        <div className={styles.navRight}>
          <NotificationBell/>
          <div className={styles.avatar}>
            {donor.firstName?.[0]}{donor.lastName?.[0]}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className={styles.body}>
        <ProfileCard donor={donor} onShowQR={() => setShowQR(true)} />
        <LocationCard donor={donor} />

        <div className={styles.grid}>
          <AboutCard donor={donor} />

          <div className={styles.rightCol}>
            <EligibilityCard donor={donor} />
            <BadgeCard/>
            <HealthCard donor={donor} />
            <DonationHistory donor={donor} />
          </div>
        </div>
      </div>

      {showQR && <QRModal donor={donor} onClose={() => setShowQR(false)} />}
    </div>
  );
}