import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OrgDashboard.module.css";
import LocationPicker from "../../components/LocationPicker"; 
import BadgeCard from "../../components/BadgeCard";
import NotificationBell from "../../components/NotificationBell";
import ReportsCard from "./ReportsCard/ReportsCard";

const GAP = 90;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function daysUntil(lastDate) {
  if (!lastDate) return 0;
  const diff = Math.floor((new Date() - new Date(lastDate)) / 86400000);
  return diff >= GAP ? 0 : GAP - diff;
}
function isEligible(lastDate) {
  if (!lastDate) return true;
  return Math.floor((new Date() - new Date(lastDate)) / 86400000) >= GAP;
}

// ─── Record Donation Modal ────────────────────────────────────────────────────
function RecordModal({ donor, token, onClose, onSuccess }) {
  const [form, setForm]       = useState({ units: "450", date: new Date().toISOString().split("T")[0], location: "" });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    if (!form.units || !form.date) return setError("Units and date are required.");
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/org/donations/record", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ donorId: donor._id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed to record.");
      setSuccess(`✓ Donation recorded! ${donor.bloodGroup} stock updated.`);
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Record Donation</h2>
        <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 14 }}>
          Donor: <strong>{donor.firstName} {donor.lastName}</strong> · Blood Group: <strong>{donor.bloodGroup || "N/A"}</strong>
        </p>
        {error   && <p className={styles.modalError}>{error}</p>}
        {success && <p className={styles.modalSuccess}>{success}</p>}
        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Date of Donation</label>
          <input type="date" className={styles.modalInput} value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Blood Collected (ml)</label>
          <input type="number" className={styles.modalInput} placeholder="e.g. 450"
            value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} />
        </div>
        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Location (optional)</label>
          <input type="text" className={styles.modalInput} placeholder="Ward / room"
            value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div className={styles.modalBtns}>
          <button className={styles.modalCancel} onClick={onClose}>Cancel</button>
          <button className={styles.modalSave} onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Record Donation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dispense Blood Modal ─────────────────────────────────────────────────────
function DispenseModal({ token, bloodStock, onClose, onSuccess }) {
  const [form, setForm]       = useState({ bloodGroup: "A+", units: "", recipientName: "", date: new Date().toISOString().split("T")[0] });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const available = bloodStock?.[form.bloodGroup] || 0;

  const handleDispense = async () => {
    if (!form.units || !form.date) return setError("Units and date are required.");
    if (Number(form.units) > available) return setError(`Only ${available} ml of ${form.bloodGroup} available.`);
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/org/stock/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed.");
      setSuccess(`✓ ${form.units} ml of ${form.bloodGroup} dispensed. Remaining: ${data.bloodStock[form.bloodGroup]} ml.`);
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Dispense Blood</h2>
        <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 14 }}>
          Record blood given to a recipient. This will reduce your stock.
        </p>
        {error   && <p className={styles.modalError}>{error}</p>}
        {success && <p className={styles.modalSuccess}>{success}</p>}
        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Blood Group</label>
          <select className={styles.modalInput} value={form.bloodGroup}
            onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg} — {bloodStock?.[bg] || 0} ml available</option>
            ))}
          </select>
        </div>
        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Units to Dispense (ml)</label>
          <input type="number" className={styles.modalInput} placeholder={`Max ${available} ml`}
            value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} />
        </div>
        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Recipient Name (optional)</label>
          <input type="text" className={styles.modalInput} placeholder="Patient name"
            value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
        </div>
        <div className={styles.modalField}>
          <label className={styles.modalLabel}>Date</label>
          <input type="date" className={styles.modalInput} value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className={styles.modalBtns}>
          <button className={styles.modalCancel} onClick={onClose}>Cancel</button>
          <button className={styles.modalSave} style={{ background: "#dc2626" }}
            onClick={handleDispense} disabled={saving}>
            {saving ? "Processing…" : "Dispense Blood"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Blood Stock Card ─────────────────────────────────────────────────────────
function StockCard({ bloodStock, onDispense }) {
  const maxVal = Math.max(...Object.values(bloodStock || {}), 1);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>🩸 Blood Stock (ml)</h2>
        <button className={styles.dispenseBtn} onClick={onDispense}>
          − Dispense Blood
        </button>
      </div>
      {BLOOD_GROUPS.map((bg) => {
        const ml = bloodStock?.[bg] || 0;
        const pct = Math.min((ml / maxVal) * 100, 100);
        const low = ml < 500;
        return (
          <div key={bg} className={styles.bgRow}>
            <span className={styles.bgLabel}>{bg}</span>
            <div className={styles.bgBar}>
              <div
                className={styles.bgFill}
                style={{ width: `${pct}%`, background: low ? "#dc2626" : "#9f1239" }}
              />
            </div>
            <span className={`${styles.bgCount} ${low ? styles.lowStock : ""}`}>
              {ml} ml{low && ml > 0 ? " ⚠" : ""}
              {ml === 0 ? " ✗" : ""}
            </span>
          </div>
        );
      })}
      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 10 }}>
        ⚠ = Low stock (under 500 ml) · ✗ = Out of stock
      </p>
    </div>
  );
}

