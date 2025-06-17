import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import "./AddCourse.css"; // Sử dụng cùng file CSS với AddCourse

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    level: "",
    duration: "",
    imageUrl: "",
    details: {
      type: "",
      chapters: [],
      quiz: [],
    },
  });

  const [previewImage, setPreviewImage] = useState("");
  const [expandedChapters, setExpandedChapters] = useState([]);
  const [expandedQuiz, setExpandedQuiz] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const courseData = res.data;
        setCourse({
          title: courseData.title || "",
          description: courseData.description || "",
          price: courseData.price || 0,
          category: courseData.category || "",
          level: courseData.level || "",
          duration: courseData.duration || "",
          imageUrl: courseData.imageUrl || "",
          details: {
            type: courseData.details?.type || "",
            chapters: courseData.details?.chapters || [],
            quiz: courseData.details?.quiz || [],
          },
        });

        setPreviewImage(courseData.imageUrl || "");
        setExpandedChapters(
          Array(courseData.details?.chapters?.length || 0).fill(false)
        );
        setExpandedQuiz(
          Array(courseData.details?.quiz?.length || 0).fill(false)
        );

        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        } else {
          setError(err.response?.data?.message || "Không thể tải khóa học");
        }
      }
    };

    if (token) fetchCourse();
    else setError("Bạn cần đăng nhập");
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("details.")) {
      const field = name.split(".")[1];
      setCourse((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          [field]: value,
        },
      }));
    } else {
      setCourse((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setCourse((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý chương trình học
  const addChapter = () => {
    setCourse((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        chapters: [
          ...prev.details.chapters,
          {
            title: "",
            description: "",
            lessons: [{ title: "", content: "", videoUrl: "" }],
          },
        ],
      },
    }));
    setExpandedChapters((prev) => [...prev, true]);
  };

  const removeChapter = (chapterIndex) => {
    setCourse((prev) => {
      const newChapters = [...prev.details.chapters];
      newChapters.splice(chapterIndex, 1);

      return {
        ...prev,
        details: {
          ...prev.details,
          chapters: newChapters,
        },
      };
    });

    setExpandedChapters((prev) => {
      const newExpanded = [...prev];
      newExpanded.splice(chapterIndex, 1);
      return newExpanded;
    });
  };

  const handleChapterChange = (chapterIndex, field, value) => {
    setCourse((prev) => {
      const newChapters = [...prev.details.chapters];
      newChapters[chapterIndex] = {
        ...newChapters[chapterIndex],
        [field]: value,
      };

      return {
        ...prev,
        details: {
          ...prev.details,
          chapters: newChapters,
        },
      };
    });
  };

  const addLesson = (chapterIndex) => {
    setCourse((prev) => {
      const newChapters = [...prev.details.chapters];
      newChapters[chapterIndex] = {
        ...newChapters[chapterIndex],
        lessons: [
          ...newChapters[chapterIndex].lessons,
          { title: "", content: "", videoUrl: "" },
        ],
      };

      return {
        ...prev,
        details: {
          ...prev.details,
          chapters: newChapters,
        },
      };
    });
  };

  const removeLesson = (chapterIndex, lessonIndex) => {
    setCourse((prev) => {
      const newChapters = [...prev.details.chapters];
      const newLessons = [...newChapters[chapterIndex].lessons];
      newLessons.splice(lessonIndex, 1);

      newChapters[chapterIndex] = {
        ...newChapters[chapterIndex],
        lessons: newLessons,
      };

      return {
        ...prev,
        details: {
          ...prev.details,
          chapters: newChapters,
        },
      };
    });
  };

  const handleLessonChange = (chapterIndex, lessonIndex, field, value) => {
    setCourse((prev) => {
      const newChapters = [...prev.details.chapters];
      const newLessons = [...newChapters[chapterIndex].lessons];

      newLessons[lessonIndex] = {
        ...newLessons[lessonIndex],
        [field]: value,
      };

      newChapters[chapterIndex] = {
        ...newChapters[chapterIndex],
        lessons: newLessons,
      };

      return {
        ...prev,
        details: {
          ...prev.details,
          chapters: newChapters,
        },
      };
    });
  };

  const onChapterDragEnd = (result) => {
    if (!result.destination) return;

    const newChapters = [...course.details.chapters];
    const [movedChapter] = newChapters.splice(result.source.index, 1);
    newChapters.splice(result.destination.index, 0, movedChapter);

    setCourse((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        chapters: newChapters,
      },
    }));

    const newExpanded = [...expandedChapters];
    const [movedExpanded] = newExpanded.splice(result.source.index, 1);
    newExpanded.splice(result.destination.index, 0, movedExpanded);
    setExpandedChapters(newExpanded);
  };

  // Xử lý Quiz
  const addQuizQuestion = () => {
    setCourse((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        quiz: [
          ...(prev.details.quiz || []),
          {
            question: "",
            options: ["", ""],
            correctAnswerIndex: 0,
          },
        ],
      },
    }));
    setExpandedQuiz((prev) => [...prev, true]);
  };

  const removeQuizQuestion = (questionIndex) => {
    setCourse((prev) => {
      const newQuiz = [...(prev.details?.quiz || [])];
      newQuiz.splice(questionIndex, 1);
      return {
        ...prev,
        details: {
          ...prev.details,
          quiz: newQuiz,
        },
      };
    });

    setExpandedQuiz((prev) => {
      const newExpanded = [...prev];
      newExpanded.splice(questionIndex, 1);
      return newExpanded;
    });
  };

  const handleQuizQuestionChange = (questionIndex, value) => {
    setCourse((prev) => {
      const newQuiz = [...(prev.details?.quiz || [])];
      newQuiz[questionIndex] = {
        ...newQuiz[questionIndex],
        question: value,
      };
      return {
        ...prev,
        details: {
          ...prev.details,
          quiz: newQuiz,
        },
      };
    });
  };

  const addQuizOption = (questionIndex) => {
    setCourse((prev) => {
      const newQuiz = [...(prev.details?.quiz || [])];
      newQuiz[questionIndex] = {
        ...newQuiz[questionIndex],
        options: [...newQuiz[questionIndex].options, ""],
      };
      return {
        ...prev,
        details: {
          ...prev.details,
          quiz: newQuiz,
        },
      };
    });
  };

  const removeQuizOption = (questionIndex, optionIndex) => {
    setCourse((prev) => {
      const newQuiz = [...(prev.details?.quiz || [])];
      const newOptions = [...newQuiz[questionIndex].options];
      newOptions.splice(optionIndex, 1);

      let correctIndex = newQuiz[questionIndex].correctAnswerIndex;
      if (optionIndex === correctIndex) correctIndex = 0;
      else if (optionIndex < correctIndex) correctIndex--;

      newQuiz[questionIndex] = {
        ...newQuiz[questionIndex],
        options: newOptions,
        correctAnswerIndex: correctIndex,
      };

      return {
        ...prev,
        details: {
          ...prev.details,
          quiz: newQuiz,
        },
      };
    });
  };

  const handleQuizOptionChange = (questionIndex, optionIndex, value) => {
    setCourse((prev) => {
      const newQuiz = [...(prev.details?.quiz || [])];
      const newOptions = [...newQuiz[questionIndex].options];
      newOptions[optionIndex] = value;

      newQuiz[questionIndex] = {
        ...newQuiz[questionIndex],
        options: newOptions,
      };

      return {
        ...prev,
        details: {
          ...prev.details,
          quiz: newQuiz,
        },
      };
    });
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    setCourse((prev) => {
      const newQuiz = [...(prev.details?.quiz || [])];
      newQuiz[questionIndex] = {
        ...newQuiz[questionIndex],
        correctAnswerIndex: optionIndex,
      };
      return {
        ...prev,
        details: {
          ...prev.details,
          quiz: newQuiz,
        },
      };
    });
  };

  const toggleQuizQuestion = (index) => {
    setExpandedQuiz((prev) => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  // Gửi dữ liệu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData = {
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        level: course.level,
        duration: course.duration,
        imageUrl: course.imageUrl,
        details: course.details,
      };

      await axios.put(`http://localhost:5000/api/courses/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccess("Cập nhật khóa học thành công!");
      setTimeout(() => navigate("/instructor/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <p className="error-message">Bạn chưa đăng nhập</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!course.title) return <p>Đang tải khóa học...</p>;

  return (
    <div className="add-course-container">
      <div className="add-course-header">
        <h2>Chỉnh Sửa Khóa Học</h2>
        <p>Cập nhật thông tin cho khóa học của bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="add-course-form">
        {/* Phần Thông Tin Cơ Bản */}
        <div className="form-section">
          <h3>Thông Tin Cơ Bản</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Tiêu Đề Khóa Học <span className="required">*</span>
              </label>
              <input
                name="title"
                placeholder="Nhập tiêu đề khóa học"
                value={course.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Danh Mục <span className="required">*</span>
              </label>
              <input
                name="category"
                placeholder="Ví dụ: Lập trình, Thiết kế"
                value={course.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Cấp Độ <span className="required">*</span>
              </label>
              <select
                name="level"
                value={course.level}
                onChange={handleChange}
                required
              >
                <option value="">Chọn cấp độ</option>
                <option value="Cơ bản">Mới Bắt Đầu</option>
                <option value="Trung cấp">Trung Cấp</option>
                <option value="Nâng cao">Nâng Cao</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Giá (VND) <span className="required">*</span>
              </label>
              <input
                name="price"
                placeholder="Nhập giá khóa học"
                type="number"
                value={course.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Thời Lượng <span className="required">*</span>
              </label>
              <input
                name="duration"
                placeholder="Ví dụ: 8 tuần, 30 giờ"
                type="text"
                value={course.duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Loại Khóa Học <span className="required">*</span>
              </label>
              <select
                name="details.type"
                value={course.details.type}
                onChange={handleChange}
                required
              >
                <option value="">Chọn loại khóa học</option>
                <option value="Video">Video</option>
                <option value="Text">Văn Bản</option>
                <option value="Combo">Kết Hợp</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              Mô Tả Khóa Học <span className="required">*</span>
            </label>
            <textarea
              name="description"
              placeholder="Mô tả chi tiết về khóa học..."
              value={course.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>
        </div>

        {/* Phần Hình Ảnh Khóa Học */}
        <div className="form-section">
          <h3>Hình Ảnh Khóa Học</h3>
          <div className="image-upload-container">
            <div className="upload-area">
              <label htmlFor="image" className="upload-label">
                <div className="upload-icon">📁</div>
                <p>
                  Kéo và thả hình ảnh vào đây hoặc{" "}
                  <span className="browse-text">Chọn tệp</span>
                </p>
                <p className="file-types">
                  (Hỗ trợ: JPG, PNG, GIF - Tối đa 5MB)
                </p>
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden-input"
              />
            </div>
            {previewImage && (
              <div className="preview-container">
                <p className="preview-label">Xem trước:</p>
                <img
                  src={previewImage}
                  alt="Xem trước khóa học"
                  className="preview-image"
                />
              </div>
            )}
          </div>
        </div>

        {/* Phần Nội Dung Khóa Học */}
        <div className="form-section">
          <div className="section-header">
            <h3>Nội Dung Khóa Học</h3>
            <button
              type="button"
              className="add-chapter-btn"
              onClick={addChapter}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Thêm Chương
            </button>
          </div>

          {course.details.chapters.length === 0 ? (
            <div className="empty-chapters">
              <div className="empty-chapters-icon">📚</div>
              <p className="empty-chapters-text">Chưa có chương nào</p>
              <p className="empty-chapters-hint">
                Nhấn "Thêm Chương" để bắt đầu xây dựng nội dung khóa học
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onChapterDragEnd}>
              <Droppable droppableId="chapters-droppable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {course.details.chapters.map((chapter, cIdx) => (
                      <Draggable
                        key={`chapter-${cIdx}`}
                        draggableId={`chapter-${cIdx}`}
                        index={cIdx}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`chapter-card draggable-chapter ${
                              snapshot.isDragging ? "dragging" : ""
                            }`}
                          >
                            <div
                              className={`chapter-header ${
                                expandedChapters[cIdx] ? "expanded" : ""
                              }`}
                              onClick={() => {
                                const newExpanded = [...expandedChapters];
                                newExpanded[cIdx] = !newExpanded[cIdx];
                                setExpandedChapters(newExpanded);
                              }}
                            >
                              <div className="chapter-title-container" {...provided.dragHandleProps}>
                                <div className="chapter-toggle">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                  >
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                  </svg>
                                </div>
                                <div className="chapter-number">{cIdx + 1}</div>
                                <div className={`chapter-name ${!chapter.title ? "empty" : ""}`}>
                                  {chapter.title || "Chương chưa có tiêu đề"}
                                </div>
                              </div>
                              <div className="chapter-actions">
                                <button
                                  type="button"
                                  className="chapter-toggle"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newExpanded = [...expandedChapters];
                                    newExpanded[cIdx] = !newExpanded[cIdx];
                                    setExpandedChapters(newExpanded);
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M6 9l6 6 6-6" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div
                              className={`chapter-content ${
                                expandedChapters[cIdx] ? "expanded" : ""
                              }`}
                            >
                              <div className="form-group">
                                <label>
                                  Tiêu Đề Chương <span className="required">*</span>
                                </label>
                                <input
                                  placeholder="Nhập tiêu đề chương"
                                  value={chapter.title}
                                  onChange={(e) =>
                                    handleChapterChange(cIdx, "title", e.target.value)
                                  }
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label>Mô Tả Chương</label>
                                <textarea
                                  placeholder="Mô tả nội dung chương này..."
                                  value={chapter.description}
                                  onChange={(e) =>
                                    handleChapterChange(cIdx, "description", e.target.value)
                                  }
                                  rows={3}
                                />
                              </div>

                              <div className="lesson-list">
                                {chapter.lessons.map((lesson, lIdx) => (
                                  <div key={lIdx} className="lesson-item">
                                    <div className="lesson-header">
                                      <div className="lesson-number">Bài {lIdx + 1}</div>
                                      <div className="lesson-actions">
                                        <button
                                          type="button"
                                          className="add-lesson-btn"
                                          onClick={() => addLesson(cIdx)}
                                        >
                                          Thêm Bài Học
                                        </button>
                                        <button
                                          type="button"
                                          className="remove-btn"
                                          onClick={() => removeLesson(cIdx, lIdx)}
                                          disabled={chapter.lessons.length <= 1}
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                    </div>

                                    <div className="form-group">
                                      <label>
                                        Tiêu Đề Bài Học <span className="required">*</span>
                                      </label>
                                      <input
                                        placeholder="Nhập tiêu đề bài học"
                                        value={lesson.title}
                                        onChange={(e) =>
                                          handleLessonChange(
                                            cIdx,
                                            lIdx,
                                            "title",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>Nội Dung</label>
                                      <textarea
                                        placeholder="Nội dung chi tiết bài học..."
                                        value={lesson.content}
                                        onChange={(e) =>
                                          handleLessonChange(
                                            cIdx,
                                            lIdx,
                                            "content",
                                            e.target.value
                                          )
                                        }
                                        rows={3}
                                      />
                                    </div>

                                    <div className="form-group">
                                      <label>URL Video</label>
                                      <input
                                        placeholder="URL video (nếu có)"
                                        value={lesson.videoUrl}
                                        onChange={(e) =>
                                          handleLessonChange(
                                            cIdx,
                                            lIdx,
                                            "videoUrl",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="chapter-footer">
                                <button
                                  type="button"
                                  className="remove-btn"
                                  onClick={() => removeChapter(cIdx)}
                                  disabled={course.details.chapters.length <= 1}
                                >
                                  Xóa Chương Này
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Phần Câu Hỏi Trắc Nghiệm */}
        <div className="form-section quiz-section">
          <div className="section-header">
            <h3>Câu Hỏi Trắc Nghiệm</h3>
            <button
              type="button"
              className="add-chapter-btn"
              onClick={addQuizQuestion}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Thêm Câu Hỏi
            </button>
          </div>

          {course.details.quiz.length === 0 ? (
            <div className="quiz-placeholder">
              <div className="quiz-icon">?</div>
              <p>Chưa có câu hỏi nào</p>
              <p className="note">
                Nhấn "Thêm Câu Hỏi" để tạo bài trắc nghiệm cho khóa học
              </p>
            </div>
          ) : (
            <div className="quiz-container">
              {course.details.quiz.map((question, qIdx) => (
                <div
                  key={qIdx}
                  className={`quiz-item ${
                    expandedQuiz[qIdx] ? "expanded" : ""
                  }`}
                >
                  <div
                    className="quiz-header"
                    onClick={() => toggleQuizQuestion(qIdx)}
                  >
                    <div className="quiz-title">
                      <span className="quiz-number">Câu {qIdx + 1}:</span>
                      <span className="quiz-preview">
                        {question.question || "Câu hỏi mới"}
                      </span>
                    </div>
                    <div className="quiz-actions">
                      <button
                        type="button"
                        className="quiz-toggle-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleQuizQuestion(qIdx);
                        }}
                      >
                        {expandedQuiz[qIdx] ? "Thu gọn" : "Mở rộng"}
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

                  {expandedQuiz[qIdx] && (
                    <div className="quiz-content">
                      <div className="form-group">
                        <label>
                          Câu Hỏi <span className="required">*</span>
                        </label>
                        <textarea
                          placeholder="Nhập câu hỏi..."
                          value={question.question}
                          onChange={(e) =>
                            handleQuizQuestionChange(qIdx, e.target.value)
                          }
                          required
                          rows={3}
                          className="quiz-question-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Lựa Chọn <span className="required">*</span>
                          <span className="note">
                            {" "}
                            (Chọn đáp án đúng bằng nút radio)
                          </span>
                        </label>

                        <div className="quiz-options-container">
                          {question.options.map((option, optIdx) => (
                            <div key={optIdx} className="quiz-option">
                              <div className="option-input-group">
                                <label className="option-radio">
                                  <input
                                    type="radio"
                                    name={`correct-answer-${qIdx}`}
                                    checked={
                                      question.correctAnswerIndex === optIdx
                                    }
                                    onChange={() =>
                                      handleCorrectAnswerChange(qIdx, optIdx)
                                    }
                                  />
                                  <span className="radio-custom"></span>
                                </label>
                                <input
                                  className="option-input"
                                  placeholder={`Lựa chọn ${optIdx + 1}`}
                                  value={option}
                                  onChange={(e) =>
                                    handleQuizOptionChange(
                                      qIdx,
                                      optIdx,
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                                {question.options.length > 2 && (
                                  <button
                                    type="button"
                                    className="remove-option-btn"
                                    onClick={() =>
                                      removeQuizOption(qIdx, optIdx)
                                    }
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            className="add-option-btn"
                            onClick={() => addQuizOption(qIdx)}
                          >
                            + Thêm Lựa Chọn
                          </button>
                        </div>
                      </div>

                      <div className="correct-answer-hint">
                        <span className="correct-icon">✓</span>
                        <span>
                          Đáp án đúng:{" "}
                          {question.options[question.correctAnswerIndex] ||
                            "Chưa chọn"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Các Nút Hành Động */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Hủy
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Đang xử lý...
              </>
            ) : (
              "Lưu Thay Đổi"
            )}
          </button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default EditCourse;