import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaStream,
  FaBook,
  FaChevronLeft,
  FaChevronRight,
  FaPlusCircle,
  FaUserShield,
  FaStar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleItemClick = (item) => {
    setActiveItem(item);

    switch (item) {
      case "home":
        navigate("/");
        break;
      case "roadmap":
        navigate("/roadmap");
        break;
      case "courses":
        navigate("/my-courses");
        break;
      case "addcourse":
        navigate("/addcourse");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "favorites":
        navigate("/favorites");
        break;
      case "instructor":
        navigate("/instructor/dashboard");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <p>Đang tải...</p>;
  }

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button
          className="toggle-btn"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? (
            <FaChevronRight className="toggle-icon" />
          ) : (
            <>
              <FaChevronLeft className="toggle-icon" />
              <span className="toggle-text">Thu gọn</span>
            </>
          )}
        </button>
      </div>

      <div className="menu-items">
        <div
          className={`menu-item ${activeItem === "home" ? "active" : ""}`}
          onClick={() => handleItemClick("home")}
        >
          <FaHome className="icon" />
          {!collapsed && <span>Trang chủ</span>}
        </div>

        <div
          className={`menu-item ${activeItem === "courses" ? "active" : ""}`}
          onClick={() => handleItemClick("courses")}
        >
          <FaBook className="icon" />
          {!collapsed && <span>Khóa học đã đăng kí</span>}
        </div>

        <div
          className={`menu-item ${activeItem === "favorites" ? "active" : ""}`}
          onClick={() => handleItemClick("favorites")}
        >
          <FaStar className="icon" />
          {!collapsed && <span>Danh sách yêu thích</span>}
        </div>

        {(user?.role === "instructor" || user?.role === "admin") && (
          <>
            <div
              className={`menu-item ${activeItem === "addcourse" ? "active" : ""}`}
              onClick={() => handleItemClick("addcourse")}
            >
              <FaPlusCircle className="icon" />
              {!collapsed && <span>Thêm Khóa Học</span>}
            </div>

            {user?.role === "instructor" && (
              <div
                className={`menu-item ${activeItem === "instructor" ? "active" : ""}`}
                onClick={() => handleItemClick("instructor")}
              >
                <FaStream className="icon" />
                {!collapsed && <span>Giảng dạy</span>}
              </div>
            )}
          </>
        )}

        {user?.role === "admin" && (
          <div
            className={`menu-item ${activeItem === "admin" ? "active" : ""}`}
            onClick={() => handleItemClick("admin")}
          >
            <FaUserShield className="icon" />
            {!collapsed && <span>Trang Admin</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;