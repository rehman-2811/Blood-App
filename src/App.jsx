import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import React from "react";
import Navbar from "./components/Navbar";

import Home from "./components/HeroSection";
import MissionSection from "./components/MissionSection";
import HowToGetBlood from "./components/HowToGetBlood";
import Footer from "./components/Footer";
import RegisterDonor from "./components/RegisterDonor";
import RegisterOrganization from "./components/RegisterOrganization";
import FindBlood from "./components/FindBlood";
import About from "./components/About";
import Login from "./components/Login";

import OrgDashboard   from "./pages/OrganizationDashboard/OrgDashboard";
import DonorDashboard from "./pages/DonorDashboard/DonorDashboard";
import EditProfile    from "./pages/EditProfile/Editprofile";
import Chatbot        from "./components/Chatbot";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

import "./App.css";

const DASHBOARD_PATHS = ["/donor/dashboard", "/org/dashboard", "/donor/edit-profile", "/admin/dashboard"];

const RoleRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== requiredRole) {
    return <Navigate to={role === "organization" ? "/org/dashboard" : "/donor/dashboard"} replace />;
  }
  return children;
};

function HomePage() {
  return (
    <>
      <Home />
      <MissionSection />
      <HowToGetBlood />
      <Footer />
    </>
  );
}

function Layout() {
  const location = useLocation();
  const hideNavbar = DASHBOARD_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/"                       element={<HomePage />} />
        <Route path="/about"                  element={<About />} />
        <Route path="/find-blood"             element={<FindBlood />} />
        <Route path="/register-donor"         element={<RegisterDonor />} />
        <Route path="/register-organization"  element={<RegisterOrganization />} />
        <Route path="/login"                  element={<Login />} />

        <Route
          path="/donor/dashboard"
          element={<RoleRoute requiredRole="donor"><DonorDashboard /></RoleRoute>}
        />
        <Route
          path="/donor/edit-profile"
          element={<RoleRoute requiredRole="donor"><EditProfile /></RoleRoute>}
        />
        <Route
          path="/org/dashboard"
          element={<RoleRoute requiredRole="organization"><OrgDashboard /></RoleRoute>}
        />

        {/* Admin — no role guard needed since AdminDashboard checks its own token */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/dashboard"     element={<RoleRedirect />} />
        <Route path="/donordashboard" element={<RoleRedirect />} />

        {/* Catch-all LAST */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Chatbot />
    </>
  );
}

function RoleRedirect() {
  const role = localStorage.getItem("role");
  if (role === "organization") return <Navigate to="/org/dashboard" replace />;
  if (role === "donor")        return <Navigate to="/donor/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;