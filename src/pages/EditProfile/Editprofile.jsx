import { useState, useEffect } from "react";
import styles from "./Editprofile.module.css";
import Section from "../../components/Section/Section";
import Field from "../../components/Field/Field";
import { RadioField } from "../../components/Field/Field";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const YES_NO = ["Yes", "No"];

export default function EditProfile() {
  const token = localStorage.getItem("token");
  const [newOrgCode, setNewOrgCode] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    address: "", age: "", bloodGroup: "", district: "",
    province: "", pincode: "", lastDonationDate: "",
    organizationCode: "",
    healthIssues: "", currentMedications: "",
    recentSurgery: "No", smoker: "No", alcoholic: "No", allergies: "",
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    fetch("/api/donor/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (!data.error) setForm((prev) => ({ ...prev, ...data })); })
      .catch(() => {});
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      const res = await fetch("/api/donor/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setMsg({ text: "Profile updated successfully!", type: "success" });
      else        setMsg({ text: data.error || "Update failed.", type: "error" });
    } catch {
      setMsg({ text: "Network error.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

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
          <span className={styles.notifIcon}>🔔</span>
          <div className={styles.avatar}>
            {form.firstName?.[0]}{form.lastName?.[0]}
          </div>
        </div>
      </nav>

      {/* ── Banner ── */}
      <div className={styles.banner}>
        <h1 className={styles.bannerTitle}>Edit Profile</h1>
      </div>

      {/* ── Form ── */}
      <div className={styles.formWrap}>

        <Section title="Personal Information">
          <Field label="First Name"   name="firstName" value={form.firstName} onChange={handleChange} placeholder="First" half />
          <Field label="Last Name"    name="lastName"  value={form.lastName}  onChange={handleChange} placeholder="Last Name" half />
          <Field label="Phone Number" name="phone"     value={form.phone}     onChange={handleChange} placeholder="Number" half />
          <Field label="Email"        name="email"     value={form.email}     onChange={handleChange} placeholder="Mail Id" type="email" half />
          <Field label="Age"          name="age"       value={form.age}       onChange={handleChange} placeholder="Age" type="number" quarter />
          <Field
            label="Blood Group" name="bloodGroup" value={form.bloodGroup}
            onChange={handleChange} quarter
            select options={BLOOD_GROUPS}
          />
          <Field label="Address"  name="address"  value={form.address}  onChange={handleChange} placeholder="Type Here" textarea />
          <Field label="District" name="district" value={form.district} onChange={handleChange} placeholder="District" half />
          <Field label="Province" name="province" value={form.province} onChange={handleChange} placeholder="Province" half />
          <Field label="PinCode"  name="pincode"  value={form.pincode}  onChange={handleChange} placeholder="PinCode" quarter />
         <div className={styles.orgSection}>
  <label className={styles.orgLabel}>Linked Organizations</label>

  {form.linkedOrganizations?.length > 0 && (
    <div className={styles.orgLinkedList}>
      {form.linkedOrganizations.map((link, i) => (
        <div key={i} className={styles.orgLinkedItem}>
          🩸 {link.organization?.organizationName || link.orgCode}
        </div>
      ))}
    </div>
  )}

  <div className={styles.orgAddRow}>
    <input
      type="text"
      className={styles.orgCodeInput}
      placeholder="Enter org code (e.g. AB12CD)"
      value={newOrgCode}
      onChange={(e) => setNewOrgCode(e.target.value.toUpperCase())}
      maxLength={6}
    />
    <button
      type="button"
      className={styles.orgAddBtn}
      onClick={() => {
        if (newOrgCode.length === 6) {
          setForm((prev) => ({ ...prev, organizationCode: newOrgCode }));
          setNewOrgCode("");
        }
      }}
    >
      + Link Org
    </button>
  </div>
</div>
        </Section>

        <Section title="Donation Information">
          <Field label="Last Donation Date" name="lastDonationDate" value={form.lastDonationDate} onChange={handleChange} type="date" half />
        </Section>

        <Section title="Health Information">
          <Field label="Health Issues / Chronic Conditions" name="healthIssues" value={form.healthIssues}
            onChange={handleChange} placeholder="E.g. Diabetes, Hypertension… or 'None'" textarea />
          <Field label="Current Medications" name="currentMedications" value={form.currentMedications}
            onChange={handleChange} placeholder="List medications or 'None'" textarea />
          <Field label="Allergies" name="allergies" value={form.allergies}
            onChange={handleChange} placeholder="E.g. Penicillin… or 'None'" half />
          <RadioField label="Recent Surgery (last 6 months)?" name="recentSurgery" value={form.recentSurgery} options={YES_NO} onChange={handleChange} />
          <RadioField label="Do you smoke?"            name="smoker"    value={form.smoker}    options={YES_NO} onChange={handleChange} />
          <RadioField label="Do you consume alcohol?"  name="alcoholic" value={form.alcoholic} options={YES_NO} onChange={handleChange} />
        </Section>

        {msg.text && (
          <div className={msg.type === "success" ? styles.success : styles.errorMsg}>
            {msg.text}
          </div>
        )}

        <div className={styles.submitRow}>
          <a href="/donor/dashboard" className={styles.cancelBtn}>Cancel</a>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Submit ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}