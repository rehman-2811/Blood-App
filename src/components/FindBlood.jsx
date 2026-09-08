import React, { useState } from "react";
import styles from "./FindBlood.module.css";
import NearbyDonorsMap from "./NearbyDonorsMap";

const PROVINCE_DISTRICTS = {
  Punjab: ["Lahore","Faisalabad","Rawalpindi","Gujranwala","Multan","Sialkot","Bahawalpur","Sargodha","Sheikhupura","Jhang","Rahim Yar Khan","Gujrat","Kasur","Sahiwal","Okara","Dera Ghazi Khan","Muzaffargarh","Pakpattan","Hafizabad","Attock"],
  Sindh: ["Karachi","Hyderabad","Sukkur","Larkana","Nawabshah","Mirpur Khas","Jacobabad","Shikarpur","Khairpur","Dadu","Thatta","Badin","Sanghar","Umerkot","Tando Allahyar"],
  KPK: ["Peshawar","Mardan","Swat","Abbottabad","Kohat","Mansehra","Nowshera","Charsadda","Bannu","Dera Ismail Khan","Haripur","Swabi","Buner","Malakand","Chitral"],
  Balochistan: ["Quetta","Turbat","Khuzdar","Hub","Chaman","Gwadar","Zhob","Loralai","Kalat","Panjgur","Nushki","Sibi","Nasirabad","Dera Bugti","Mastung"],
  "Azad Kashmir": ["Muzaffarabad","Mirpur","Rawalakot","Bagh","Kotli","Bhimber","Neelum","Haveli","Sudhnoti"],
  Gilgit: ["Gilgit","Skardu","Ghanche","Diamer","Astore","Hunza","Nagar","Ghizer","Shigar"],
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function toWhatsApp(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("92")) return cleaned;
  if (cleaned.startsWith("0"))  return "92" + cleaned.slice(1);
  return "92" + cleaned;
}

function toCallLink(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "+92" + cleaned.slice(1);
  return "+" + cleaned;
}

// ── Org result card ────────────────────────────────────────────────────────────
function OrgCard({ org, requestedBloodGroup }) {
  return (
    <div className={styles.orgCard}>
      <div className={styles.orgLeft}>
        <h3 className={styles.orgName}>{org.organizationName}</h3>
        <p className={styles.orgAddress}>📍 {org.address}{org.district ? `, ${org.district}` : ""}</p>

        {/* Blood stock pills */}
        <div className={styles.bloodPills}>
          {Object.entries(org.stock)
            .sort((a, b) => b[1] - a[1])
            .map(([bg, ml]) => (
              <span
                key={bg}
                className={`${styles.bloodPill} ${
                  bg === requestedBloodGroup ? styles.pillHighlight : styles.pillNormal
                }`}
              >
                <span className={styles.pillDot} />
                {bg}: {ml} ml
              </span>
            ))}
        </div>

        {Object.keys(org.stock).length === 0 && (
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>No stock information available.</p>
        )}
      </div>

      <div className={styles.orgRight}>
        {/* Requested blood group stock highlight */}
        {requestedBloodGroup && org.requestedStock > 0 && (
          <div className={styles.totalBadge}>
            <span className={styles.totalNum}>{org.requestedStock}</span>
            ml of {requestedBloodGroup}
          </div>
        )}

        {/* Contact buttons */}
        <div className={styles.contactBtns}>
          <a href={`tel:${toCallLink(org.phone)}`} className={styles.callBtn}>
            📞 Call
          </a>
          <a
            href={`https://wa.me/${toWhatsApp(org.phone)}?text=${encodeURIComponent(
              `Hello, I urgently need ${requestedBloodGroup || "blood"}. Do you have it available?`
            )}`}
            target="_blank"
            rel="noreferrer"
            className={styles.whatsappBtn}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const FindBlood = () => {
  const [formData, setFormData] = useState({ bloodGroup: "", province: "", district: "" });
  const [results,    setResults]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [searchMode, setSearchMode] = useState("district");

  const districts = formData.province ? PROVINCE_DISTRICTS[formData.province] || [] : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "province" ? { district: "" } : {}),
    }));
    setError("");
  };

  const handleCurrentLocation = () => {
  if (!navigator.geolocation) return setError("Geolocation not supported.");
  setLocLoading(true);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        // Reverse geocode to get province/district
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const addr = data.address || {};
        const detectedState = addr.state || "";
        const matchedProvince = Object.keys(PROVINCE_DISTRICTS).find((p) =>
          detectedState.toLowerCase().includes(p.toLowerCase())
        );
        const detectedCity = addr.city || addr.town || addr.county || addr.district || "";
        const matchedDistrict = matchedProvince
          ? PROVINCE_DISTRICTS[matchedProvince].find((d) =>
              detectedCity.toLowerCase().includes(d.toLowerCase())
            )
          : null;

        const updatedForm = {
          ...formData,
          province: matchedProvince || formData.province,
          district: matchedDistrict || formData.district,
        };

        setFormData(updatedForm);

        // ── Auto-search with detected location ──
        if (matchedProvince && matchedDistrict) {
          setLoading(true);
          setError("");
          setResults(null);

          const params = new URLSearchParams({
            province: matchedProvince,
            district: matchedDistrict,
            ...(updatedForm.bloodGroup ? { bloodGroup: updatedForm.bloodGroup } : {}),
          });

          const searchRes = await fetch(`/api/search/blood?${params}`);
          const searchData = await searchRes.json();

          if (!searchRes.ok) {
            setError(searchData.error || "Search failed.");
          } else {
            setResults(searchData.results);
            setTimeout(() => {
              document.getElementById("findblood-results")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 100);
          }

          setLoading(false);
        } else {
          // Detected location but couldn't match to a known province/district
          setError(
            `Detected location near "${detectedCity || detectedState}" — please select province/district manually if not auto-filled.`
          );
        }
      } catch {
        setError("Could not detect location. Please select manually.");
      } finally {
        setLocLoading(false);
      }
    },
    (err) => {
      setLocLoading(false);
      if (err.code === 1) {
        setError("Location access denied. Allow location in your browser settings (🔒 icon in address bar) and reload.");
      } else {
        setError("Location unavailable. Please select province/district manually.");
      }
    }
  );
};

  const handleSearch = async () => {
    if (!formData.province || !formData.district) {
      return setError("Please select a province and district.");
    }
    setLoading(true); setError(""); setResults(null);
    try {
      const params = new URLSearchParams({
        province: formData.province,
        district: formData.district,
        ...(formData.bloodGroup ? { bloodGroup: formData.bloodGroup } : {}),
      });
      const res  = await fetch(`/api/search/blood?${params}`);
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Search failed.");
      setResults(data.results);
      setTimeout(() => {
        document.getElementById("findblood-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className={styles.container}>

    {/* ── Mode toggle ── */}
    <div className={styles.searchModeToggle}>
      <button
        className={searchMode === "district" ? styles.modeActive : styles.modeBtn}
        onClick={() => setSearchMode("district")}
      >
        Search by District
      </button>
      <button
        className={searchMode === "nearby" ? styles.modeActive : styles.modeBtn}
        onClick={() => setSearchMode("nearby")}
      >
        Find Donors Near Me
      </button>
    </div>

    {searchMode === "district" ? (
      <>
        <div className={styles.card}>
          {/* Left panel */}
          <div className={styles.left}>
            <h2 className={styles.leftTitle}>Find Blood</h2>
            <p className={styles.leftSub}>
              Search by blood group and location to find blood banks with available stock near you.
            </p>
          </div>

          {/* Right form */}
          <div className={styles.right}>
            <h2>Recipient Details</h2>

            <div className={styles.formGroup}>
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                <option value="">All Blood Groups</option>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            <button className={styles.locationBtn} onClick={handleCurrentLocation} disabled={locLoading}>
              {locLoading ? "Detecting…" : "📍 Use Current Location"}
            </button>

            <p className={styles.orText}>OR</p>

            <div className={styles.formGroup}>
              <label>Province</label>
              <select name="province" value={formData.province} onChange={handleChange}>
                <option value="">Select Province</option>
                {Object.keys(PROVINCE_DISTRICTS).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>District</label>
              <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.province}>
                <option value="">{formData.province ? "Select District" : "Select a province first"}</option>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {error && <p style={{ color: "#c2173d", fontSize: 13, marginBottom: 8 }}>{error}</p>}

            <div className={styles.proceedRow}>
              <button className={styles.proceedBtn} onClick={handleSearch} disabled={loading}>
                {loading ? "Searching…" : "Proceed →"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {(loading || results !== null) && (
          <div className={styles.resultsSection} id="findblood-results">
            {loading ? (
              <div className={styles.spinner}>
                <div className={styles.spinnerDot} />
                <div className={styles.spinnerDot} />
                <div className={styles.spinnerDot} />
              </div>
            ) : (
              <>
                <div className={styles.resultsHeader}>
                  <h3 className={styles.resultsTitle}>
                    {results.length > 0
                      ? `${results.length} blood bank${results.length > 1 ? "s" : ""} with available stock`
                      : "No results found"}
                  </h3>
                  <span className={styles.resultsMeta}>
                    {formData.district}, {formData.province}
                    {formData.bloodGroup && ` · ${formData.bloodGroup}`}
                  </span>
                </div>

                {results.length === 0 ? (
                  <div className={styles.noResults}>
                    <div className={styles.noResultsIcon}>🩸</div>
                    <p className={styles.noResultsText}>
                      No blood banks with{" "}
                      {formData.bloodGroup ? `${formData.bloodGroup} ` : ""}
                      blood in stock found in {formData.district}.
                      <br />
                      Try a nearby district or search without a blood group filter.
                    </p>
                  </div>
                ) : (
                  results.map((org) => (
                    <OrgCard key={org._id} org={org} requestedBloodGroup={formData.bloodGroup || null} />
                  ))
                )}
              </>
            )}
          </div>
        )}
      </>
    ) : (
      <NearbyDonorsMap bloodGroup={formData.bloodGroup} />
    )}

  </div>
);
};

export default FindBlood;