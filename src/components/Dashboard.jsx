import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import Chatbot from "./Chatbot"; // ← add, adjust path to wherever it actually lives

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setUser(response.data.data);

      } catch (error) {
        console.error("Token verification failed:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className={styles["dashboard-loading"]}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className={styles["dashboard-container"]}>

      <div className={styles["dashboard-header"]}>

        <h1>
          Welcome, {user?.firstName} {user?.lastName}
        </h1>

        <button
          onClick={handleLogout}
          className={styles["logout-btn"]}
        >
          Logout
        </button>

      </div>

      <div className={styles["dashboard-content"]}>

        {/* Profile Card */}
        <div className={styles["profile-card"]}>

          <h2>Your Profile</h2>

          <div className={styles["profile-info"]}>

            <div className={styles["info-row"]}>
              <label>Name:</label>
              <span>{user?.firstName} {user?.lastName}</span>
            </div>

            <div className={styles["info-row"]}>
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>

            <div className={styles["info-row"]}>
              <label>Phone:</label>
              <span>{user?.phone}</span>
            </div>

            <div className={styles["info-row"]}>
              <label>Blood Group:</label>
              <span className={styles["blood-group"]}>
                {user?.bloodGroup}
              </span>
            </div>

            <div className={styles["info-row"]}>
              <label>Role:</label>
              <span>{user?.role}</span>
            </div>

          </div>

        </div>

        {/* Quick Actions */}
        <div className={styles["quick-actions"]}>

          <h2>Quick Actions</h2>

          <div className={styles["actions-grid"]}>

            {/* <button className={styles["action-btn"]}>
              Find Blood
            </button> */}

            <button className={styles["action-btn"]}>
              Update Profile
            </button>

            <button className={styles["action-btn"]}>
              Donation History
            </button>

            {/* <button className={styles["action-btn"]}>
              Nearby Requests
            </button> */}

          </div>

        </div>

      </div>

      <Chatbot />  {/* ← add, anywhere in the tree works since it's position: fixed */}

    </div>
  );
};

export default Dashboard;