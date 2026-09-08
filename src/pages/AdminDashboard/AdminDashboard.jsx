import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./AdminDashboard.module.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const orgIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const donorIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const PAKISTAN_CENTER = [30.3753, 69.3451];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview"); // overview | donors | orgs | map

const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetch("http://localhost:5000/api/admin/overview", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) navigate("/admin/login");
        else setData(d);
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <div className={styles.center}>Loading admin dashboard…</div>;
  if (!data) return null;

  const { stats, donors, organizations } = data;

  const donorsWithLocation = donors.filter(
    (d) => d.location?.coordinates && (d.location.coordinates[0] !== 0 || d.location.coordinates[1] !== 0)
  );
  const orgsWithLocation = organizations.filter(
    (o) => o.location?.coordinates && (o.location.coordinates[0] !== 0 || o.location.coordinates[1] !== 0)
  );

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <h2>🛡 Admin Dashboard</h2>
        <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
      </nav>

      <div className={styles.body}>
        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <p className={styles.statNum}>{stats.totalDonors}</p>
            <p className={styles.statLabel}>Total Donors</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNum}>{stats.totalOrgs}</p>
            <p className={styles.statLabel}>Total Organizations</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNum} style={{ color: "#16a34a" }}>{stats.eligibleDonors}</p>
            <p className={styles.statLabel}>Eligible Donors</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statNum}>{stats.totalStockMl} ml</p>
            <p className={styles.statLabel}>Total Blood Stock</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {["overview", "donors", "orgs", "map"].map((t) => (
            <button
              key={t}
              className={tab === t ? styles.tabActive : styles.tabBtn}
              onClick={() => setTab(t)}
            >
              {t === "overview" ? "Overview" : t === "donors" ? "Donors" : t === "orgs" ? "Organizations" : "Map View"}
            </button>
          ))}
        </div>

        {/* Donors table */}
        {(tab === "overview" || tab === "donors") && (
          <div className={styles.card}>
            <h3>Donors ({donors.length})</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th><th>Blood Group</th><th>Phone</th><th>Email</th>
                  <th>District</th><th>Location Set</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((d) => {
                  const hasLoc = d.location?.coordinates && (d.location.coordinates[0] !== 0 || d.location.coordinates[1] !== 0);
                  return (
                    <tr key={d._id}>
                      <td>{d.firstName} {d.lastName}</td>
                      <td><span className={styles.pillBlue}>{d.bloodGroup || "N/A"}</span></td>
                      <td>{d.phone}</td>
                      <td>{d.email}</td>
                      <td>{d.district || "—"}</td>
                      <td>{hasLoc ? "✅" : "❌"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Orgs table */}
        {(tab === "overview" || tab === "orgs") && (
          <div className={styles.card}>
            <h3>Organizations ({organizations.length})</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th><th>Phone</th><th>Email</th><th>Address</th>
                  <th>Stock (ml)</th><th>Location Set</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => {
                  const hasLoc = org.location?.coordinates && (org.location.coordinates[0] !== 0 || org.location.coordinates[1] !== 0);
                  let stockTotal = 0;
                  if (org.bloodStock) {
                    Object.values(org.bloodStock).forEach((v) => (stockTotal += v));
                  }
                  return (
                    <tr key={org._id}>
                      <td>{org.organizationName}</td>
                      <td>{org.phone}</td>
                      <td>{org.email}</td>
                      <td>{org.address}</td>
                      <td>{stockTotal} ml</td>
                      <td>{hasLoc ? "✅" : "❌"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Combined map */}
        {tab === "map" && (
          <div className={styles.card}>
            <h3>All Locations ({donorsWithLocation.length} donors, {orgsWithLocation.length} orgs)</h3>
            <MapContainer center={PAKISTAN_CENTER} zoom={6} style={{ height: "550px", width: "100%", borderRadius: 12 }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {donorsWithLocation.map((d) => (
                <Marker
                  key={d._id}
                  position={[d.location.coordinates[1], d.location.coordinates[0]]}
                  icon={donorIcon}
                >
                  <Popup>
                    🧑 {d.firstName} {d.lastName}<br />
                    {d.bloodGroup} · {d.phone}
                  </Popup>
                </Marker>
              ))}
              {orgsWithLocation.map((org) => (
                <Marker
                  key={org._id}
                  position={[org.location.coordinates[1], org.location.coordinates[0]]}
                  icon={orgIcon}
                >
                  <Popup>
                    🏥 {org.organizationName}<br />
                    {org.address}<br />
                    {org.phone}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;