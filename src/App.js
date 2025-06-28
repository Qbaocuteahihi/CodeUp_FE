// src/App.jsx
import React, { useState, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./App.css";

// Sử dụng React.lazy cho các trang
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const CourseDetail = React.lazy(() => import("./pages/CourseDetail"));
const AddCourse = React.lazy(() => import("./pages/Addcourse"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Profile = React.lazy(() => import("./pages/Profile"));
const PaymentStatus = React.lazy(() => import("./pages/PaymentStatus"));
const UserDetail = React.lazy(() => import("./pages/UserDetail"));
const FavoritePage = React.lazy(() => import("./pages/FavoritePage"));
const MyCourses = React.lazy(() => import("./pages/MyCourses"));
const InstructorDashboard = React.lazy(() => import("./pages/InstructorDashboard"));
const EditCourse = React.lazy(() => import("./pages/EditCourse"));

// Component layout chứa header, sidebar, footer
const AppLayout = ({ user, onLogout, children }) => {
  return (
    <>
      <Header user={user} onLogout={onLogout} />
      <div className="main-layout">
        <Sidebar />
        <div className="main-content">
          <Suspense fallback={<div className="loading-spinner" />}>
            {children}
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Không cần React.memo để tránh lỗi render
const LayoutWrapper = ({ user, onLogout, children }) => {
  return (
    <AppLayout user={user} onLogout={onLogout}>
      {children}
    </AppLayout>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi khi phân tích dữ liệu người dùng:", e);
        localStorage.removeItem("user");
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<div className="loading-spinner" />}>
              <Login setUser={setUser} />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<div className="loading-spinner" />}>
              <Register />
            </Suspense>
          }
        />

        <Route
          path="/profile"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <Profile user={user} />
            </LayoutWrapper>
          }
        />

        <Route
          path="/admin/users/:id"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <UserDetail />
            </LayoutWrapper>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <CourseDetail user={user} />
            </LayoutWrapper>
          }
        />

        <Route
          path="/addcourse"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <AddCourse />
            </LayoutWrapper>
          }
        />

        <Route
          path="/editcourse/:id"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <EditCourse />
            </LayoutWrapper>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <AdminDashboard />
            </LayoutWrapper>
          }
        />

        <Route
          path="/payment-status"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <PaymentStatus />
            </LayoutWrapper>
          }
        />

        <Route
          path="/my-courses"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <MyCourses />
            </LayoutWrapper>
          }
        />

        <Route
          path="/favorites"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <FavoritePage />
            </LayoutWrapper>
          }
        />

        <Route
          path="/instructor/dashboard"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <InstructorDashboard />
            </LayoutWrapper>
          }
        />

        <Route
          path="*"
          element={
            <LayoutWrapper user={user} onLogout={handleLogout}>
              <Home />
            </LayoutWrapper>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
