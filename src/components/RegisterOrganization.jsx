import React, { useState } from "react";
import styles from "./RegisterOrganization.module.css";
import LocationPicker from "./LocationPicker";

const PROVINCE_DISTRICTS = {
  Punjab: ["Lahore","Faisalabad","Rawalpindi","Gujranwala","Multan","Sialkot","Bahawalpur","Sargodha","Sheikhupura","Jhang","Rahim Yar Khan","Gujrat","Kasur","Sahiwal","Okara","Dera Ghazi Khan","Muzaffargarh","Pakpattan","Hafizabad","Attock"],
  Sindh: ["Karachi","Hyderabad","Sukkur","Larkana","Nawabshah","Mirpur Khas","Jacobabad","Shikarpur","Khairpur","Dadu","Thatta","Badin","Sanghar","Umerkot","Tando Allahyar"],
  KPK: ["Peshawar","Mardan","Swat","Abbottabad","Kohat","Mansehra","Nowshera","Charsadda","Bannu","Dera Ismail Khan","Haripur","Swabi","Buner","Malakand","Chitral"],
  Balochistan: ["Quetta","Turbat","Khuzdar","Hub","Chaman","Gwadar","Zhob","Loralai","Kalat","Panjgur","Nushki","Sibi","Nasirabad","Dera Bugti","Mastung"],
  "Azad Kashmir": ["Muzaffarabad","Mirpur","Rawalakot","Bagh","Kotli","Bhimber","Neelum","Haveli","Sudhnoti"],
  Gilgit: ["Gilgit","Skardu","Ghanche","Diamer","Astore","Hunza","Nagar","Ghizer","Shigar"],
};

const RegisterOrganization = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    organizationName: "",
    address: "",
    province: "",
    district: "",
    headName: "",
    phone: "",
    email: "",
    password: "",
    latitude: null,
    longitude: null,
  });

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

  const handleLocationSelect = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setError("");
  };

  const handleSendOTP = async () => {
    const { organizationName, address, province, district, headName, phone, email, password, latitude, longitude } = formData;
    if (!organizationName || !address || !province || !district || !headName || !phone || !email || !password) {
      return setError("All fields are required.");
    }
    if (!latitude || !longitude) {
      return setError("Please set your organization's location on the map.");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/org/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong.");
      setStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) return setError("Enter the 6-digit OTP.");
    setLoading(true);
    try {
      const res = await fetch("/api/org/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otp }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Invalid OTP.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "organization");
      localStorage.setItem("orgCode", data.organization.orgCode);
      window.location.href = "/org/dashboard";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["org-container"]}>
      <div className={styles["org-header"]}>
        <h2>Register As Organization</h2>
      </div>

      {step === 1 ? (
        <div className={styles["org-form"]}>

          <div className={styles["form-group"]}>
            <label>Organization Name</label>
            <input type="text" placeholder="Name" name="organizationName" onChange={handleChange} value={formData.organizationName} />
          </div>

          <div className={styles["form-group"]}>
            <label>Address</label>
            <textarea placeholder="Street address, building, etc." name="address" onChange={handleChange} value={formData.address} />
          </div>

          {/* Province */}
          <div className={styles["form-group"]}>
            <label>Province</label>
            <select name="province" onChange={handleChange} value={formData.province}>
              <option value="">Select Province</option>
              {Object.keys(PROVINCE_DISTRICTS).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className={styles["form-group"]}>
            <label>District</label>
            <select name="district" onChange={handleChange} value={formData.district} disabled={!formData.province}>
              <option value="">{formData.province ? "Select District" : "Select a province first"}</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Location picker */}
          <div className={styles["form-group"]}>
            <label>Pin Organization Location</label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>

          <div className={styles["form-group"]}>
            <label>Head of Organization</label>
            <input type="text" placeholder="Name" name="headName" onChange={handleChange} value={formData.headName} />
          </div>

          <div className={styles["form-group"]}>
            <label>Phone Number</label>
            <input type="text" placeholder="Number" name="phone" onChange={handleChange} value={formData.phone} />
          </div>

          <div className={styles["form-group"]}>
            <label>Email</label>
            <input type="email" placeholder="Email address" name="email" onChange={handleChange} value={formData.email} />
          </div>

          <div className={styles["form-group"]}>
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" name="password" onChange={handleChange} value={formData.password} />
          </div>

          {error && <p className={styles["error"]}>{error}</p>}

          <div className={styles["submit-row"]}>
            <button onClick={handleSendOTP} disabled={loading}>
              {loading ? "Sending OTP…" : "Send OTP ✉"}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles["org-form"]}>
          <p className={styles["otp-info"]}>
            An OTP has been sent to <strong>{formData.email}</strong>. Enter it below to complete registration.
          </p>
          <div className={styles["form-group"]}>
            <label>Enter OTP</label>
            <input type="text" placeholder="6-digit OTP" maxLength={6} value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(""); }} />
          </div>
          {error && <p className={styles["error"]}>{error}</p>}
          <div className={styles["submit-row"]}>
            <button className={styles["back-btn"]} onClick={() => { setStep(1); setError(""); }}>← Back</button>
            <button onClick={handleVerifyOTP} disabled={loading}>
              {loading ? "Verifying…" : "Submit ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterOrganization;