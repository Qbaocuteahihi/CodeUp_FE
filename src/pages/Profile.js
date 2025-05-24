import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    profilePicture: null,
    previewImage: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        profilePicture: null,
        previewImage: user.profilePicture || ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePicture: file,
        previewImage: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        `/api/users/${user._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      onUpdate(response.data);
      setIsEditing(false);
    } catch (err) {
      setError("Cập nhật thất bại. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="profile-container"><div className="profile-message">Vui lòng đăng nhập để xem hồ sơ của bạn.</div></div>;
  }

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
