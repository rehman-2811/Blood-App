import React from "react";
import styles from "./Footer.module.css";
import logo from "../assets/Vector.png";

const Footer = () => {
  return (
    <footer className={styles.footer}>

      <div className={styles.footerTop}>
        <img src={logo} alt="logo" className={styles.footerLogo} />

        <div className={styles.donateBox}>
          <p>Ready to get started?</p>
          <button className={styles.donateBtn}>Donate</button>
        </div>
      </div>

      <hr />

      <div className={styles.footerContent}>

        <div className={styles.newsletter}>
          <h3>Subscribe to our newsletter</h3>

          <div className={styles.emailBox}>
            <input type="email" placeholder="Email address" />
            <button className={styles.arrowBtn}>›</button>
          </div>
        </div>

        <div className={styles.footerLinks}>
          <h4>Services</h4>
          <p>Email Marketing</p>
          <p>Campaigns</p>
          <p>Branding</p>
          <p>Offline</p>
        </div>

        <div className={styles.footerLinks}>
          <h4>About</h4>
          <p>Our Story</p>
          <p>Benefits</p>
          <p>Team</p>
          <p>Careers</p>
        </div>

        <div className={styles.footerLinks}>
          <h4>Help</h4>
          <p>FAQs</p>
          <p>Contact Us</p>
        </div>

      </div>

      <div className={styles.footerBottom}>

        <div className={styles.footerLegal}>
          <p>Terms & Conditions</p>
          <p>Privacy Policy</p>
        </div>

        <div className={styles.socials}>
          <i className="fab fa-facebook-f"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
        </div>

      </div>

    </footer>
  );
};

export default Footer;