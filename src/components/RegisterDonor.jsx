import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterDonor.module.css";
import LocationPicker from "./LocationPicker";

const RegisterDonor = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    age: "",
    bloodGroup: "",
    district: "",
    province: "",
    pincode: "",
    month: "",
    year: "",
    agreedToTerms: false,
    latitude: null,
    longitude: null,
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleLocationSelect = ({ lat, lng }) => {
   setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      setError("Please set your location on the map.");
     return false;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const otpResponse = await axios.post('http://localhost:5000/api/auth/send-registration-otp', {
        phone: formData.phone,
        email: formData.email
      });
      
      if (otpResponse.data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP");
        setLoading(false);
        return;
      }

      // Remove confirmPassword and prepare donorData
      const { confirmPassword, ...donorDataRaw } = formData;

      // Convert numeric fields & ensure defaults
      const donorData = {
        ...donorDataRaw,
        age: Number(donorDataRaw.age) || undefined,
        month: donorDataRaw.month || '',
        year: donorDataRaw.year || '',
        agreedToTerms: donorDataRaw.agreedToTerms === true
      };

      const response = await axios.post('http://localhost:5000/api/auth/verify-registration-otp', {
        phone: formData.phone,
        email: formData.email,
        otp,
        donorData
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error("OTP verify error:", err.response?.data);
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('http://localhost:5000/api/auth/send-registration-otp', {
        phone: formData.phone,
        email: formData.email
      });
      alert('OTP resent successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.donorContainer}>
      <div className={styles.donorHeader}>
        <h2>Register As Donor {step === 2 && "- Verify OTP"}</h2>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className={styles.successMessage}>
          Registration Successful! Redirecting to login...
        </div>
      )}

      {step === 1 ? (
        <form className={styles.donorForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label>Full Name *</label>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                placeholder="First" 
                name="firstName" 
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input 
                type="text" 
                placeholder="Last Name" 
                name="lastName" 
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <label>Phone Number *</label>
            <input 
              type="tel" 
              placeholder="Enter phone number" 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Email *</label>
            <input 
              type="email" 
              placeholder="Enter email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Password *</label>
            <input 
              type="password" 
              placeholder="Create password (min. 6 characters)" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className={styles.formRow}>
            <label>Confirm Password *</label>
            <input 
              type="password" 
              placeholder="Confirm password" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Address *</label>
            <textarea 
              placeholder="Enter your address" 
              name="address" 
              value={formData.address}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className={styles.formRow}>
            <label>Pin Your Location *</label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
         </div>

          <div className={styles.formRow}>
            <label>Age *</label>
            <input 
              type="number" 
              placeholder="Age" 
              name="age" 
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="65"
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Blood Group *</label>
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
              <option value="">Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          <div className={`${styles.formRow} ${styles.twoCol}`}>
            <div>
              <label>District *</label>
              <select name="district" value={formData.district} onChange={handleChange} required>
                <option value="">Select District</option>
                <option>Lahore</option>
                <option>Karachi</option>
                <option>Islamabad</option>
              </select>
            </div>

            <div>
              <label>Province *</label>
              <select name="province" value={formData.province} onChange={handleChange} required>
                <option value="">Select Province</option>
                <option>Punjab</option>
                <option>Sindh</option>
                <option>KPK</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <label>PinCode *</label>
            <input 
              type="text" 
              name="pincode" 
              value={formData.pincode}
              onChange={handleChange}
              pattern="[0-9]{5,6}"
              title="Please enter a valid 5-6 digit pincode"
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Last Donation (Optional)</label>
            <div className={styles.inputGroup}>
              <input 
                type="text" 
                placeholder="Month" 
                name="month" 
                value={formData.month}
                onChange={handleChange}
              />
              <input 
                type="text" 
                placeholder="Year" 
                name="year" 
                value={formData.year}
                onChange={handleChange}
                pattern="[0-9]{4}"
                title="Please enter a valid year"
              />
            </div>
          </div>

          <div className={styles.checkboxRow}>
            <input 
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              required
            />
            <p>I agree to the terms and conditions of blood donation and confirm that the information provided is accurate.</p>
          </div>

          <div className={styles.submitRow}>
            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Register & Send OTP"}
            </button>
          </div>
        </form>
      ) : (
        <form className={styles.otpForm} onSubmit={handleVerifyOTP}>
          <div className={styles.otpInfo}>
            <p>We've sent a verification code to:</p>
            <p className={styles.contactInfo}>
              {formData.phone && <span>📱 {formData.phone}</span>}
              {formData.email && <span>✉️ {formData.email}</span>}
            </p>
          </div>

          <div className={styles.formRow}>
            <label>Enter OTP *</label>
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              pattern="[0-9]{6}"
              required
            />
          </div>

          <div className={styles.otpActions}>
            <button type="button" onClick={handleResendOTP} disabled={loading}>
              Resend OTP
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RegisterDonor;