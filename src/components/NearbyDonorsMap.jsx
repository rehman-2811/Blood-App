import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./NearbyDonorMap.module.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const orgIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
  className: styles.orgMarker, // tinted blue via CSS filter
});

function toWhatsApp(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("92")) return cleaned;
  if (cleaned.startsWith("0")) return "92" + cleaned.slice(1);
  return "92" + cleaned;
}

function toCallLink(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "+92" + cleaned.slice(1);
  return "+" + cleaned;
}

const RELIABILITY_LABEL = {
  high: "🟢 Highly reliable (5+ donations)",
  medium: "🟡 Reliable (2+ donations)",
  new: "⚪ New donor",
};

const NearbyDonorsMap = ({ bloodGroup }) => {
  const [position, setPosition] = useState(null);
  const [donors, setDonors] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const findNearby = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);

        try {
          const params = new URLSearchParams({
            lat: latitude,
            lng: longitude,
            radius,
            ...(bloodGroup ? { bloodGroup } : {}),
          });

          const [donorRes, orgRes] = await Promise.all([
            fetch(`/api/search/nearby?${params}`),
            fetch(`/api/search/nearby-orgs?${params}`),
          ]);
          const donorData = await donorRes.json();
          const orgData = await orgRes.json();

          setDonors(donorData.donors || []);
          setOrgs(orgData.organizations || []);
        } catch {
          setError("Could not fetch nearby results.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Could not get your location. Please allow location access.");
        setLoading(false);
      }
    );
  };

  const totalResults = donors.length + orgs.length;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button className={styles.findBtn} onClick={findNearby} disabled={loading}>
          {loading ? "Locating…" : "📍 Find Donors & Blood Banks Near Me"}
        </button>

        <label className={styles.radiusLabel}>
          Radius:
          <select
            className={styles.radiusSelect}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            <option value={2000}>2 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
            <option value={20000}>20 km</option>
          </select>
        </label>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {position && (
        <div className={styles.mapWrapper}>
          <MapContainer center={position} zoom={13} style={{ height: "450px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <Marker position={position} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>

            <Circle
              center={position}
              radius={radius}
              pathOptions={{ color: "#9f1239", fillOpacity: 0.05 }}
            />

            {/* Donor markers (red, default) */}
            {donors.map((d) => (
              <Marker key={`donor-${d.id}`} position={[d.coordinates[1], d.coordinates[0]]}>
                <Popup>
                  <div className={styles.popupContent}>
                    <div className={styles.popupName}>🧑 {d.name}</div>
                    Blood Group: {d.bloodGroup}
                    <br />
                    {d.isEligible ? (
                      <span className={styles.eligibleYes}>✅ Eligible to donate</span>
                    ) : (
                      <span className={styles.eligibleNo}>⏳ Not eligible yet</span>
                    )}
                    <br />
                    <span className={styles.reliabilityTag}>
                      {RELIABILITY_LABEL[d.reliability]}
                    </span>
                    <div className={styles.popupLinks}>
                      <a href={`tel:${toCallLink(d.phone)}`}>📞 Call</a>
                      <a
                        href={`https://wa.me/${toWhatsApp(d.phone)}?text=${encodeURIComponent(
                          `Hello, I urgently need ${d.bloodGroup}. Can you help?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Organization markers (blue) */}
            {orgs.map((org) => (
              <Marker key={`org-${org.id}`} position={[org.coordinates[1], org.coordinates[0]]} icon={orgIcon}>
                <Popup>
                  <div className={styles.popupContent}>
                    <div className={styles.popupName}>🏥 {org.organizationName}</div>
                    <span className={styles.orgAddressPopup}>{org.address}</span>
                    <br />
                    {Object.keys(org.stock).length > 0 ? (
                      <div className={styles.stockList}>
                        {Object.entries(org.stock).map(([bg, ml]) => (
                          <span key={bg} className={styles.stockPill}>{bg}: {ml}ml</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#6b7280" }}>No stock info available.</span>
                    )}
                    <div className={styles.popupLinks}>
                      <a href={`tel:${toCallLink(org.phone)}`}>📞 Call</a>
                      <a
                        href={`https://wa.me/${toWhatsApp(org.phone)}?text=${encodeURIComponent(
                          `Hello, I urgently need ${bloodGroup || "blood"}. Do you have it available?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {position && totalResults === 0 && !loading && (
        <div className={styles.noResults}>
          🩸 No donors or blood banks found within {radius / 1000}km. Try a larger radius.
        </div>
      )}

      {position && totalResults > 0 && (
        <p className={styles.resultsSummary}>
          Found {donors.length} donor{donors.length !== 1 ? "s" : ""} and {orgs.length} blood bank{orgs.length !== 1 ? "s" : ""} nearby.
        </p>
      )}
    </div>
  );
};

export default NearbyDonorsMap;