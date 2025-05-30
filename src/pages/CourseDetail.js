import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RatingForm from "../components/RatingForm";
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

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return <div>Không tìm thấy khóa học.</div>;

  // Hàm lấy URL nhúng YouTube từ URL thông thường
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
    const match = url.match(regExp);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  // Hàm hiển thị sao đánh giá
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

  // Hàm hiển thị nội dung bài học theo từng bước
  const renderLessonContent = (content) => {
    if (!content) return null;
    
    // Tách nội dung thành các phần dựa trên các marker
    const steps = content.split(/\n(?=Bước \d+:|👉|💡|📝|```)/);
    
    return steps.map((step, index) => {
      const isStep = step.startsWith("Bước");
      const isTip = step.startsWith("👉");
      const isImportant = step.startsWith("💡");
      const isNote = step.startsWith("📝");
      const isCode = step.startsWith("```");
      
      // Xử lý code block
      if (isCode) {
        const codeContent = step.replace(/```/g, "").trim();
        return (
          <div key={index} className="code-step">
            <pre>
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }
      
      return (
        <div 
          key={index}
          className={`step ${isStep ? "step-item" : ""} ${isTip ? "tip-step" : ""} ${isImportant ? "important-step" : ""} ${isNote ? "note-step" : ""}`}
        >
          {step}
        </div>
      );
    });
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

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "content" ? "active" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          Nội dung
        </button>
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Tổng quan
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
        {/* Tab Nội dung: tách chương - bài học - video trong bài học */}
        {activeTab === "content" && (
          <div className="section">
            {course.details?.chapters?.map((chapter, idxChapter) => (
              <div className="chapter-block" key={idxChapter}>
                <h3>
                  Chương {idxChapter + 1}: {chapter.title}
                </h3>
                <p>{chapter.description}</p>

                <div className="lessons-list">
                  {chapter.lessons?.map((lesson, idxLesson) => {
                    const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);
                    return (
                      <div className="lesson-item" key={idxLesson}>
                        <h4>{lesson.title}</h4>
                        
                        {/* Hiển thị nội dung bài học theo từng bước */}
                        {lesson.content && (
                          <div className="lesson-steps">
                            {renderLessonContent(lesson.content)}
                          </div>
                        )}

                        {/* Video chỉ hiện trong bài học có videoUrl */}
                        {lesson.videoUrl && (
                          <div className="lesson-video">
                            {embedUrl ? (
                              <iframe
                                width="560"
                                height="315"
                                src={embedUrl}
                                title={`Video bài học: ${lesson.title}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <a
                                href={lesson.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Xem video
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Tổng quan */}
        {activeTab === "overview" && (
          <div className="section">
            <h2>Giới thiệu khóa học</h2>
            <p>{course.description || course.details?.content}</p>

            {course.details?.syllabus && (
              <>
                <h3>Đề cương khóa học</h3>
                <ul>
                  {course.details.syllabus.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="course-meta">
              <div>Loại khóa học: {course.details?.type || "N/A"}</div>
              <div>Thời lượng: {course.details?.duration || course.duration}</div>
            </div>
          </div>
        )}

        {/* Tab Giảng viên */}
        {activeTab === "instructor" && course.instructor && (
          <div className="section instructor-section">
            <img
              src={course.instructor.avatar || "/default-avatar.jpg"}
              alt={course.instructor.name}
              className="instructor-avatar"
            />
            <div>
              <h2>{course.instructor.name}</h2>
              <p>{course.instructor.bio}</p>
            </div>
          </div>
        )}

        {/* Tab Đánh giá */}
        {activeTab === "reviews" && (
          <div className="section reviews-section">
            {course.reviews?.length > 0 ? (
              course.reviews.map((review, idx) => (
                <div className="review-item" key={idx}>
                  <div className="review-author">{review.userName}</div>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                  <div className="review-comment">{review.comment}</div>
                </div>
              ))
            ) : (
              <p>Chưa có đánh giá nào.</p>
            )}

            <RatingForm courseId={id} onReviewSubmitted={fetchCourse} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;