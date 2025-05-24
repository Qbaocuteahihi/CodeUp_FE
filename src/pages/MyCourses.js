// src/pages/MyCourses.js
import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import "./Home.css"; // có thể dùng lại style

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải khóa học");
        return res.json();
      })
      .then((data) => {
        // Lọc ra những khóa học mà user đã đăng ký
        const enrolledCourses = data.filter((course) =>
          course.enrolledUsers?.includes(user?.id)
        );
        setCourses(enrolledCourses);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [user?.id]);

  return (
    <div className="home">
      <h2>Khóa học đã đăng ký</h2>
      {loading ? (
        <p>Đang tải khóa học...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Lỗi: {error}</p>
      ) : courses.length === 0 ? (
        <p>Bạn chưa đăng ký khóa học nào.</p>
      ) : (
        <div className="course-list">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
