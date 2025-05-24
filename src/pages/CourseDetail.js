import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RatingForm from "../components/RatingForm"; // Import form đánh giá
import "./CourseDetail.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      const url = userId
        ? `http://localhost:5000/api/courses/${id}?userId=${userId}`
        : `http://localhost:5000/api/courses/${id}`;

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Lỗi khi tải khóa học.");
        setCourse(null);
      } else {
        const data = await res.json();
        setCourse(data);
      }
    } catch (err) {
      setError("Lỗi kết nối tới server.");
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!course) return <div>Không tìm thấy khóa học.</div>;

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    return (
      <>
        {Array.from({ length: fullStars }, (_, i) => (
          <span key={i} className="star filled">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {Array.from(
          { length: 5 - fullStars - (hasHalfStar ? 1 : 0) },
          (_, i) => (
            <span key={i} className="star">
              ★
            </span>
          )
        )}
      </>
    );
  };

  return (
    <div className="course-detail-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Trở về trang chủ
      </button>

      <div className="course-header">
        <h1 className="course-title">{course.title}</h1>
        <div className="course-meta">
          <div className="meta-item">
            <span className="rating-stars">{renderStars(course.rating)}</span>(
            {course.rating?.toFixed(1)})
          </div>
          <div className="meta-item">👥 {course.students} học viên</div>
          <div className="meta-item">
            ⏳ {course.details?.duration || course.duration}
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Giới thiệu khóa học</h2>
        <p>{course.details?.content}</p>
      </div>

      <div className="section">
        <h2>Đề cương khóa học</h2>
        <ul className="syllabus-list">
          {course.details?.syllabus?.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Video hướng dẫn</h2>
        <div className="video-grid">
          {course.details?.video?.map((url, idx) => {
            const embedUrl = getYouTubeEmbedUrl(url);
            return embedUrl ? (
              <div className="video-container" key={idx}>
                <iframe
                  src={embedUrl}
                  title={`Video hướng dẫn ${idx + 1}`}
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <a key={idx} href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            );
          })}
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Tổng quan
        </button>
        <button
          className={`tab-button ${activeTab === "content" ? "active" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          Nội dung
        </button>
        <button
          className={`tab-button ${activeTab === "instructor" ? "active" : ""}`}
          onClick={() => setActiveTab("instructor")}
        >
          Giảng viên
        </button>
        <button
          className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Đánh giá
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="section">
            <div className="overview-description">{course.description}</div>
            <div className="learning-outcomes">
              <h3>Bạn sẽ học được:</h3>
              {course.learningOutcomes?.map((item, i) => (
                <div className="outcome-item" key={i}>
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="section">
            {course.curriculum?.map((chapter, i) => (
              <div className="curriculum-chapter" key={i}>
                <h3 className="chapter-title">
                  Chương {i + 1}: {chapter.title}
                </h3>
                {chapter.lessons?.map((lesson, j) => (
                  <div className="lesson-item" key={j}>
                    {lesson.title}{" "}
                    <span className="lesson-duration">({lesson.duration})</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "instructor" && course.instructor && (
          <div className="section instructor-section">
            <img
              src={course.instructor.avatar || "/default-avatar.jpg"}
              alt={course.instructor.name}
              className="instructor-avatar"
            />
            <div>
              <h2>{course.instructor.name}</h2>
              <div className="instructor-title">{course.instructor.title}</div>
              <p className="instructor-bio">{course.instructor.bio}</p>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="section">
            {course.reviews?.length > 0 ? (
              course.reviews.map((review, i) => (
                <div className="review-item" key={i}>
                  <div className="review-user">{review.user}</div>
                  <div className="review-rating">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className={`star ${
                          index < review.rating ? "filled" : ""
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="review-comment">{review.comment}</div>
                </div>
              ))
            ) : (
              <div className="no-reviews">Chưa có đánh giá nào.</div>
            )}
            <RatingForm courseId={course._id} onSubmitted={fetchCourse} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;