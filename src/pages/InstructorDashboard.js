import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setError('Vui lòng đăng nhập để tiếp tục');
      return;
    }
    fetchData();
  }, [activeTab, userId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'courses') {
        const coursesResponse = await axios.get(`http://localhost:5000/api/instructor/courses/${userId}`);
        setCourses(coursesResponse.data);
      } else {
        const studentsResponse = await axios.get(`http://localhost:5000/api/instructor/students/${userId}`);
        setStudents(studentsResponse.data);
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa khóa học này?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCourses(courses.filter(course => course._id !== id));
      alert('Đã xóa khóa học thành công!');
    } catch (err) {
      setError('Failed to delete course.');
      alert('Xóa khóa học thất bại. Vui lòng thử lại.');
    }
  };

  const togglePublishStatus = async (courseId, currentStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/courses/${courseId}`, {
        published: !currentStatus
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchData();
      alert(`Đã ${currentStatus ? 'ẩn' : 'công khai'} khóa học thành công!`);
    } catch (err) {
      setError('Failed to update course status.');
    }
  };

  if (!userId) {
    return (
      <div className="instructor-dashboard">
        <div className="error-message">
          Vui lòng đăng nhập để truy cập trang này
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
            style={{ marginLeft: '1rem' }}
          >
            Đi đến trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <button className="back-to-home-btn" onClick={() => navigate("/")}>
            Trang chủ
          </button>
          <h1 className="dashboard-title">Instructor Dashboard</h1>
          
          {stats && (
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-number">{stats.totalCourses}</span>
                <span className="stat-label">Khóa học</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalStudents}</span>
                <span className="stat-label">Học viên</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.earnings?.toLocaleString() || 0} VND</span>
                <span className="stat-label">Thu nhập</span>
              </div>
            </div>
          )}
        </header>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            My Courses
          </button>
          {/* <button
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            My Students
          </button> */}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/instructor/courses/new')}
          >
            + Tạo khóa học mới
          </button>
        </div>

        <div className="data-card">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="loading-spinner" />
              <p className="text-muted">Loading data...</p>
            </div>
          ) : activeTab === 'courses' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Học viên</th>
                  <th>Doanh thu</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td style={{ fontWeight: 500 }}>{course.title}</td>
                    <td>{course.enrolledUsers?.length || 0}</td>
                    <td>{(course.price * (course.enrolledUsers?.length || 0)).toLocaleString()} VND</td>
                    <td>
                      <span 
                        className={`badge ${course.published ? 'badge-success' : 'badge-warning'}`}
                        onClick={() => togglePublishStatus(course._id, course.published)}
                        style={{ cursor: 'pointer' }}
                      >
                        {course.published ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/courses/${course._id}`)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteCourse(course._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên học viên</th>
                  <th>Email</th>
                  <th>Khóa học đăng ký</th>
                  <th>Ngày đăng ký</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map(student => (
                    <tr key={student._id}>
                      <td>{student.username || student.email}</td>
                      <td>{student.email}</td>
                      <td>
                        {student.enrolledCourses?.map((course, index) => (
                          <div key={index}>
                            {course.courseTitle} ({new Date(course.enrolledAt).toLocaleDateString()})
                          </div>
                        ))}
                      </td>
                      <td>
                        {student.enrolledCourses?.[0]?.enrolledAt ? 
                          new Date(student.enrolledCourses[0].enrolledAt).toLocaleDateString() : 
                          'N/A'}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/users/${student._id}`)}
                        >
                          Xem hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      Chưa có học viên nào đăng ký khóa học
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;