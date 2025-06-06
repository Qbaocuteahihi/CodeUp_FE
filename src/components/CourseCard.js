import React, { useState, useEffect } from "react";
import "./CourseCard.css";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";

const CourseCard = ({ course, refreshCourses, isInitiallyFavorite, onFavoriteToggle }) => {
  const [loading, setLoading] = useState(false);
  const [paymentWindow, setPaymentWindow] = useState(null);
  const [isFavorite, setIsFavorite] = useState(isInitiallyFavorite || false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const userId = user?.id;
  const isEnrolled = course.enrolledUsers?.includes(userId);

  useEffect(() => {
    const handleMessage = (event) => {
      const { paymentStatus } = event.data;
      if (paymentStatus === "success") {
        alert("Thanh toán thành công! Khóa học đã được kích hoạt.");
        refreshCourses?.();
        window.location.reload();
      } else if (paymentStatus === "failed") {
        alert("Thanh toán thất bại! Vui lòng thử lại.");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handlePayment = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const response = await fetch("/api/create-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id, userId }),
      });
      const data = await response.json();
      if (response.ok) {
        const newWindow = window.open(data.url, "_blank", "width=600,height=800");
        setPaymentWindow(newWindow);
        const checkWindow = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkWindow);
            refreshCourses?.();
          }
        }, 500);
      } else {
        alert(data.message || "Lỗi khởi tạo thanh toán");
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      alert("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMore = (e) => {
    e.stopPropagation();
    if (!isEnrolled) {
      alert("Vui lòng mua khóa học để xem nội dung chi tiết!");
    } else {
      window.location.href = `/courses/${course._id}`;
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!token) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onFavoriteToggle?.(course._id, newFavoriteState);

    try {
      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course._id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setIsFavorite(!newFavoriteState);
        onFavoriteToggle?.(course._id, !newFavoriteState);
        alert(data.message || "Lỗi khi cập nhật yêu thích");
      }
    } catch (error) {
      console.error("Lỗi toggle yêu thích:", error);
      setIsFavorite(!newFavoriteState);
      onFavoriteToggle?.(course._id, !newFavoriteState);
      alert("Lỗi kết nối");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={"full" + i} color="#ffc107" />);
    if (halfStar) stars.push(<FaStarHalfAlt key="half" color="#ffc107" />);
    for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={"empty" + i} color="#ccc" />);
    return stars;
  };

  return (
    <div className="course-card">
      <img src={course.imageUrl} alt={course.title} className="course-image" />
      <div className="course-info">
        <div className="header-row">
          <h3>{course.title}</h3>
          <button onClick={toggleFavorite} className="favorite-button" aria-label="Toggle favorite">
            <span style={{ color: isFavorite ? "#ff3860" : "#7a7a7a", fontSize: "1.4rem" }}>
              {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </span>
          </button>
        </div>
        <p className="description">{course.description}</p>
        <div className="rating-display" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {renderStars(course.averageRating || 0)}
          <span style={{ fontSize: "0.9rem", color: "#555" }}>
            ({course.ratingCount || 0} đánh giá)
          </span>
        </div>
        <div className="meta-info">
          <span className="price">💰 {course.price.toLocaleString()} VND</span>
          <span className={`level ${course.level.toLowerCase()}`}>{course.level}</span>
        </div>
        <div className="action-buttons">
          <button className="preview-button" onClick={handleViewMore}>👀 Xem trước</button>
          <button className={`purchase-button ${isEnrolled ? "purchased" : ""}`} onClick={handlePayment} disabled={loading || isEnrolled}>
            {loading ? "🔄 Đang xử lý..." : isEnrolled ? "✅ Đã sở hữu" : "💳 Mua ngay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;