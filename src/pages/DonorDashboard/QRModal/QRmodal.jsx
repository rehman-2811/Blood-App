import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import styles from "./QRmodal.module.css";

const GAP_DAYS = 90;

export default function QRModal({ donor, onClose }) {
  const canvasRef = useRef(null);

  // Work out eligibility
  let eligible = true;
  let daysLeft = 0;
  if (donor.lastDonationDate) {
    const diff = Math.floor((new Date() - new Date(donor.lastDonationDate)) / 86400000);
    if (diff < GAP_DAYS) { eligible = false; daysLeft = GAP_DAYS - diff; }
  }

  // Build the data object that gets encoded in the QR
  const qrData = JSON.stringify({
    name:               `${donor.firstName} ${donor.lastName}`,
    bloodGroup:         donor.bloodGroup,
    age:                donor.age,
    district:           donor.district,
    province:           donor.province,
    phone:              donor.phone,
    lastDonation:       donor.lastDonationDate || "N/A",
    eligible,
    daysUntilEligible:  daysLeft,
    healthIssues:       donor.healthIssues       || "None",
    currentMedications: donor.currentMedications || "None",
    recentSurgery:      donor.recentSurgery      || "No",
    smoker:             donor.smoker             || "No",
    alcoholic:          donor.alcoholic          || "No",
    allergies:          donor.allergies          || "None",
  });

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 220,
        color: { dark: "#3b0a0a", light: "#ffffff" },
      });
    }
  }, [qrData]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Donor QR Code</h2>
        <p className={styles.subtitle}>Scan to view full donor profile & eligibility</p>

        <canvas ref={canvasRef} className={styles.canvas} />

        <div className={`${styles.eligBadge} ${eligible ? styles.eligible : styles.notEligible}`}>
          {eligible ? "✓ Eligible to Donate" : `✗ Eligible in ${daysLeft} days`}
        </div>

        <p className={styles.note}>
          This QR encodes name, blood group, health info, last donation date, and eligibility status.
        </p>

        <button className={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}