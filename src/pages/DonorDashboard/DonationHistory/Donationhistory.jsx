import styles from "./Donationhistory.module.css";

export default function DonationHistory({ donor }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Donation History</h2>
      {donor.donationHistory?.length ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Units (ml)</th>
              <th className={styles.th}>Organization</th>
              <th className={styles.th}>Location</th>
            </tr>
          </thead>
          <tbody>
            {donor.donationHistory.map((d, i) => (
              <tr key={i}>
                <td className={styles.td}>{d.date || "—"}</td>
                <td className={styles.td}>{d.units ? `${d.units} ml` : "—"}</td>
                <td className={styles.td}>{d.orgName || "—"}</td>
                <td className={styles.td}>{d.location || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>No donation records yet.</p>
      )}
    </div>
  );
}