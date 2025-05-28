import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import "./Home.css";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [favoriteCourseIds, setFavoriteCourseIds] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const slides = [
    { id: 1, imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1500&q=80", title: "Đào tạo chuyên sâu", description: "Nâng cao kỹ năng với các khóa học chất lượng" },
    { id: 2, imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1500&q=80", title: "Lớp học tương tác", description: "Trải nghiệm học tập cùng giảng viên tận tâm" },
    { id: 3, imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1500&q=80", title: "Không gian học tập lý tưởng", description: "Môi trường hiện đại kích thích sáng tạo" },
    { id: 4, imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1500&q=80", title: "Công nghệ giáo dục 4.0", description: "Tiếp cận phương pháp học tập tiên tiến" },
    { id: 5, imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1500&q=80", title: "Lộ trình cá nhân hóa", description: "Học theo tốc độ và nhu cầu của bạn" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCourses = await fetch("http://localhost:5000/api/courses");
        if (!resCourses.ok) throw new Error("Không thể tải khóa học");
        const courseData = await resCourses.json();
        setCourses(courseData);

        if (token) {
          const resFav = await fetch("http://localhost:5000/api/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const favData = await resFav.json();
          const favIds = favData.map((c) => c._id);
          setFavoriteCourseIds(favIds);
        }

        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleFavoriteToggle = (courseId, isNowFavorite) => {
    setFavoriteCourseIds((prev) =>
      isNowFavorite ? [...prev, courseId] : prev.filter((id) => id !== courseId)
    );
  };

  return (
    <div className="home">
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          >
            <div className="slide-content">
              <h3>{slide.title}</h3>
              <p>{slide.description}</p>
            </div>
          </div>
        ))}
        <button className="slide-nav prev" onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}>
          &#10094;
        </button>
        <button className="slide-nav next" onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}>
          &#10095;
        </button>
        <div className="dots-container">
          {slides.map((_, index) => (
            <span key={index} className={`dot ${index === currentSlide ? "active" : ""}`} onClick={() => setCurrentSlide(index)} />
          ))}
        </div>
      </div>

      <h2>Danh sách khóa học</h2>
      {loading ? (
        <p>Đang tải khóa học...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Lỗi: {error}</p>
      ) : (
        <div className="course-list">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              isInitiallyFavorite={favoriteCourseIds.includes(course._id)}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
