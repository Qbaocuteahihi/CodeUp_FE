import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RatingForm from "../components/RatingForm";
import QuizViewer from "../components/QuizViewer";
import "./CourseDetail.css";
const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await fetch(
          `http://localhost:5000/api/courses/${id}${
            user?.id ? `?userId=${user.id}` : ""
          }`
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Lỗi khi tải khóa học.");
        }

        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError(err.message || "Lỗi kết nối tới server.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return <div>Không tìm thấy khóa học.</div>;

  const getYouTubeEmbedUrl = (url) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const renderStars = (rating = 0) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return (
      <>
        {[...Array(full)].map((_, i) => (
          <span key={`f${i}`} className="star filled">
            ★
          </span>
        ))}
        {half && <span className="star half">★</span>}
        {[...Array(empty)].map((_, i) => (
          <span key={`e${i}`} className="star">
            ★
          </span>
        ))}
      </>
    );
  };

  const renderLessonContent = (content) => {
    if (!content) return null;
    const parts = content.split(/\n(?=Bước \d+:|👉|💡|📝|```)/);

    return parts.map((step, i) => {
      if (step.startsWith("```")) {
        return (
          <div key={i} className="code-step">
            <pre>
              <code>{step.replace(/```/g, "").trim()}</code>
            </pre>
          </div>
        );
      }

      const typeClass = step.startsWith("Bước")
        ? "step-item"
        : step.startsWith("👉")
        ? "tip-step"
        : step.startsWith("💡")
        ? "important-step"
        : step.startsWith("📝")
        ? "note-step"
        : "";

      return (
        <div key={i} className={`step ${typeClass}`}>
          {step}
        </div>
      );
    });
  };

  const renderChapters = () => (
    <div className="section">
      {course.details?.chapters?.map((chapter, ci) => (
        <div className="chapter-block" key={ci}>
          <h3>
            Chương {ci + 1}: {chapter.title}
          </h3>
          <p>{chapter.description}</p>
          {chapter.lessons?.map((lesson, li) => {
            const video = getYouTubeEmbedUrl(lesson.videoUrl);
            return (
              <div key={li} className="lesson-item">
                <h4>{lesson.title}</h4>
                {lesson.content && (
                  <div className="lesson-steps">
                    {renderLessonContent(lesson.content)}
                  </div>
                )}
                {lesson.videoUrl && (
                  <div className="lesson-video">
                    {video ? (
                      <iframe
                        width="560"
                        height="315"
                        src={video}
                        title={`Video bài học: ${lesson.title}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
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
      ))}
    </div>
  );

  const renderOverview = () => (
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
  );

  const renderReviews = () => (
    <div className="section reviews-section">
      {course.reviews?.length > 0 ? (
        course.reviews.map((review, i) => (
          <div key={i} className="review-item">
            <div className="review-author">{review.userName}</div>
            <div className="review-rating">{renderStars(review.rating)}</div>
            <div className="review-comment">{review.comment}</div>
          </div>
        ))
      ) : (
        <p>Chưa có đánh giá nào.</p>
      )}
      <RatingForm
        courseId={id}
        onReviewSubmitted={() => window.location.reload()}
      />
    </div>
  );

  return (
    <div className="course-detail-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Trở về
      </button>

      <div className="course-header">
        <h1>{course.title}</h1>
        <div className="course-meta">
          <div className="meta-item">
            {renderStars(course.rating)} ({course.rating?.toFixed(1)})
          </div>
          <div className="meta-item">👥 {course.students} học viên</div>
          <div className="meta-item">
            ⏳ {course.details?.duration || course.duration}
          </div>
        </div>
      </div>

      <div className="tabs">
        {["content", "overview", "quiz", "reviews"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {
              {
                content: "Nội dung",
                overview: "Tổng quan",
                quiz: "Quiz",
                reviews: "Đánh giá",
              }[tab]
            }
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "content" && renderChapters()}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "quiz" && (
          <QuizViewer courseId={id} quizData={course.details?.quiz} />
        )}

        {activeTab === "reviews" && renderReviews()}
      </div>
    </div>
  );
};

export default CourseDetail;