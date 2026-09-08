import styles from "./Profilecard.module.css";

const GAP_DAYS = 90;

function eligibilityStatus(donor) {
  if (!donor.lastDonationDate) return { eligible: true, label: "Eligible" };
  const diff = Math.floor((new Date() - new Date(donor.lastDonationDate)) / 86400000);
  if (diff >= GAP_DAYS) return { eligible: true, label: "Eligible" };
  return { eligible: false, label: `Not Eligible — ${GAP_DAYS - diff} days left` };
}

export default function ProfileCard({ donor, onShowQR }) {
  const status = eligibilityStatus(donor);

  return (
    <div className={styles.card}>
      <div className={styles.avatarLg}>
        {donor.firstName?.[0]}{donor.lastName?.[0]}
      </div>

      <div className={styles.info}>
        <h1 className={styles.name}>
          {donor.firstName} {donor.lastName}
        </h1>
        <span className={`${styles.eligPill} ${status.eligible ? styles.eligible : styles.notEligible}`}>
          {status.label}
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.qrBtn} onClick={onShowQR}>
          📱 Show QR
        </button>
        <a href="/donor/edit-profile" className={styles.editBtn}>
          ✏ Edit Profile
        </a>
      </div>
    </div>
  );
}