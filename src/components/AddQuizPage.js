// ... (phần import như bạn đã có)
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddCourse.css"; // sử dụng lại CSS cũ

const AddQuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);
        setQuiz(res.data.details?.quiz || []);
        setExpanded(Array(res.data.details?.quiz?.length || 0).fill(true));
      } catch (err) {
        setError("Không thể tải khóa học");
      }
    };

    fetchCourse();
  }, [id, token]);

  const addQuizQuestion = () => {
    setQuiz((prev) => [
      ...prev,
      { question: "", options: ["", ""], correctAnswerIndex: 0 },
    ]);
    setExpanded((prev) => [...prev, true]);
  };

  const removeQuizQuestion = (index) => {
    const newQuiz = [...quiz];
    newQuiz.splice(index, 1);
    setQuiz(newQuiz);
    const newExpanded = [...expanded];
    newExpanded.splice(index, 1);
    setExpanded(newExpanded);
  };

  const handleQuestionChange = (i, value) => {
    const newQuiz = [...quiz];
    newQuiz[i].question = value;
    setQuiz(newQuiz);
  };

  const handleOptionChange = (qi, oi, value) => {
    const newQuiz = [...quiz];
    newQuiz[qi].options[oi] = value;
    setQuiz(newQuiz);
  };

  const handleCorrectAnswer = (qi, oi) => {
    const newQuiz = [...quiz];
    newQuiz[qi].correctAnswerIndex = oi;
    setQuiz(newQuiz);
  };

  const addOption = (qi) => {
    const newQuiz = [...quiz];
    newQuiz[qi].options.push("");
    setQuiz(newQuiz);
  };

  const removeOption = (qi, oi) => {
    const newQuiz = [...quiz];
    newQuiz[qi].options.splice(oi, 1);
    if (newQuiz[qi].correctAnswerIndex === oi) {
      newQuiz[qi].correctAnswerIndex = 0;
    }
    setQuiz(newQuiz);
  };

  const toggleExpanded = (idx) => {
    const newExpanded = [...expanded];
    newExpanded[idx] = !newExpanded[idx];
    setExpanded(newExpanded);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.put(
        `http://localhost:5000/api/courses/${id}`,
        {
          ...course,
          details: {
            ...course.details,
            quiz: quiz,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Thêm quiz thành công!");
      setTimeout(() => navigate("/instructor/dashboard"), 1500);
    } catch (err) {
      setError("Không thể lưu quiz");
    } finally {
      setLoading(false);
    }
  };

  if (!course) return <p>Đang tải...</p>;

  return (
    <div className="add-course-container">
      <h2>Thêm Quiz cho khóa học: {course.title}</h2>

      <div className="form-section quiz-section">
        <div className="section-header">
          <h3>Câu Hỏi Trắc Nghiệm</h3>
          <button
            type="button"
            className="add-chapter-btn"
            onClick={addQuizQuestion}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Thêm Câu Hỏi
          </button>
        </div>

        {quiz.length === 0 ? (
          <div className="quiz-placeholder">
            <div className="quiz-icon">?</div>
            <p>Chưa có câu hỏi nào</p>
            <p className="note">Nhấn "Thêm Câu Hỏi" để tạo bài trắc nghiệm cho khóa học</p>
          </div>
        ) : (
          <div className="quiz-container">
            {quiz.map((question, qIdx) => (
              <div key={qIdx} className={`quiz-item ${expanded[qIdx] ? "expanded" : ""}`}>
                <div className="quiz-header" onClick={() => toggleExpanded(qIdx)}>
                  <div className="quiz-title">
                    <span className="quiz-number">Câu {qIdx + 1}:</span>
                    <span className="quiz-preview">{question.question || "Câu hỏi mới"}</span>
                  </div>
                  <div className="quiz-actions">
                    <button
                      type="button"
                      className="quiz-toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(qIdx);
                      }}
                    >
                      {expanded[qIdx] ? "Thu gọn" : "Mở rộng"}
                    </button>
                    <button
                      type="button"
                      className="quiz-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuizQuestion(qIdx);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {expanded[qIdx] && (
                  <div className="quiz-content">
                    <div className="form-group">
                      <label>
                        Câu Hỏi <span className="required">*</span>
                      </label>
                      <textarea
                        placeholder="Nhập câu hỏi..."
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
                        required
                        rows={3}
                        className="quiz-question-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Lựa Chọn <span className="required">*</span>
                        <span className="note"> (Chọn đáp án đúng bằng nút radio)</span>
                      </label>

                      <div className="quiz-options-container">
                        {question.options.map((option, optIdx) => (
                          <div key={optIdx} className="quiz-option">
                            <div className="option-input-group">
                              <label className="option-radio">
                                <input
                                  type="radio"
                                  name={`correct-answer-${qIdx}`}
                                  checked={question.correctAnswerIndex === optIdx}
                                  onChange={() => handleCorrectAnswer(qIdx, optIdx)}
                                />
                                <span className="radio-custom"></span>
                              </label>
                              <input
                                className="option-input"
                                placeholder={`Lựa chọn ${optIdx + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                required
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  className="remove-option-btn"
                                  onClick={() => removeOption(qIdx, optIdx)}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        <button type="button" className="add-option-btn" onClick={() => addOption(qIdx)}>
                          + Thêm Lựa Chọn
                        </button>
                      </div>
                    </div>

                    <div className="correct-answer-hint">
                      <span className="correct-icon">✓</span>
                      <span>
                        Đáp án đúng: {question.options[question.correctAnswerIndex] || "Chưa chọn"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu Quiz"}
          </button>
          <button onClick={() => navigate(-1)}>Quay lại</button>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>
    </div>
  );
};

export default AddQuizPage;
