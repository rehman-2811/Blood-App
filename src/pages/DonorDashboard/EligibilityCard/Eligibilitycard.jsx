import styles from "./Eligibilitycard.module.css";

const GAP_DAYS = 90;

export default function EligibilityCard({ donor }) {
  let eligible = true;
  let daysLeft = 0;
  let daysSince = null;

  if (donor.lastDonationDate) {
    daysSince = Math.floor((new Date() - new Date(donor.lastDonationDate)) / 86400000);
    if (daysSince < GAP_DAYS) {
      eligible = false;
      daysLeft = GAP_DAYS - daysSince;
    }
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Donation Eligibility</h2>
      <div className={styles.row}>
        <div className={`${styles.circle} ${eligible ? styles.eligible : styles.notEligible}`}>
          <span className={styles.circleNum}>
            {eligible ? "✓" : `${daysLeft}d`}
          </span>
          <span className={styles.circleLabel}>
            {eligible ? "Ready" : "left"}
          </span>
        </div>
        <div className={styles.info}>
          <p className={styles.mainText}>
            {eligible
              ? "You are eligible to donate blood!"
              : `Next donation eligible in ${daysLeft} days`}
          </p>
          <p className={styles.subText}>Minimum gap between donations: {GAP_DAYS} days</p>
          {daysSince !== null && (
            <p className={styles.subText}>Days since last donation: {daysSince}</p>
          )}
        </div>
      </div>
    </div>
  );
}