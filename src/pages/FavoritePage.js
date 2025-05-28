import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";

const FavoritePage = () => {
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem("token");

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setFavorites(data);
      } else {
        setFavorites([]);
      }
    } catch {
      alert("Lỗi khi tải danh sách yêu thích");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Callback để cập nhật trạng thái favorite khi user toggle trái tim
  const handleFavoriteToggle = (courseId, isNowFavorite) => {
    if (!isNowFavorite) {
      // Nếu user bỏ yêu thích, xóa khóa học khỏi danh sách favorites
      setFavorites((prev) => prev.filter((course) => course._id !== courseId));
    }
    // Nếu muốn, có thể fetch lại toàn bộ favorites hoặc giữ nguyên nếu thêm
  };

  return (
    <div>
      <h2>❤️ Danh sách yêu thích</h2>
      <div className="course-list">
        {favorites.length > 0 ? (
          favorites.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              isInitiallyFavorite={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))
        ) : (
          <p>Bạn chưa có khóa học yêu thích nào.</p>
        )}
      </div>
    </div>
  );
};

export default FavoritePage;
