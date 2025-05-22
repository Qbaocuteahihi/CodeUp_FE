// FavoritePage.jsx
import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";

const FavoritePage = () => {
  const [favorites, setFavorites] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
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

    fetchFavorites();
  }, []);

  return (
    <div>
      <h2>❤️ Danh sách yêu thích</h2>
      <div className="course-list">
        {Array.isArray(favorites) && favorites.length > 0 ? (
          favorites.map((course) => <CourseCard key={course._id} course={course} />)
        ) : (
          <p>Bạn chưa có khóa học yêu thích nào.</p>
        )}
      </div>
    </div>
  );
};

export default FavoritePage;
