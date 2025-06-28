import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './AdminDashboard.css';
import { FiHome, FiUsers, FiBook, FiDollarSign, FiPieChart, FiSettings, FiLogOut, FiArrowUp, FiArrowDown, FiSearch } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    recentEnrollments: 0,
    recentCourses: 0,
    revenueChange: 0,
    userChange: 0
  });
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
  const [topInstructors, setTopInstructors] = useState({ labels: [], datasets: [] });
  const [instructorRevenue, setInstructorRevenue] = useState({ labels: [], datasets: [] });
  const [courseMonthlyData, setCourseMonthlyData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  const [searchTimeout, setSearchTimeout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const params = {
          role: roleFilter,
          active: statusFilter,
          search: userSearchTerm
        };
        const usersResponse = await axios.get('http://localhost:5000/api/admin/users', { params });
        setUsers(usersResponse.data);
      } else if (activeTab === 'courses') {
        const params = {
          category: categoryFilter,
          published: courseStatusFilter,
          instructor: instructorFilter,
          search: courseSearchTerm
        };
        const coursesResponse = await axios.get('http://localhost:5000/api/admin/courses', { params });
        setCourses(coursesResponse.data);
      } else {
        const [
          statsResponse,
          enrollmentsResponse,
          coursesResponse,
          revenueResponse,
          instructorsResponse,
          instructorRevenueResponse,
          courseMonthlyResponse
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats'),
          axios.get('http://localhost:5000/api/admin/enrollment-stats'),
          axios.get('http://localhost:5000/api/admin/course-stats'),
          axios.get('http://localhost:5000/api/admin/revenue-stats'),
          axios.get('http://localhost:5000/api/admin/top-instructors'),
          axios.get('http://localhost:5000/api/admin/instructor-revenue'),
          axios.get('http://localhost:5000/api/admin/course-monthly-stats')
        ]);

        setStats({
          totalUsers: statsResponse.data.userCount,
          totalCourses: statsResponse.data.courseCount,
          totalInstructors: statsResponse.data.instructorCount,
          recentEnrollments: enrollmentsResponse.data.count,
          recentCourses: coursesResponse.data.count,
          revenueChange: 12.5,
          userChange: 8.2
        });

        // Process revenue data
        const revenueStats = revenueResponse.data;
        const months = revenueStats.map(item => `Tháng ${item._id.month}/${item._id.year}`);
        const amounts = revenueStats.map(item => item.totalRevenue);
        setRevenueData({
          labels: months,
          datasets: [{
            label: 'Doanh thu (VND)',
            data: amounts,
            backgroundColor: 'rgba(67, 97, 238, 0.2)',
            borderColor: 'rgba(67, 97, 238, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        });

        // Process top instructors data
        const instructorsData = instructorsResponse.data;
        setTopInstructors({
          labels: instructorsData.map(item => item.instructorName),
          datasets: [{
            label: 'Số khóa học',
            data: instructorsData.map(item => item.courseCount),
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 2
          }]
        });

        // Process instructor revenue data
        const instructorRevData = instructorRevenueResponse.data;
        setInstructorRevenue({
          labels: instructorRevData.map(item => item.instructorName),
          datasets: [{
            label: 'Doanh thu (VND)',
            data: instructorRevData.map(item => item.totalRevenue),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2
          }]
        });

        // Process course monthly data
        const courseMonthlyStats = courseMonthlyResponse.data;
        const courseMonths = courseMonthlyStats.map(item => `Tháng ${item._id.month}/${item._id.year}`);
        const courseCounts = courseMonthlyStats.map(item => item.count);
        setCourseMonthlyData({
          labels: courseMonths,
          datasets: [{
            label: 'Số khóa học',
            data: courseCounts,
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        });
      }
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, roleFilter, statusFilter, userSearchTerm, categoryFilter, courseStatusFilter, instructorFilter, courseSearchTerm]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      fetchData();
    }, 500);
    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [fetchData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (err) {
      setError('Cập nhật vai trò thất bại');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, { active: newStatus });
      fetchData();
    } catch (err) {
      setError('Cập nhật trạng thái thất bại');
    }
  };

  const handleDelete = async (id, type) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa ${type === 'users' ? 'người dùng' : 'khóa học'} này?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/${type}/${id}`);
      if (type === 'users') {
        setUsers(users.filter(user => user._id !== id));
        alert('Đã xóa người dùng thành công!');
      } else {
        setCourses(courses.filter(course => course._id !== id));
        alert('Đã xóa khóa học thành công!');
      }
    } catch (err) {
      setError(`Xóa ${type === 'users' ? 'người dùng' : 'khóa học'} thất bại. Vui lòng thử lại.`);
      alert(`Xóa ${type === 'users' ? 'người dùng' : 'khóa học'} thất bại. Vui lòng thử lại.`);
      console.error('Delete error:', err);
    }
  };

  const handleSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    fetchData();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchChange = (e, type) => {
    if (type === 'user') {
      setUserSearchTerm(e.target.value);
    } else {
      setCourseSearchTerm(e.target.value);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN').format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN').format(value);
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {activeTab === 'dashboard' ? 'Tổng quan' : 
              activeTab === 'users' ? 'Quản lý người dùng' : 
              'Quản lý khóa học'}
            </h1>
            <div className="nav-tabs">
              <button 
                className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <FiHome size={16} /> Tổng quan
              </button>
              <button 
                className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <FiUsers size={16} /> Người dùng
              </button>
              <button 
                className={`nav-tab ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
              >
                <FiBook size={16} /> Khóa học
              </button>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-outline me-2"
              onClick={() => navigate('/')}
            >
              <FiHome size={16} /> Trang chủ
            </button>
          </div>
        </header>

        {error && (
          <div className="alert alert-danger mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#DC3545"/>
            </svg>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Đang tải dữ liệu...</p>
          </div>
        ) : activeTab === 'dashboard' ? (
          <>
            <div className="stats-grid mb-5">
              <div className="stat-card primary">
                <div className="stat-card-header">
                  <span className="stat-card-title">Tổng người dùng</span>
                  <div className="stat-card-icon primary">
                    <FiUsers size={20} />
                  </div>
                </div>
                <h1 className="stat-card-value">{stats.totalUsers.toLocaleString()}</h1>
              </div>
              
              <div className="stat-card success">
                <div className="stat-card-header">
                  <span className="stat-card-title">Tổng khóa học</span>
                  <div className="stat-card-icon success">
                    <FiBook size={20} />
                  </div>
                </div>
                <h1 className="stat-card-value">{stats.totalCourses.toLocaleString()}</h1>
              </div>
              
              <div className="stat-card warning">
                <div className="stat-card-header">
                  <span className="stat-card-title">Tổng giảng viên</span>
                  <div className="stat-card-icon warning">
                    <FiUsers size={20} />
                  </div>
                </div>
                <h1 className="stat-card-value">{stats.totalInstructors.toLocaleString()}</h1>
              </div>
              
              <div className="stat-card danger">
                <div className="stat-card-header">
                  <span className="stat-card-title">Doanh thu</span>
                  <div className="stat-card-icon danger">
                    <FiDollarSign size={20} />
                  </div>
                </div>
                <h1 className="stat-card-value">
                  {revenueData.datasets[0]?.data.reduce((a, b) => a + b, 0).toLocaleString('vi-VN')} VND
                </h1>
              </div>
            </div>

            <div className="charts-grid mb-4">
              <div className="chart-card main-chart">
                <h3 className="chart-title">
                  <FiDollarSign size={20} />
                   Doanh thu theo tháng
                </h3>
                <div className="chart-container">
                  <Line data={revenueData} options={chartOptions} />
                </div>
              </div>
              
              <div className="chart-card secondary-chart">
                <h3 className="chart-title">
                  <FiBook size={20} />
                   Khóa học theo tháng
                </h3>
                <div className="chart-container">
                  <Line data={courseMonthlyData} options={chartOptions} />
                </div>
              </div>
              
              <div className="chart-card secondary-chart">
                <h3 className="chart-title">
                  <FiUsers size={20} />
                   Top giảng viên tích cực
                </h3>
                <div className="chart-container">
                  <Bar data={topInstructors} options={chartOptions} />
                </div>
              </div>
              
              <div className="chart-card tertiary-chart">
                <h3 className="chart-title">
                  <FiPieChart size={20} />
                   Doanh thu theo giảng viên
                </h3>
                <div className="chart-container">
                  <Bar data={instructorRevenue} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'users' ? (
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Danh sách người dùng</h3>
            </div>
            
            <div className="filter-section">
              <div className="row">
                <div className="col-md-3">
                  <select 
                    className="form-control role-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">Tất cả vai trò</option>
                    <option value="student">Người dùng</option>
                    <option value="instructor">Giảng viên</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <div className="search-input-container">
                    <FiSearch 
                      className="search-icon" 
                      onClick={handleSearch}
                      style={{ cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-control with-icon"
                      placeholder="Tìm kiếm theo tên hoặc email..."
                      value={userSearchTerm}
                      onChange={(e) => handleSearchChange(e, 'user')}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                          alt={user.username} 
                          className="rounded-circle me-2" 
                          width="32" 
                          height="32"
                        />
                        {user.username || 'N/A'}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="user">Người dùng</option>
                        <option value="instructor">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                        >
                          Xem
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(user._id, 'users')}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Danh sách khóa học</h3>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/addcourse')}
              >
                Thêm khóa học
              </button>
            </div>
            
            <div className="filter-section">
              <div className="row">
                <div className="col-md-12">
                  <div className="search-input-container">
                    <FiSearch 
                      className="search-icon" 
                      onClick={handleSearch}
                      style={{ cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-control with-icon"
                      placeholder="Tìm kiếm theo tên khóa học..."
                      value={courseSearchTerm}
                      onChange={(e) => handleSearchChange(e, 'course')}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên khóa học</th>
                  <th>Giảng viên</th>
                  <th>Học viên</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td style={{ fontWeight: 500 }}>{course.title}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${course.instructor?.username || 'Instructor'}&background=random`} 
                          alt={course.instructor?.username} 
                          className="rounded-circle me-2" 
                          width="32" 
                          height="32"
                        />
                        {course.instructor?.username || 'N/A'}
                      </div>
                    </td>
                    <td>{(course.enrolledUsers?.length || 0) - 2}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-outline" 
                          onClick={() => navigate(`/courses/${course._id}`)}
                        >
                          Xem
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(course._id, 'courses')}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;