import styles from "./Healthcard.module.css";

export default function HealthCard({ donor }) {
  const rows = [
    ["Health Issues",       donor.healthIssues       || "None"],
    ["Current Medications", donor.currentMedications || "None"],
    ["Recent Surgery",      donor.recentSurgery      || "No"],
    ["Smoker",              donor.smoker             || "No"],
    ["Alcohol Consumption", donor.alcoholic          || "No"],
    ["Allergies",           donor.allergies          || "None"],
  ];

  // Values that should be highlighted as a concern
  const flagValues = ["Yes"];

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Health Information</h2>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.row}>
          <span className={styles.label}>{label}</span>
          <span className={`${styles.value} ${flagValues.includes(value) ? styles.flagged : ""}`}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}