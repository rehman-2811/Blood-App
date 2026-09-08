import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HeroSection.module.css"; // Use CSS Module
import blobImage from "../assets/Ellipse 8.png";


const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className={styles.home}>
      <img src={blobImage} alt="background shape" className={styles.blobImg} />

      {/* Hero Content */}
      <div className={styles.heroText}>
        <h1>Save Life Donate Blood</h1>

        <p>
          Thousands of patients need blood every day. By joining our donor community, you become part of a life-saving network that never stops giving.
        </p>

        <button className={styles.heroBtn} onClick={() => navigate("/find-blood")}> GET BLOOD NOW</button>
      </div>
    </section>
  );
};

export default HeroSection;