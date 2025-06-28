import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './InstructorDashboard.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [stats, setStats] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMonthlyRevenue, setShowMonthlyRevenue] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllCoursesModal, setShowAllCoursesModal] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setError('Vui lòng đăng nhập để tiếp tục');
      return;
    }
    fetchData();
  }, [activeTab, userId, showMonthlyRevenue, currentPage, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'courses') {
        const coursesResponse = await axios.get(`http://localhost:5000/api/instructor/courses/${userId}`);
        setCourses(coursesResponse.data);
      } else if (activeTab === 'students') {
        const studentsResponse = await axios.get(`http://localhost:5000/api/instructor/students/${userId}`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery
          }
        });
        setStudents(studentsResponse.data.students);
        setTotalPages(studentsResponse.data.totalPages);
      } else if (activeTab === 'revenue') {
        const revenueRes = await axios.get(`http://localhost:5000/api/instructor/revenue/${userId}`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery
          }
        });
        setRevenueData(revenueRes.data.revenueData);
        setTotalPages(revenueRes.data.totalPages);
        
        const monthlyRes = await axios.get(`http://localhost:5000/api/instructor/revenue/monthly/${userId}`);
        setMonthlyRevenueData(monthlyRes.data);
      } else if (activeTab === 'overview') {
        const statsRes = await axios.get(`http://localhost:5000/api/instructor/stats/${userId}`);
        setStats(statsRes.data);
        setMonthlyTrend(statsRes.data.monthlyTrend);
        
        const revenueRes = await axios.get(`http://localhost:5000/api/instructor/revenue/${userId}`, {
          params: { limit: 5 }
        });
        setRevenueData(revenueRes.data.revenueData);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    setIsStudentsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/instructor/courses/${courseId}/students`);
      setCourseStudents(response.data.students);
    } catch (err) {
      setError('Không thể tải danh sách học viên');
      console.error('Error fetching students:', err);
    } finally {
      setIsStudentsLoading(false);
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
      setError('Xóa khóa học thất bại.');
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
      setError('Cập nhật trạng thái khóa học thất bại.');
    }
  };

  const handleChartClick = (data) => {
    setSelectedData(data);
    setIsModalOpen(true);
  };

  const handleRevenueCardClick = async (course) => {
    setSelectedCourse(course);
    await fetchCourseStudents(course.courseId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
    setSelectedCourse(null);
    setCourseStudents([]);
  };

  const filteredCourses = courses
    .filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(course => ({
      ...course,
      studentCount: Math.max((course.enrolledUsers?.length || 0) - 2, 0),
      revenue: course.price * Math.max((course.enrolledUsers?.length || 0) - 2, 0)
    }))
    .sort((a, b) => {
      if (!sortKey) return 0;
      const valA = sortKey === 'createdAt' ? new Date(a[sortKey]) : a[sortKey];
      const valB = sortKey === 'createdAt' ? new Date(b[sortKey]) : b[sortKey];
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

  const itemsPerPage = 8;

  const renderOverviewTab = () => {
    if (!stats) return null;

    return (
      <div className="overview-container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng số khóa học</h3>
            <p className="stat-number">{stats.totalCourses}</p>
          </div>
          <div className="stat-card">
            <h3>Tổng doanh thu</h3>
            <p className="stat-number">{stats.totalRevenue.toLocaleString()} VND</p>
          </div>
          {/* <div className="stat-card">
            <h3>Học viên trung bình</h3>
            <p className="stat-number">{Math.round(stats.totalStudents / Math.max(stats.totalCourses, 1))}</p>
          </div> */}
        </div>

        <div className="chart-row">
          <div className="chart-container">
            <h3>Doanh thu theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={monthlyTrend}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload.length > 0) {
                    handleChartClick(data.activePayload[0].payload);
                  }
                }}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} VND`, 'Doanh thu']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Lượt đăng ký theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={monthlyTrend}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload.length > 0) {
                    handleChartClick(data.activePayload[0].payload);
                  }
                }}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                />
                <Legend />
                <Bar dataKey="enrollments" fill="#82ca9d" name="Lượt đăng ký" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="revenue-distribution-container">
          <div className="revenue-distribution-header">
            <h3 className="revenue-distribution-title">Phân bổ doanh thu theo khóa học</h3>
            <div className="revenue-distribution-legend">
              {revenueData.slice(0, 4).map((entry, index) => (
                <div key={`legend-${index}`} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.courseTitle.length > 15 ? `${entry.courseTitle.substring(0, 15)}...` : entry.courseTitle}</span>
                </div>
              ))}
              {revenueData.length > 4 && (
                <div 
                  className="legend-item" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowAllCoursesModal(true)}
                >
                  <span>+{revenueData.length - 4} khóa học khác</span>
                </div>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart
              onClick={(data) => {
                if (data && data.activePayload && data.activePayload.length > 0) {
                  handleChartClick(data.activePayload[0].payload);
                }
              }}
            >
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="totalRevenue"
                nameKey="courseTitle"
                label={({ name, percent }) => 
                  `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()} VND`, 'Doanh thu']}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
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
          <button className="back-to-home-btn" onClick={() => navigate("/")}>Trang chủ</button>
          <h1 className="dashboard-title">Bảng điều khiển giảng viên</h1>
        </header>

        <div className="tabs-container">
          <button className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Tổng quan</button>
          <button className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Khóa học</button>
          <button className={`tab-button ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Học viên</button>
          <button className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>Doanh thu</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === 'courses' && (
          <>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => navigate('/addcourse')}>+ Tạo khóa học mới</button>
            </div>
            <div className="search-filter-container">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm khóa học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="select-filter"
                value={sortKey} 
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="">Sắp xếp theo</option>
                <option value="studentCount">Số học viên</option>
                <option value="revenue">Doanh thu</option>
                <option value="createdAt">Ngày tạo</option>
              </select>
            </div>
          </>
        )}

        <div className="data-card">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="loading-spinner" />
              <p className="text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : activeTab === 'overview' ? (
            renderOverviewTab()
          ) : activeTab === 'courses' ? (
            <>
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
                  {filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(course => (
                    <tr key={course._id}>
                      <td style={{ fontWeight: 500 }}>{course.title}</td>
                      <td>{course.studentCount}</td>
                      <td>{course.revenue.toLocaleString()} VND</td>
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
                          <button className="btn btn-sm btn-outline" onClick={() => navigate(`/courses/${course._id}`)}>Chi tiết</button>
                          <button className="btn btn-sm btn-primary" onClick={() => navigate(`/editcourse/${course._id}`)}>Sửa</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCourse(course._id)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                
                {currentPage > 3 && (
                  <>
                    <button 
                      className="pagination-button"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                  </>
                )}

                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 
                    ? i + 1 
                    : currentPage >= totalPages - 2 
                      ? totalPages - 3 + i 
                      : currentPage - 1 + i;
                  if (page < 1 || page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                    <button 
                      className="pagination-button"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </>
          ) : activeTab === 'students' ? (
            <>
              <div className="search-filter-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Tìm kiếm học viên..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên học viên</th>
                    <th>Email</th>
                    <th>Số khóa học</th>
                    <th>Lần đăng ký gần nhất</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map(student => (
                      <tr key={student._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {student.avatar && (
                              <img 
                                src={student.avatar} 
                                alt={student.username} 
                                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                              />
                            )}
                            <span>{student.username || student.email}</span>
                          </div>
                        </td>
                        <td>{student.email}</td>
                        <td>{student.enrolledCourses?.length || 0}</td>
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
                        {searchQuery ? 'Không tìm thấy học viên phù hợp' : 'Chưa có học viên nào đăng ký khóa học'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                
                {currentPage > 3 && (
                  <>
                    <button 
                      className="pagination-button"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                  </>
                )}

                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 
                    ? i + 1 
                    : currentPage >= totalPages - 2 
                      ? totalPages - 3 + i 
                      : currentPage - 1 + i;
                  if (page < 1 || page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                    <button 
                      className="pagination-button"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </>
          ) : (
            <div className="monthly-revenue-container">
              <div className="monthly-revenue-header">
                <h2 className="monthly-revenue-title">Báo cáo doanh thu</h2>
                <div className="monthly-revenue-toggle">
                  <button
                    className={`btn ${!showMonthlyRevenue ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {
                      setShowMonthlyRevenue(false);
                      setCurrentPage(1);
                    }}
                  >
                    Theo khóa học
                  </button>
                  <button
                    className={`btn ${showMonthlyRevenue ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {
                      setShowMonthlyRevenue(true);
                      setCurrentPage(1);
                    }}
                  >
                    Theo tháng
                  </button>
                </div>
              </div>

              {showMonthlyRevenue ? (
                <div className="monthly-revenue-chart-container">
                  <div className="monthly-revenue-chart-header">
                    <h3 className="monthly-revenue-chart-title">Doanh thu theo tháng</h3>
                  </div>
                  
                  {monthlyRevenueData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart 
                          data={monthlyRevenueData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="monthName" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => {
                              if (name === 'Doanh thu') return [`${value.toLocaleString()} VND`, name];
                              if (name === 'Lượt đăng ký') return [value, name];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="totalRevenue" fill="#8884d8" name="Doanh thu" />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="monthly-revenue-top-courses">
                        <h4 className="monthly-revenue-top-courses-title">Khóa học nổi bật từng tháng:</h4>
                        <div className="monthly-revenue-top-courses-grid">
                          {monthlyRevenueData.filter(m => m.topCourse).map(month => (
                            <div key={month.month} className="monthly-revenue-top-course-card">
                              <h5 className="monthly-revenue-top-course-month">{month.monthName}</h5>
                              <p className="monthly-revenue-top-course-name">Khóa học: {month.topCourse.courseTitle}</p>
                              <p className="monthly-revenue-top-course-stats">
                                Doanh thu: {month.topCourse.revenue.toLocaleString()} VND
                              </p>
                              <p className="monthly-revenue-top-course-stats">
                                Chiếm: {month.topCourse.percentage}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="monthly-revenue-empty-state">
                      <div className="monthly-revenue-empty-state-icon">📊</div>
                      <p className="monthly-revenue-empty-state-text">
                        Chưa có dữ liệu doanh thu theo tháng để hiển thị.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="search-filter-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Tìm kiếm khóa học..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <select 
                      className="select-filter"
                      value={sortKey} 
                      onChange={(e) => setSortKey(e.target.value)}
                    >
                      <option value="">Sắp xếp theo</option>
                      <option value="totalRevenue">Doanh thu</option>
                      <option value="totalStudents">Số học viên</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {revenueData.length > 0 ? (
                      revenueData
                        .sort((a, b) => {
                          if (!sortKey) return 0;
                          const valA = a[sortKey];
                          const valB = b[sortKey];
                          return sortOrder === 'asc' ? valA - valB : valB - valA;
                        })
                        .map(course => (
                          <div 
                            key={course.courseId} 
                            className="stat-card"
                            onClick={() => handleRevenueCardClick(course)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              {course.courseThumbnail && (
                                <img 
                                  src={course.courseThumbnail} 
                                  alt={course.courseTitle}
                                  style={{ width: '80px', height: '60px', borderRadius: '4px', objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <h4>{course.courseTitle}</h4>
                                <p>Giá: {course.price.toLocaleString()} VND</p>
                              </div>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                              <p>Doanh thu: {course.totalRevenue.toLocaleString()} VND</p>
                              <p>Số học viên: {course.totalStudents}</p>
                              <p>Lần thanh toán gần nhất: {course.lastPayment ? 
                                new Date(course.lastPayment).toLocaleDateString() : 'Chưa có'}</p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
                        <p style={{ textAlign: 'center' }}>
                          {searchQuery ? 'Không tìm thấy khóa học phù hợp' : 'Chưa có dữ liệu doanh thu để hiển thị.'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pagination">
                    <button
                      className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    
                    {currentPage > 3 && (
                      <>
                        <button 
                          className="pagination-button"
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                      </>
                    )}

                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                      const page = currentPage <= 3 
                        ? i + 1 
                        : currentPage >= totalPages - 2 
                          ? totalPages - 3 + i 
                          : currentPage - 1 + i;
                      if (page < 1 || page > totalPages) return null;
                      return (
                        <button
                          key={page}
                          className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                        <button 
                          className="pagination-button"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal hiển thị thông tin chi tiết khóa học */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
          <Typography className="modal-title" variant="h6" component="h2">
            Chi tiết khóa học: {selectedCourse?.courseTitle}
          </Typography>
          <Typography className="modal-body" sx={{ mt: 2 }}>
            {selectedCourse && (
              <>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  {selectedCourse.courseThumbnail && (
                    <img 
                      src={selectedCourse.courseThumbnail} 
                      alt={selectedCourse.courseTitle}
                      style={{ width: '120px', height: '90px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <p><strong>Giá khóa học:</strong> {selectedCourse.price.toLocaleString()} VND</p>
                    <p><strong>Tổng doanh thu:</strong> {selectedCourse.totalRevenue.toLocaleString()} VND</p>
                    <p><strong>Số học viên:</strong> {selectedCourse.totalStudents}</p>
                    <p><strong>Lần thanh toán gần nhất:</strong> {selectedCourse.lastPayment ? 
                      new Date(selectedCourse.lastPayment).toLocaleDateString() : 'Chưa có'}</p>
                  </div>
                </div>
                
                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Danh sách học viên ({courseStudents.length})</h3>
                {isStudentsLoading ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div className="loading-spinner" style={{ width: '1.5rem', height: '1.5rem' }} />
                    <p>Đang tải danh sách học viên...</p>
                  </div>
                ) : courseStudents.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Học viên</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Ngày mua</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseStudents.map(student => (
                          <tr key={student._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {student.avatar && (
                                  <img 
                                    src={student.avatar} 
                                    alt={student.username} 
                                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                  />
                                )}
                                <span>{student.username || student.email}</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem' }}>{student.email}</td>
                            <td style={{ padding: '0.5rem' }}>
                              {student.purchasedAt ? new Date(student.purchasedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ padding: '0.5rem' }}>{student.amount?.toLocaleString()} VND</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-light)' }}>
                    Không có học viên nào đã mua khóa học này.
                  </p>
                )}
              </>
            )}
          </Typography>
          <button 
            className="btn btn-primary"
            onClick={handleCloseModal}
            style={{ marginTop: '1rem' }}
          >
            Đóng
          </button>
        </Box>
      </Modal>

      {/* Modal hiển thị tất cả khóa học */}
      <Modal
        open={showAllCoursesModal}
        onClose={() => setShowAllCoursesModal(false)}
        aria-labelledby="all-courses-modal-title"
        aria-describedby="all-courses-modal-description"
      >
        <Box className="modal-content" style={{ maxWidth: '600px' }}>
          <Typography className="modal-title" variant="h6" component="h2">
            Tất cả khóa học ({revenueData.length})
          </Typography>
          <Typography className="modal-body" sx={{ mt: 2 }}>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Khóa học</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem' }}>Doanh thu</th>
                    {/* <th style={{ textAlign: 'left', padding: '0.75rem' }}>Tỷ lệ</th> */}
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((course, index) => (
                    <tr key={course.courseId} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div 
                            className="legend-color" 
                            style={{ 
                              backgroundColor: COLORS[index % COLORS.length], 
                              minWidth: '12px', 
                              height: '12px', 
                              borderRadius: '2px' 
                            }}
                          />
                          <span>{course.courseTitle}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{course.totalRevenue.toLocaleString()} VND</td>
                      <td style={{ padding: '0.75rem' }}>
                        {/* {stats ? `${((course.totalRevenue / stats.totalRevenue) * 100).toFixed(1)}%` : 'N/A'} */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Typography>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAllCoursesModal(false)}
            style={{ marginTop: '1rem' }}
          >
            Đóng
          </button>
        </Box>
      </Modal>
    </div>
  );
};

export default InstructorDashboard;