import React from "react";
import styles from "./HowToGetBlood.module.css";

const HowToGetBlood = () => {
  return (
    <section className={styles.howToGet} id="find-blood">
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>How to get Blood?</h2>

        <div className={styles.stepsContent}>
          <p className={styles.stepDescription}>
            Click the "Get Blood Now" button and fill in the essential details. Every minute counts.
          </p>

          <p className={styles.stepDescription}>
            Our network of voluntary organization is alerted immediately. We prioritize based on urgency and location.
          </p>

          <p className={styles.stepDescription}>
            Connect with the organization, complete the necessary formalities, and receive the blood you need.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowToGetBlood;