import React from "react";
import styles from "./MissionSection.module.css";

const MissionSection = () => {
  return (
    <section className={styles.mission} id="about">
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Our Mission</h2>

        <div className={styles.missionContent}>
          <p className={styles.missionText}>
            Every drop of blood carries the power to save a life. Our mission
            is to build a compassionate community of donors who stand ready to
            help at a moment's notice. We believe that blood donation is not
            just a medical procedure—it's an act of humanity that brings hope
            to families, strength to patients, and smiles to faces that need
            it most.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;