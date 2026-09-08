import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import logo from "../assets/Logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarFixed : ""}`}>
      <div className={styles.navContainer}>

        {/* Logo */}
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
        </div>

        {/* Hamburger */}
        <div className={styles.hamburger} onClick={toggleMenu}>
          <div style={{ transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }}></div>
          <div style={{ opacity: menuOpen ? 0 : 1 }}></div>
          <div style={{ transform: menuOpen ? "rotate(-45deg) translate(6px,-6px)" : "none" }}></div>
        </div>

        {/* Menu */}
        <ul className={`${styles.navMenu} ${menuOpen ? styles.active : ""}`}>

          <li className={styles.navItem}>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          </li>

          <li className={styles.navItem}>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
          </li>

          <li className={styles.navItem}>
            <Link to="/find-blood" onClick={() => setMenuOpen(false)}>Find Blood</Link>
          </li>

          {/* Register Dropdown */}
          <li 
            className={styles.navItem + " " + styles.dropdown}
            onMouseEnter={() => setDropdown(true)}
            onMouseLeave={() => setDropdown(false)}
            onClick={() => setDropdown(!dropdown)}
          >
            Register Now ▾

            {dropdown && (
              <ul className={styles.dropdownMenu}>
                <li>
                  <Link to="/register-donor" onClick={() => setMenuOpen(false)}>Register Donor</Link>
                </li>
                <li>
                  <Link to="/register-organization" onClick={() => setMenuOpen(false)}>Register Organization</Link>
                </li>
              </ul>
            )}
          </li>

          {/* Login Button */}
          <li>
            <Link to="/login">
              <button className={styles.loginBtn} onClick={() => setMenuOpen(false)}>Log In</button>
            </Link>
          </li>

        </ul>

      </div>
    </nav>
  );
};

export default Navbar;