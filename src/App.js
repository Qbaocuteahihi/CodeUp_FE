// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseDetail from "./pages/CourseDetail";
import AddCourse from "./pages/Addcourse";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import PaymentStatus from "./pages/PaymentStatus";
import FavoritePage from "./pages/FavoritePage";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./App.css";

function AppLayout({ user, onLogout, children }) {
  return (
    <>
      <Header user={user} onLogout={onLogout} />
      <div className="main-layout">
        <Sidebar />
        <div className="main-content">{children}</div>
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <AppLayout user={user} onLogout={handleLogout}>
              <Profile user={user} />
            </AppLayout>
          }
        />
        <Route path="/courses/:id" element={<CourseDetail user={user} />} />
        <Route path="/addcourse" element={<AddCourse />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route
          path="/favorites"
          element={
            <AppLayout user={user} onLogout={handleLogout}>
              <FavoritePage />
            </AppLayout>
          }
        />
        <Route
          path="*"
          element={
            <AppLayout user={user} onLogout={handleLogout}>
              <Home />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
