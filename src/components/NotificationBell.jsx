import { useState, useEffect, useRef } from "react";
import styles from "./NotificationBell.module.css";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // silent
    }
  };

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDismiss = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch { /* silent */ }
  };

  const handleClearAll = async () => {
    try {
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      setOpen(false);
    } catch { /* silent */ }
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.bellBtn} onClick={() => setOpen((o) => !o)}>
        🔔
        {notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>Notifications</span>
            {notifications.length > 0 && (
              <button className={styles.clearBtn} onClick={handleClearAll}>
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className={styles.empty}>No new notifications</p>
          ) : (
            <div className={styles.list}>
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={styles.item}
                  onClick={() => handleDismiss(n._id)}
                  title="Click to dismiss"
                >
                  <span className={styles.notifEmoji}>{n.emoji}</span>
                  <div className={styles.notifBody}>
                    <p className={styles.notifTitle}>🎉 {n.title}</p>
                    <p className={styles.notifDesc}>{n.message}</p>
                    <p className={styles.notifTime}>
                      {new Date(n.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric", month: "short",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    className={styles.dismissBtn}
                    onClick={(e) => { e.stopPropagation(); handleDismiss(n._id); }}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}