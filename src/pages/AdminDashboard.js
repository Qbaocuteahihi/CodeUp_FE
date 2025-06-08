import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './AdminDashboard.css';
import { FiHome, FiUsers, FiBook, FiDollarSign, FiPieChart, FiSettings, FiLogOut, FiArrowUp, FiArrowDown } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    recentEnrollments: 0,
    recentCourses: 0,
    revenueChange: 0,
    userChange: 0
  });
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
  const [topInstructors, setTopInstructors] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const usersResponse = await axios.get('http://localhost:5000/api/admin/users');
        setUsers(usersResponse.data);
      } else if (activeTab === 'courses') {
        const coursesResponse = await axios.get('http://localhost:5000/api/admin/courses');
        setCourses(coursesResponse.data);
      } else {
        const [
          statsResponse,
          enrollmentsResponse,
          coursesResponse,
          revenueResponse,
          instructorsResponse
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats'),
          axios.get('http://localhost:5000/api/admin/enrollment-stats'),
          axios.get('http://localhost:5000/api/admin/course-stats'),
          axios.get('http://localhost:5000/api/admin/revenue-stats'),
          axios.get('http://localhost:5000/api/admin/top-instructors')
        ]);

        setStats({
          totalUsers: statsResponse.data.userCount,
          totalCourses: statsResponse.data.courseCount,
          recentEnrollments: enrollmentsResponse.data.count,
          recentCourses: coursesResponse.data.count,
          revenueChange: 12.5, // Example data - should come from API
          userChange: 8.2 // Example data - should come from API
        });

        const revenueStats = revenueResponse.data;
        const months = revenueStats.map(item => `Tháng ${item._id}`);
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
      }
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 6
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Admin Panel</h2>
        </div>
        
        <nav className="nav-menu">
          <div className="nav-item">
            <a 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FiHome /> Tổng quan
            </a>
          </div>
          <div className="nav-item">
            <a 
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <FiUsers /> Người dùng
            </a>
          </div>
          <div className="nav-item">
            <a 
              className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <FiBook /> Khóa học
            </a>
          </div>
          <button className="back-to-home-btn" onClick={() => navigate("/")}>
          Trang chủ
        </button>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            {activeTab === 'dashboard' ? 'Tổng quan' : 
             activeTab === 'users' ? 'Quản lý người dùng' : 
             'Quản lý khóa học'}
          </h1>
          
          <div className="user-profile">
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="Admin" 
              className="user-avatar"
            />
            <div>
              <div className="font-weight-bold">Admin</div>
              <div className="text-muted small">Quản trị viên</div>
            </div>
          </div>
        </header>

        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="text-muted">Đang tải dữ liệu...</p>
          </div>
        ) : activeTab === 'dashboard' ? (
          <>
            {/* Stats Cards */}
            <div className="stats-grid mb-5">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Tổng người dùng</span>
                  <div className="stat-card-icon primary">
                    <FiUsers size={20} />
                  </div>
                </div>
                <h3 className="stat-card-value">{stats.totalUsers}</h3>
                <div className={`stat-card-change ${stats.userChange >= 0 ? 'positive' : 'negative'}`}>
                  {stats.userChange >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                  {Math.abs(stats.userChange)}% so với tháng trước
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Tổng khóa học</span>
                  <div className="stat-card-icon success">
                    <FiBook size={20} />
                  </div>
                </div>
                <h3 className="stat-card-value">{stats.totalCourses}</h3>
                <div className="stat-card-change positive">
                  <FiArrowUp />
                  {stats.recentCourses} mới trong tháng
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Doanh thu</span>
                  <div className="stat-card-icon warning">
                    <FiDollarSign size={20} />
                  </div>
                </div>
                <h3 className="stat-card-value">
                  {revenueData.datasets[0]?.data.reduce((a, b) => a + b, 0).toLocaleString()} VND
                </h3>
                <div className={`stat-card-change ${stats.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                  {stats.revenueChange >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                  {Math.abs(stats.revenueChange)}% so với tháng trước
                </div>
              </div>
              
              {/* <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-title">Đăng ký mới</span>
                  <div className="stat-card-icon danger">
                    <FiUsers size={20} />
                  </div>
                </div>
                <h3 className="stat-card-value">{stats.recentEnrollments}</h3>
                <div className="stat-card-change positive">
                  <FiArrowUp />
                  5.2% so với tháng trước
                </div>
              </div> */}
            </div>

            {/* Charts */}
            <div className="charts-grid mb-4">
              <div className="chart-card">
                <h3 className="chart-title">Doanh thu theo tháng</h3>
                <div className="chart-container">
                  <Line data={revenueData} options={chartOptions} />
                </div>
              </div>
              
              <div className="chart-card">
                <h3 className="chart-title">Top giảng viên tích cực</h3>
                <div className="chart-container">
                  <Bar data={topInstructors} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'users' ? (
          <div className="table-card">
            <div className="table-header">
              <h3 className="table-title">Danh sách người dùng</h3>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
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
                      <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.active ? 'badge-success' : 'badge-danger'}`}>
                        {user.active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
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
              <button className="btn btn-primary">
                Thêm khóa học
              </button>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên khóa học</th>
                  <th>Giảng viên</th>
                  <th>Học viên</th>
                  <th>Trạng thái</th>
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
                          src={`https://ui-avatars.com/api/?name=${course.instructorName}&background=random`} 
                          alt={course.instructorName} 
                          className="rounded-circle me-2" 
                          width="32" 
                          height="32"
                        />
                        {course.instructorName || course.instructor}
                      </div>
                    </td>
                    <td>{course.enrolledCount || 0}</td>
                    <td>
                      <span className={`badge ${course.published ? 'badge-success' : 'badge-warning'}`}>
                        {course.published ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
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
