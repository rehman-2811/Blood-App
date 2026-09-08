import { useState, useEffect } from "react";
import styles from "./BadgeCard.module.css";

export default function BadgeCard() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/badges", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setBadges(data.badges || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (!badges.length) {
    return (
      <div className={styles.card}>
        <h2 className={styles.title}>🏅 Achievements</h2>
        <p className={styles.empty}>No badges earned yet — keep donating!</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>🏅 Achievements</h2>
      <p className={styles.subtitle}>{badges.length} badge{badges.length !== 1 ? "s" : ""} earned</p>
      <div className={styles.grid}>
        {badges.map((badge) => (
          <div key={badge.id} className={styles.badge} title={badge.description}>
            <div className={styles.emojiRing} style={{ borderColor: badge.color }}>
              <span className={styles.emoji}>{badge.emoji}</span>
            </div>
            <p className={styles.label}>{badge.label}</p>
            <p className={styles.desc}>{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}