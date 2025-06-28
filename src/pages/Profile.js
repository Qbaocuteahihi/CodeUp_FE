import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    profilePicture: null,
    previewImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isMounted = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (user && isMounted.current) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        profilePicture: null,
        previewImage: user.profilePicture || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mounted trước mọi setState
    if (!isMounted.current) return;

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("bio", formData.bio);

      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }

      const response = await axios.put(
        `/api/users/${user.id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Chỉ cập nhật nếu component còn mounted
      if (isMounted.current) {
        onUpdate?.(response.data);
        setIsEditing(false);

        // Sử dụng setTimeout để tách biệt render cycles
        setTimeout(() => {
          if (isMounted.current) {
            navigate("/profile", { replace: true });
          }
        }, 0);
      }
    } catch (err) {
      if (isMounted.current) {
        if (err.response?.data?.errors) {
          const serverErrors = err.response.data.errors;
          let errorMsg = "Cập nhật thất bại: ";

          for (const field in serverErrors) {
            errorMsg += `${serverErrors[field].message} `;
          }

          setError(errorMsg);
        } else {
          setError("Cập nhật thất bại. Vui lòng thử lại.");
        }
        console.error(err);
      }
    } finally {
      if (isMounted.current) {
        // Sử dụng setTimeout để tránh xung đột render
        setTimeout(() => {
          if (isMounted.current) {
            setLoading(false);
          }
        }, 0);
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Thông tin Hồ Sơ</h2>
        {!isEditing ? (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </button>
        ) : (
          <button className="cancel-button" onClick={() => setIsEditing(false)}>
            Hủy
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="profilePicture">Ảnh đại diện:</label>
            <div className="image-upload">
              <img
                src={formData.previewImage || "/default-avatar.jpg"}
                alt="Preview"
                className="profile-picture"
              />
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label htmlFor="profilePicture" className="upload-label">
                Chọn ảnh
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Tên:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Tiểu sử:</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-view">
          <div className="profile-image-container">
            <img
              src={user.profilePicture || "/default-avatar.jpg"}
              alt={`${user.username}'s profile`}
              className="profile-picture"
            />
          </div>
          <div className="profile-info">
            <p>
              <strong>Tên:</strong> {user.username || "Chưa có tên."}
            </p>
            <p>
              <strong>Email:</strong> {user.email || "Chưa có email."}
            </p>
            <p>
              <strong>Vai trò:</strong> {user.role || "Chưa có vai trò."}
            </p>
            <p>
              <strong>Tiểu sử:</strong> {user.bio || "Chưa có thông tin."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
