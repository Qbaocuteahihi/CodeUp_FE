import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import './QuizViewer.css';

const QuizViewer = ({ courseId, quizData = null }) => {
  // State management
  const [quiz, setQuiz] = useState(quizData || []);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(!quizData);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(null);

  // Memoized time formatter
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Fetch quiz data
  useEffect(() => {
    if (quizData) {
      setIsLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`http://localhost:5000/api/courses/${courseId}/quiz`);
        setQuiz(res.data.quiz);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        setError("Không thể tải bài kiểm tra. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, quizData]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (started && !submitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !submitted) {
      handleSubmit();
    }
    
    return () => clearInterval(timer);
  }, [started, submitted, timeRemaining]);

  // Reset quiz when data changes
  useEffect(() => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimeRemaining(1200);
    setShowExplanation(false);
    setCurrentQuestionIndex(0);
    setStarted(false);
  }, [quiz]);

  // Answer selection handler
  const handleSelect = (optionIndex) => {
    if (!submitted && started) {
      setUserAnswers(prev => ({ 
        ...prev, 
        [currentQuestionIndex]: optionIndex 
      }));
    }
  };

  // Quiz submission handler
  const handleSubmit = () => {
    if (submitted) return;
    
    let correct = 0;
    quiz.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    
    setScore(correct);
    setSubmitted(true);
  };

  // Navigation handlers
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Quiz control functions
  const startQuiz = () => setStarted(true);
  const toggleExplanation = () => setShowExplanation(!showExplanation);
  
  const resetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimeRemaining(1200);
    setShowExplanation(false);
    setCurrentQuestionIndex(0);
  };

  // Calculate quiz metrics
  const calculatePercentage = () => Math.round((score / quiz.length) * 100);
  const answeredCount = Object.keys(userAnswers).length;
  const progressPercentage = Math.round((answeredCount / quiz.length) * 100);

  // Current question data
  const currentQuestion = quiz[currentQuestionIndex] || {};
  const selectedOption = userAnswers[currentQuestionIndex];
  const isCorrect = submitted && selectedOption === currentQuestion.correctAnswerIndex;
  const isWrong = submitted && selectedOption !== undefined && 
                 selectedOption !== currentQuestion.correctAnswerIndex;

  // Render loading state
  if (isLoading) {
    return (
      <div className="quiz-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-state">
          <div className="error-icon">!</div>
          <h3>Đã xảy ra lỗi</h3>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!quiz.length) {
    return (
      <div className="quiz-container">
        <div className="empty-state">
          <h3>Không có bài kiểm tra</h3>
          <p>Hiện không có bài kiểm tra nào cho khóa học này</p>
        </div>
      </div>
    );
  }

  // Render intro screen
  if (!started) {
    return (
      <div className="quiz-container">
        <div className="quiz-intro">
          <div className="intro-header">
            <h1>Bài Kiểm Tra Kiến Thức</h1>
            <div className="quiz-metrics">
              <div className="metric">
                <span>Số câu hỏi</span>
                <strong>{quiz.length}</strong>
              </div>
              <div className="metric">
                <span>Thời gian</span>
                <strong>20 phút</strong>
              </div>
              <div className="metric">
                <span>Điểm đạt</span>
                <strong>80%</strong>
              </div>
            </div>
          </div>
          
          <div className="intro-content">
            <p>
              Bài kiểm tra này đánh giá kiến thức bạn đã học. 
              Hãy chắc chắn bạn đã sẵn sàng trước khi bắt đầu.
            </p>
          </div>
          
          <button
            onClick={startQuiz}
            className="start-button"
          >
            Bắt Đầu Làm Bài
          </button>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className="quiz-container">
      {/* Quiz Header */}
      <div className="quiz-header">
        <div>
          <h2>Quiz kiểm tra kiến thức</h2>
          <p>Câu hỏi {currentQuestionIndex + 1}/{quiz.length}</p>
        </div>
        
        {!submitted && (
          <div className="timer">
            <span className="timer-icon">⏱</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {!submitted && (
        <div className="progress-container">
          <div className="progress-labels">
            <span>Tiến độ: {answeredCount}/{quiz.length}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Question Area */}
      <div className={`question-container ${submitted ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
        <div className="question-header">
          <span className="question-number">Câu {currentQuestionIndex + 1}</span>
          <h3>{currentQuestion.question}</h3>
        </div>
        
        <div className="options-container">
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrectOption = submitted && index === currentQuestion.correctAnswerIndex;
            const isWrongOption = submitted && isSelected && !isCorrectOption;
            
            return (
              <div 
                key={index}
                className={`option 
                  ${isSelected ? 'selected' : ''} 
                  ${isCorrectOption ? 'correct' : ''} 
                  ${isWrongOption ? 'incorrect' : ''}`}
                onClick={() => handleSelect(index)}
              >
                <div className="option-letter">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="option-text">{option}</div>
                
                {isCorrectOption && (
                  <div className="option-status correct">✓</div>
                )}
                {isWrongOption && (
                  <div className="option-status incorrect">✗</div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Explanation */}
        {submitted && currentQuestion.explanation && (
          <div className="explanation">
            <div className="explanation-header">
              <span>📝 Giải thích</span>
            </div>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}
      </div>
      
      {/* Navigation Controls */}
      <div className="navigation-controls">
        <button
          onClick={goToPrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          ← Câu trước
        </button>
        
        <button
          onClick={goToNextQuestion}
          disabled={currentQuestionIndex === quiz.length - 1}
        >
          Câu tiếp theo →
        </button>
      </div>
      
      {/* Action Buttons */}
      <div className="action-buttons">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < quiz.length}
            className={`submit-button ${answeredCount < quiz.length ? 'disabled' : ''}`}
          >
            Nộp bài kiểm tra
          </button>
        ) : (
          <>
            <div className="result-container">
              <div className="result-score">
                <span>{calculatePercentage()}%</span>
              </div>
              <div className="result-details">
                <h3>Kết quả bài kiểm tra</h3>
                <p>Số câu đúng: <strong>{score}/{quiz.length}</strong></p>
                <p className="result-message">
                  {calculatePercentage() >= 80 
                    ? "Xuất sắc! Bạn đã nắm vững kiến thức này." 
                    : calculatePercentage() >= 60 
                      ? "Khá tốt! Hãy xem lại các câu sai." 
                      : "Cần cải thiện! Bạn nên xem lại bài học."}
                </p>
              </div>
            </div>
            
            <div className="result-actions">
              <button
                onClick={resetQuiz}
                className="retry-button"
              >
                Làm lại
              </button>
              <button
                onClick={toggleExplanation}
                className="explanation-toggle"
              >
                {showExplanation ? "Ẩn giải thích" : "Xem giải thích"}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Detailed Explanation */}
      {submitted && showExplanation && (
        <div className="detailed-explanation">
          <h3>Giải thích chi tiết</h3>
          
          <div className="explanation-list">
            {quiz.map((q, index) => (
              <div key={index} className="explanation-item">
                <div className="explanation-question">
                  <strong>Câu {index + 1}:</strong> {q.question}
                </div>
                <div className="explanation-answer">
                  <span>Đáp án đúng:</span> {q.options[q.correctAnswerIndex]}
                </div>
                {q.explanation && (
                  <div className="explanation-text">
                    <span>Giải thích:</span> {q.explanation}
                  </div>
                )}
                {userAnswers[index] !== undefined && (
                  <div className="user-answer">
                    <span>Bạn chọn:</span> 
                    <span className={userAnswers[index] === q.correctAnswerIndex ? 'correct' : 'incorrect'}>
                      {q.options[userAnswers[index]]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizViewer;