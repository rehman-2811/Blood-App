import styles from "./Aboutcard.module.css";

export default function AboutCard({ donor }) {
  const rows = [
    ["Full Name",          `${donor.firstName} ${donor.lastName}`],
    ["Email",              donor.email],
    ["Phone",              donor.phone],
    ["Age",                donor.age],
    ["Blood Group",        donor.bloodGroup],
    ["District",           donor.district],
    ["Province",           donor.province],
    ["Pincode",            donor.pincode],
    ["Address",            donor.address],
    ["Last Donation Date", donor.lastDonationDate || "N/A"],
  ];

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>About</h2>

      {rows.map(([label, value]) => (
        <div key={label} className={styles.row}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value || "—"}</span>
        </div>
      ))}

      {/* ── Linked Organizations ── */}
      <div className={styles.orgSection}>
        <span className={styles.label}>Linked Organizations</span>

        {donor.linkedOrganizations?.length > 0 ? (
          <div className={styles.orgList}>
            {donor.linkedOrganizations.map((link, i) => (
              <div key={i} className={styles.orgItem}>
                <div className={styles.orgName}>
                  🏥 {link.organization?.organizationName || link.orgCode}
                </div>
                {link.organization?.phone && (
                  <div className={styles.orgPhone}>
                    📞 {link.organization.phone}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className={styles.orgNone}>
            None — enter an org code in Edit Profile to link
          </span>
        )}
      </div>
    </div>
  );
}