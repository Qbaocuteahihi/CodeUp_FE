import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Chuẩn hóa dữ liệu để đảm bảo cấu trúc phù hợp
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

    // Xử lý nested fields trong details
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

  // =============== Xử lý chương trình học ===============
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

    // Cập nhật trạng thái mở rộng sau khi kéo thả
    const newExpanded = [...expandedChapters];
    const [movedExpanded] = newExpanded.splice(result.source.index, 1);
    newExpanded.splice(result.destination.index, 0, movedExpanded);
    setExpandedChapters(newExpanded);
  };

  // =============== Xử lý Quiz ===============
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

  // =============== Gửi dữ liệu ===============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu để gửi
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
      console.log("Data gửi đi:", updateData);
      await axios.put(`http://localhost:5000/api/courses/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Cập nhật thành công!");
      navigate("/instructor/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
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
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Tên khóa học <span className="required">*</span>
              </label>
              <input
                name="title"
                placeholder="Nhập tên khóa học"
                value={course.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Danh mục <span className="required">*</span>
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
                Cấp độ <span className="required">*</span>
              </label>
              <select
                name="level"
                value={course.level}
                onChange={handleChange}
                required
              >
                <option value="">Chọn cấp độ</option>
                <option value="Cơ bản">Cơ bản</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Nâng cao">Nâng cao</option>
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
                Thời lượng <span className="required">*</span>
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
                Loại khóa học <span className="required">*</span>
              </label>
              <select
                name="details.type"
                value={course.details.type}
                onChange={handleChange}
                required
              >
                <option value="">Chọn loại khóa học</option>
                <option value="Video">Video</option>
                <option value="Text">Văn bản</option>
                <option value="Combo">Kết hợp</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              Mô tả khóa học <span className="required">*</span>
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

        <div className="form-section">
          <h3>Hình ảnh khóa học</h3>
          <div className="image-upload-container">
            <div className="upload-area">
              <label htmlFor="image" className="upload-label">
                <div className="upload-icon">📁</div>
                <p>
                  Kéo thả ảnh vào đây hoặc{" "}
                  <span className="browse-text">Chọn từ máy tính</span>
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
                  alt="Preview"
                  className="preview-image"
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Chương trình học</h3>
            <button
              type="button"
              className="add-chapter-btn"
              onClick={() => {
                addChapter();
              }}
            >
              + Thêm chương
            </button>
          </div>

          <DragDropContext onDragEnd={onChapterDragEnd}>
            <Droppable
              droppableId="chapters-droppable"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {course.details.chapters.map((chapter, cIdx) => (
                    <Draggable
                      key={`chapter-${cIdx}`}
                      draggableId={`chapter-${cIdx}`}
                      index={cIdx}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="syllabus-item"
                        >
                          <div
                            className={`syllabus-item-header ${
                              expandedChapters[cIdx] ? "expanded" : ""
                            }`}
                            onClick={() => {
                              const newExpanded = [...expandedChapters];
                              newExpanded[cIdx] = !newExpanded[cIdx];
                              setExpandedChapters(newExpanded);
                            }}
                          >
                            <div className="chapter-title">
                              <span className="chapter-number">
                                Chương {cIdx + 1}:
                              </span>
                              <span>
                                {chapter.title || "Chương chưa có tiêu đề"}
                              </span>
                            </div>
                            <span className="arrow">▼</span>
                          </div>
                          <div
                            className={`syllabus-item-content ${
                              expandedChapters[cIdx] ? "expanded" : ""
                            }`}
                          >
                            <div className="form-group">
                              <label>
                                Tên chương <span className="required">*</span>
                              </label>
                              <input
                                placeholder="Nhập tên chương"
                                value={chapter.title}
                                onChange={(e) =>
                                  handleChapterChange(
                                    cIdx,
                                    "title",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label>Mô tả chương</label>
                              <textarea
                                placeholder="Mô tả nội dung chương học..."
                                value={chapter.description}
                                onChange={(e) =>
                                  handleChapterChange(
                                    cIdx,
                                    "description",
                                    e.target.value
                                  )
                                }
                                rows={3}
                              />
                            </div>

                            {chapter.lessons.map((lesson, lIdx) => (
                              <div key={lIdx} className="lesson-block">
                                <div className="lesson-header">
                                  <div className="lesson-number">
                                    Bài {lIdx + 1}
                                  </div>
                                  <div className="lesson-actions">
                                    <button
                                      type="button"
                                      className="add-lesson-btn"
                                      onClick={() => addLesson(cIdx)}
                                    >
                                      + Thêm bài học
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
                                    Tên bài học{" "}
                                    <span className="required">*</span>
                                  </label>
                                  <input
                                    placeholder="Nhập tên bài học"
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
                                  <label>Nội dung</label>
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
                                  <label>Video URL</label>
                                  <input
                                    placeholder="Đường dẫn video (nếu có)"
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

                            <div className="chapter-footer">
                              <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeChapter(cIdx)}
                                disabled={course.details.chapters.length <= 1}
                              >
                                Xóa chương này
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
        </div>

        {/* Phần Quiz */}
        <div className="form-section quiz-section">
          <div className="section-header">
            <h3>Quiz (Câu hỏi trắc nghiệm)</h3>
            <button
              type="button"
              className="add-chapter-btn"
              onClick={addQuizQuestion}
            >
              + Thêm câu hỏi
            </button>
          </div>

          {(course.details?.quiz?.length || 0) === 0 ? (
            <div className="quiz-placeholder">
              <div className="quiz-icon">?</div>
              <p>Chưa có câu hỏi nào</p>
              <p className="note">
                Nhấn nút "Thêm câu hỏi" để bắt đầu tạo quiz cho khóa học
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
                      <span className="quiz-number">Câu hỏi {qIdx + 1}:</span>
                      <span className="quiz-preview">
                        {question.question || "Câu hỏi chưa có nội dung"}
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
                        {expandedQuiz[qIdx] ? "Ẩn" : "Mở"}
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
                          Nội dung câu hỏi <span className="required">*</span>
                        </label>
                        <textarea
                          placeholder="Nhập nội dung câu hỏi..."
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
                          Đáp án <span className="required">*</span>
                          <span className="note">
                            {" "}
                            (Chọn đáp án đúng bằng cách nhấn vào nút radio)
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
                                  placeholder={`Đáp án ${optIdx + 1}`}
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
                            + Thêm đáp án
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

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Hủy bỏ
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Đang lưu...
              </>
            ) : (
              "Lưu Thay Đổi"
            )}
          </button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default EditCourse;
