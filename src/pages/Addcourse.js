import React, { useState } from "react";
import axios from "axios";
import "./AddCourse.css";
import { useNavigate } from "react-router-dom";

const AddCourse = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: "",
    duration: "",
    instructor: "",
    imageUrl: "",
    details: {
      type: "",
      chapters: [
        {
          title: "",
          description: "",
          lessons: [
            {
              title: "",
              content: "",
              videoUrl: "",
            },
          ],
        },
      ],
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(
    formData.details.chapters.map(() => true)
  );
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("details.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleChapterChange = (index, field, value) => {
    const newChapters = [...formData.details.chapters];
    newChapters[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        chapters: newChapters,
      },
    }));
  };

  const handleLessonChange = (chapterIndex, lessonIndex, field, value) => {
    const newChapters = [...formData.details.chapters];
    newChapters[chapterIndex].lessons[lessonIndex][field] = value;
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        chapters: newChapters,
      },
    }));
  };

  const addChapter = () => {
    setFormData((prev) => ({
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
    setExpandedChapters([...expandedChapters, true]);
  };

  const addLesson = (chapterIndex) => {
    const newChapters = [...formData.details.chapters];
    newChapters[chapterIndex].lessons.push({
      title: "",
      content: "",
      videoUrl: "",
    });
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        chapters: newChapters,
      },
    }));
  };

  const removeChapter = (index) => {
    if (formData.details.chapters.length <= 1) {
      alert("Phải có ít nhất một chương");
      return;
    }
    const newChapters = [...formData.details.chapters];
    newChapters.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        chapters: newChapters,
      },
    }));
    
    const newExpanded = [...expandedChapters];
    newExpanded.splice(index, 1);
    setExpandedChapters(newExpanded);
  };

  const removeLesson = (chapterIndex, lessonIndex) => {
    const newChapters = [...formData.details.chapters];
    if (newChapters[chapterIndex].lessons.length <= 1) {
      alert("Phải có ít nhất một bài học");
      return;
    }
    newChapters[chapterIndex].lessons.splice(lessonIndex, 1);
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        chapters: newChapters,
      },
    }));
  };

  const toggleChapter = (index) => {
    const newExpanded = [...expandedChapters];
    newExpanded[index] = !newExpanded[index];
    setExpandedChapters(newExpanded);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append("image", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formDataImage, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({
        ...prev,
        imageUrl: res.data.imageUrl,
      }));
      setPreviewImage(URL.createObjectURL(file));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Tải ảnh lên thất bại.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const userId = user?.id;

    if (!userId || !token) {
      setError("Thiếu thông tin xác thực. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    const {
      title,
      description,
      category,
      level,
      price,
      duration,
      imageUrl,
      details,
    } = formData;

    if (
      !title || !description || !category || !level || !price ||
      !duration || !imageUrl || !details.type
    ) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setLoading(false);
      return;
    }

    // Validate chương và bài học
    for (let chapter of details.chapters) {
      if (!chapter.title || chapter.lessons.length === 0) {
        setError("Vui lòng điền đầy đủ thông tin cho mỗi chương và bài học.");
        setLoading(false);
        return;
      }
      for (let lesson of chapter.lessons) {
        if (!lesson.title) {
          setError("Mỗi bài học cần có tiêu đề.");
          setLoading(false);
          return;
        }
      }
    }

    try {
      const res = await axios.post("http://localhost:5000/api/courses", {
        title,
        description,
        category,
        level,
        price,
        duration,
        instructor: userId,
        imageUrl,
        details,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 201) {
        setSuccess("Thêm khóa học thành công!");
        setFormData({
          title: "",
          description: "",
          category: "",
          level: "",
          price: "",
          duration: "",
          instructor: "",
          imageUrl: "",
          details: {
            type: "",
            chapters: [{ title: "", description: "", lessons: [{ title: "", content: "", videoUrl: "" }] }],
          },
        });
        setPreviewImage(null);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError("Thêm khóa học thất bại.");
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi khi thêm khóa học.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-course-container">
      <div className="add-course-header">
        <h2>Thêm Khóa Học Mới</h2>
        <p>Điền đầy đủ thông tin để tạo khóa học mới</p>
      </div>
      
      <form onSubmit={handleSubmit} className="add-course-form">
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Tên khóa học <span className="required">*</span></label>
              <input 
                name="title" 
                placeholder="Nhập tên khóa học" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Danh mục <span className="required">*</span></label>
              <input 
                name="category" 
                placeholder="Ví dụ: Lập trình, Thiết kế" 
                value={formData.category} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Cấp độ <span className="required">*</span></label>
              <select 
                name="level" 
                value={formData.level} 
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
              <label>Giá (VND) <span className="required">*</span></label>
              <input 
                name="price" 
                placeholder="Nhập giá khóa học" 
                type="number" 
                value={formData.price} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Thời lượng <span className="required">*</span></label>
              <input 
                name="duration" 
                placeholder="Ví dụ: 10 giờ" 
                type="text" 
                value={formData.duration} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Loại khóa học <span className="required">*</span></label>
              <select 
                name="details.type" 
                value={formData.details.type} 
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
            <label>Mô tả khóa học <span className="required">*</span></label>
            <textarea 
              name="description" 
              placeholder="Mô tả chi tiết về khóa học..." 
              value={formData.description} 
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
                <p> <span className="browse-text">Chọn từ máy tính</span></p>
                <p className="file-types">(Hỗ trợ: JPG, PNG, GIF - Tối đa 5MB)</p>
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
                required
                className="hidden-input"
              />
            </div>
            {previewImage && (
              <div className="preview-container">
                <p className="preview-label">Xem trước:</p>
                <img src={previewImage} alt="Preview" className="preview-image" />
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
              onClick={addChapter}
            >
              + Thêm chương
            </button>
          </div>
          
          {formData.details.chapters.map((chapter, cIdx) => (
            <div key={cIdx} className="syllabus-item">
              <div 
                className={`syllabus-item-header ${expandedChapters[cIdx] ? 'expanded' : ''}`} 
                onClick={() => toggleChapter(cIdx)}
              >
                <div className="chapter-title">
                  <span className="chapter-number">Chương {cIdx + 1}:</span>
                  <span>{chapter.title || `Chương chưa có tiêu đề`}</span>
                </div>
                <span className="arrow">▼</span>
              </div>
              <div 
                className={`syllabus-item-content ${expandedChapters[cIdx] ? 'expanded' : ''}`}
              >
                <div className="form-group">
                  <label>Tên chương <span className="required">*</span></label>
                  <input
                    placeholder="Nhập tên chương"
                    value={chapter.title}
                    onChange={(e) => handleChapterChange(cIdx, "title", e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Mô tả chương</label>
                  <textarea
                    placeholder="Mô tả nội dung chương học..."
                    value={chapter.description}
                    onChange={(e) => handleChapterChange(cIdx, "description", e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="lessons-header">
                  <h4>Bài học</h4>
                  <button 
                    type="button" 
                    className="add-lesson-btn"
                    onClick={() => addLesson(cIdx)}
                  >
                    + Thêm bài học
                  </button>
                </div>
                
                {chapter.lessons.map((lesson, lIdx) => (
                  <div key={lIdx} className="lesson-block">
                    <div className="lesson-header">
                      <div className="lesson-number">Bài {lIdx + 1}</div>
                      <button 
                        type="button" 
                        className="remove-btn"
                        onClick={() => removeLesson(cIdx, lIdx)}
                        disabled={chapter.lessons.length <= 1}
                      >
                        Xóa
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label>Tên bài học <span className="required">*</span></label>
                      <input
                        placeholder="Nhập tên bài học"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(cIdx, lIdx, "title", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Nội dung</label>
                      <textarea
                        placeholder="Nội dung chi tiết bài học..."
                        value={lesson.content}
                        onChange={(e) => handleLessonChange(cIdx, lIdx, "content", e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Video URL</label>
                      <input
                        placeholder="Đường dẫn video (nếu có)"
                        value={lesson.videoUrl}
                        onChange={(e) => handleLessonChange(cIdx, lIdx, "videoUrl", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="chapter-footer">
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => removeChapter(cIdx)}
                    disabled={formData.details.chapters.length <= 1}
                  >
                    Xóa chương này
                  </button>
                </div>
              </div>
            </div>
          ))}
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
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Đang xử lý...
              </>
            ) : (
              "Tạo Khóa Học"
            )}
          </button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default AddCourse;