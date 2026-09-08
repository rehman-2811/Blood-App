import React from "react";
import styles from "./About.module.css";

const About = () => {
  return (
    <div className={styles.aboutContainer}>

      {/* Header */}
      <div className={styles.aboutHeader}>
        <h1>Connecting Donors. Saving Lives.</h1>
        <p>
          Every drop of blood has the power to save a life
        </p>
      </div>

      {/* Main Content */}
      <div className={styles.aboutContent}>

        <section className={styles.aboutSection}>
          <h2>About Us</h2>
          <p>
            Our platform is dedicated to making blood donation easier, faster, and more accessible for everyone. Every day, hospitals and patients around the world face critical situations where timely access to blood can mean the difference between life and death. Our mission is to bridge the gap between generous blood donors and those who urgently need help.
          </p>

          <p>
            We believe that donating blood is one of the simplest yet most powerful ways to save lives. By building a digital platform that connects donors, recipients, and organizations, we aim to create a reliable network where help can be found quickly during emergencies.
          </p>
        </section>


        <section className={styles.aboutSection}>
          <h2>Our Purpose</h2>

          <p>
            The purpose of this platform is to simplify the process of finding blood donors and managing blood donation activities. Instead of relying on time-consuming manual searches, phone calls, or scattered records, our system provides a streamlined digital solution where users can easily search for donors based on blood group and location.
          </p>

          <p>
            Through our platform, individuals can register as donors, organizations can participate in blood donation initiatives, and recipients can quickly find compatible donors nearby. By bringing all these elements together, we hope to create a supportive community where people help each other during critical moments.
          </p>
        </section>


        <section className={styles.aboutSection}>
          <h2>What We Do</h2>

          <p>
            Our platform acts as a central hub for blood donation services. We provide tools that allow donors to register their details and make themselves available to help those in need. Recipients can search for donors based on specific criteria such as blood group and location, making the process much faster than traditional methods.
          </p>

          <p>
            To improve efficiency and accuracy, our system also incorporates modern technologies such as QR-based identification, which helps maintain organized records and allows quick verification of donor information when needed. This ensures that both donors and healthcare organizations can interact through a secure and reliable system.
          </p>
        </section>


        <section className={styles.aboutSection}>
          <h2>Encouraging a Culture of Donation</h2>

          <p>
            Beyond providing a digital platform, we are committed to encouraging a culture of voluntary blood donation. Many lives can be saved if more people become regular donors and are willing to support their communities during emergencies.
          </p>

          <p>
            Our goal is to raise awareness about the importance of blood donation and inspire individuals to take part in this life-saving act. By making the process simple and accessible, we hope to motivate more people to join the network of donors who are ready to help whenever the need arises.
          </p>
        </section>


        <section className={styles.aboutSection}>
          <h2>Looking Ahead</h2>

          <p>
            As our platform continues to grow, we aim to expand its capabilities and reach more communities. Future improvements will focus on enhancing donor accessibility, improving search efficiency, and strengthening collaboration with healthcare organizations.
          </p>

          <p>
            Through innovation and community participation, we envision a future where no patient has to struggle to find the blood they need during critical moments.
          </p>

          <p>
            Together, we can build a stronger network of donors and create a system where help is always within reach.
          </p>
        </section>

      </div>

    </div>
  );
};

export default About;