// ─── Donor Detail Panel ───────────────────────────────────────────────────────
function DonorDetail({ donor, onBack, onRecord }) {
  const eligible = isEligible(donor.lastDonationDate);
  const days     = daysUntil(donor.lastDonationDate);

  const rows = [
    ["Phone",           donor.phone],
    ["Email",           donor.email],
    ["Age",             donor.age],
    ["District",        donor.district],
    ["Province",        donor.province],
    ["Last Donation",   donor.lastDonationDate || "Never"],
    ["Health Issues",   donor.healthIssues     || "None"],
    ["Medications",     donor.currentMedications || "None"],
    ["Recent Surgery",  donor.recentSurgery    || "No"],
    ["Smoker",          donor.smoker           || "No"],
    ["Alcohol",         donor.alcoholic        || "No"],
    ["Allergies",       donor.allergies        || "None"],
  ];

  return (
    <div className={styles.detailPanel}>
      <button className={styles.backBtn} onClick={onBack}>← Back to Donors</button>
      <div className={styles.detailHeader}>
        <div className={styles.detailAvatar}>
          {donor.firstName?.[0]}{donor.lastName?.[0]}
        </div>
        <div>
          <p className={styles.detailName}>{donor.firstName} {donor.lastName}</p>
          <p className={styles.detailBG}>Blood Group: <strong>{donor.bloodGroup || "N/A"}</strong></p>
          <span className={`${styles.pill} ${eligible ? styles.pillGreen : styles.pillRed}`}>
            {eligible ? "✓ Eligible to Donate" : `✗ Eligible in ${days} days`}
          </span>
        </div>
      </div>

      {rows.map(([label, value]) => (
        <div key={label} className={styles.detailRow}>
          <span className={styles.detailLabel}>{label}</span>
          <span className={`${styles.detailValue} ${value === "Yes" ? styles.flagged : ""}`}>
            {value || "—"}
          </span>
        </div>
      ))}

      {donor.donationHistory?.length > 0 && (
        <>
          <p style={{ fontWeight: 700, marginTop: 18, marginBottom: 8, fontSize: 14 }}>Donation History</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Units (ml)</th>
                <th className={styles.th}>Location</th>
              </tr>
            </thead>
            <tbody>
              {donor.donationHistory.map((d, i) => (
                <tr key={i}>
                  <td className={styles.td}>{d.date}</td>
                  <td className={styles.td}>{d.units}</td>
                  <td className={styles.td}>{d.location || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {eligible && (
        <button className={styles.recordBtn} onClick={() => onRecord(donor)}>
          + Record Donation
        </button>
      )}
      {!eligible && (
        <div style={{ marginTop: 16, padding: "12px 16px", background: "#fef2f2", borderRadius: 8, fontSize: 13, color: "#991b1b" }}>
          This donor is not eligible to donate yet. They can donate again in <strong>{days} days</strong>.
        </div>
      )}
    </div>
  );
}

// ─── Location Card ────────────────────────────────────────────────────────────
function LocationCard({ org, token, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");

  const coords = org.location?.coordinates;
  const hasLocation = coords && (coords[0] !== 0 || coords[1] !== 0);

  const handleUpdateLocation = ({ lat, lng }) => {
    setStatus("Saving...");
    fetch("/api/org/update-location", {
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
        onUpdated();
      })
      .catch(() => setStatus("❌ Failed to update location."));
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>📍 Organization Location</h2>
      </div>
      {hasLocation ? (
        <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 12 }}>
          Saved location: ({coords[1].toFixed(5)}, {coords[0].toFixed(5)})
        </p>
      ) : (
        <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 12 }}>
          No location set yet.
        </p>
      )}
      {!editing ? (
        <button className={styles.viewBtn} onClick={() => setEditing(true)}>
          {hasLocation ? "Update Location" : "Set Location"}
        </button>
      ) : (
        <>
          <LocationPicker
            onLocationSelect={handleUpdateLocation}
            initialPosition={hasLocation ? [coords[1], coords[0]] : null}
          />
          <button className={styles.modalCancel} style={{ marginTop: 10 }} onClick={() => setEditing(false)}>
            Cancel
          </button>
        </>
      )}
      {status && <p style={{ fontSize: 13, marginTop: 8, color: "#16a34a" }}>{status}</p>}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function OrgDashboard() {
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();

  const [org,          setOrg]          = useState(null);
  const [stats,        setStats]        = useState(null);
  const [donors,       setDonors]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState(null);
  const [recording,    setRecording]    = useState(null);
  const [dispensing,   setDispensing]   = useState(false);

  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [orgRes, statsRes, donorsRes] = await Promise.all([
        fetch("/api/org/profile", { headers }),
        fetch("/api/org/stats",   { headers }),
        fetch("/api/org/donors",  { headers }),
      ]);
      const [orgData, statsData, donorsData] = await Promise.all([
        orgRes.json(), statsRes.json(), donorsRes.json(),
      ]);
      setOrg(orgData);
      setStats(statsData);
      setDonors(Array.isArray(donorsData) ? donorsData : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);


  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  if (loading) return <div className={styles.center}>Loading dashboard…</div>;
  if (!org)    return <div className={styles.center}>⚠ Failed to load. Please log in again.</div>;

  const filteredDonors = donors.filter((d) => {
    const q = search.toLowerCase();
    return (
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
      (d.bloodGroup || "").toLowerCase().includes(q) ||
      (d.district   || "").toLowerCase().includes(q)
    );
  });

  const maxBG = stats ? Math.max(...Object.values(stats.bloodGroups || {}), 1) : 1;

  return (
    <div className={styles.page}>
      {/* ── Nav ── */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#7f1d1d" strokeWidth="2" />
            <path d="M20 8 C14 14 10 18 10 23 a10 10 0 0 0 20 0 C30 18 26 14 20 8z" fill="#9f1239" />
          </svg>
        </div>

        <div className={styles.navRight}>
          <NotificationBell/>
          <div className={styles.avatar}>{org.organizationName?.[0]}</div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      <div className={styles.body}>
        {/* ── Org header card ── */}
        <div className={styles.orgCard}>
          <div>
            <h1 className={styles.orgName}>{org.organizationName}</h1>
            <p className={styles.orgMeta}>📍 {org.address}</p>
            <p className={styles.orgMeta}>👤 {org.headName} &nbsp;|&nbsp; 📞 {org.phone}</p>
          </div>
          <div className={styles.codeBadge}>
            <p className={styles.codeLabel}>Donor Link Code</p>
            <p className={styles.codeValue}>{org.orgCode}</p>
            <p className={styles.codeHint}>Share with donors to link them</p>
          </div>
        </div>

        {/* ── Stats row ── */}
        {stats && (
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <p className={styles.statNum}>{stats.total}</p>
              <p className={styles.statLabel}>Total Donors</p>
            </div>
            <div className={styles.statCard}>
              <p className={`${styles.statNum} ${styles.statEligible}`}>{stats.eligible}</p>
              <p className={styles.statLabel}>Eligible to Donate</p>
            </div>
            <div className={styles.statCard}>
              <p className={`${styles.statNum} ${styles.statNot}`}>{stats.notEligible}</p>
              <p className={styles.statLabel}>Not Eligible</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statNum}>{stats.totalDonations}</p>
              <p className={styles.statLabel}>Total Donations</p>
            </div>
          </div>
        )}

        <div className={styles.grid}>
          {/* ── Left: Donor list OR detail ── */}
          <div>
            {selected ? (
              <DonorDetail
                donor={selected}
                onBack={() => setSelected(null)}
                onRecord={(d) => setRecording(d)}
              />
            ) : (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Linked Donors ({donors.length})</h2>
                </div>
                <input className={styles.searchBar} placeholder="Search by name, blood group or district…"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
                {filteredDonors.length === 0 ? (
                  <p className={styles.empty}>
                    {donors.length === 0 ? "No donors linked yet. Share your org code with donors." : "No donors match your search."}
                  </p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Name</th>
                        <th className={styles.th}>Blood</th>
                        <th className={styles.th}>District</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonors.map((d) => {
                        const elig = isEligible(d.lastDonationDate);
                        return (
                          <tr key={d._id}>
                            <td className={styles.td}>{d.firstName} {d.lastName}</td>
                            <td className={styles.td}>
                              <span className={`${styles.pill} ${styles.pillBlue}`}>{d.bloodGroup || "N/A"}</span>
                            </td>
                            <td className={styles.td}>{d.district || "—"}</td>
                            <td className={styles.td}>
                              <span className={`${styles.pill} ${elig ? styles.pillGreen : styles.pillRed}`}>
                                {elig ? "Eligible" : `${daysUntil(d.lastDonationDate)}d`}
                              </span>
                            </td>
                            <td className={styles.td}>
                              <button className={styles.viewBtn} onClick={() => setSelected(d)}>View</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>       
            )}
            <ReportsCard token={token} />
          </div>

          {/* ── Right column ── */}
          <div>
            <StockCard bloodStock={stats?.bloodStock} onDispense={() => setDispensing(true)} />
            <BadgeCard />
            <LocationCard org={org} token={token} onUpdated={fetchAll} />

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Donor Blood Groups</h2>
              </div>
              {stats && Object.keys(stats.bloodGroups || {}).length > 0 ? (
                Object.entries(stats.bloodGroups).sort((a, b) => b[1] - a[1]).map(([bg, count]) => (
                  <div key={bg} className={styles.bgRow}>
                    <span className={styles.bgLabel}>{bg}</span>
                    <div className={styles.bgBar}>
                      <div className={styles.bgFill} style={{ width: `${(count / maxBG) * 100}%` }} />
                    </div>
                    <span className={styles.bgCount}>{count}</span>
                  </div>
                ))
              ) : (
                <p className={styles.empty}>No data yet.</p>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Recent Donations</h2>
              </div>
              {stats?.recentDonations?.length > 0 ? (
                <div className={styles.donorDetailRow}>
                  {stats.recentDonations.map((d, i) => (
                    <div key={i} className={styles.donationEntry}>
                      <div>
                        <p className={styles.deName}>{d.donorName}</p>
                        <p className={styles.deMeta}>
                          {d.date} · {d.location || "Blood bank"} ·{" "}
                          <span className={`${styles.pill} ${styles.pillBlue}`}>{d.bloodGroup}</span>
                        </p>
                      </div>
                      <span className={styles.deUnits}>{d.units} ml</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>No donations recorded yet.</p>
              )}
            </div>

            {stats?.dispenseHistory?.length > 0 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Recent Dispenses</h2>
                </div>
                <div className={styles.donorDetailRow}>
                  {stats.dispenseHistory.map((d, i) => (
                    <div key={i} className={styles.donationEntry}>
                      <div>
                        <p className={styles.deName}>{d.recipientName || "Anonymous"}</p>
                        <p className={styles.deMeta}>{d.date} · Given out</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={`${styles.pill} ${styles.pillBlue}`}>{d.bloodGroup}</span>
                        <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "#dc2626" }}>−{d.units} ml</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {recording && (
        <RecordModal donor={recording} token={token}
          onClose={() => setRecording(null)}
          onSuccess={() => { fetchAll(); setSelected(null); }} />
      )}
      {dispensing && (
        <DispenseModal token={token} bloodStock={stats?.bloodStock}
          onClose={() => setDispensing(false)}
          onSuccess={fetchAll} />
      )}
    </div>
  );
}