import React, { useState, useEffect } from "react";
import axios from "axios";
import './QuizViewer.css';
 
const QuizViewer = ({ courseId, quizData = null }) => {
  const [quiz, setQuiz] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 phút
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [started, setStarted] = useState(false);

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

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        if (quizData) {
          setQuiz(quizData);
        } else {
          const res = await axios.get(`http://localhost:5000/api/courses/${courseId}/quiz`);
          setQuiz(res.data.quiz);
        }
      } catch (err) {
        console.error("Lỗi khi lấy quiz:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, quizData]);

  const handleSelect = (optionIndex) => {
    if (!submitted && started) {
      setUserAnswers({ 
        ...userAnswers, 
        [currentQuestionIndex]: optionIndex 
      });
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePercentage = () => {
    return Math.round((score / quiz.length) * 100);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimeRemaining(1200);
    setShowExplanation(false);
    setCurrentQuestionIndex(0);
    setStarted(false);
  };

  const startQuiz = () => {
    setStarted(true);
    setCurrentQuestionIndex(0);
  };

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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!quiz || quiz.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có quiz nào cho khóa học này</h2>
          <p className="text-gray-600 mb-6">Vui lòng kiểm tra lại sau hoặc liên hệ với người quản lý khóa học.</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Màn hình bắt đầu
  if (!started) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-4">Bài Kiểm Tra Kiến Thức</h1>
            <div className="bg-white bg-opacity-20 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex justify-between mb-4">
                <span className="text-blue-100">Số câu hỏi:</span>
                <span className="font-semibold">{quiz.length} câu</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-blue-100">Thời gian:</span>
                <span className="font-semibold">20 phút</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Điểm đạt:</span>
                <span className="font-semibold">80% trở lên</span>
              </div>
            </div>
            <p className="mt-6 mb-8 text-blue-100 max-w-2xl mx-auto">
              Bài kiểm tra này giúp đánh giá kiến thức bạn đã học. 
              Hãy chắc chắn bạn đã sẵn sàng trước khi bắt đầu.
            </p>
            <button
              onClick={startQuiz}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-lg"
            >
              Bắt Đầu Làm Bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lấy câu hỏi hiện tại
  const currentQuestion = quiz[currentQuestionIndex];
  const isSelected = userAnswers[currentQuestionIndex] !== undefined;
  const selectedOption = userAnswers[currentQuestionIndex];
  const isCorrect = submitted && selectedOption === currentQuestion.correctAnswerIndex;
  const isWrong = submitted && isSelected && selectedOption !== currentQuestion.correctAnswerIndex;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">Quiz kiểm tra kiến thức</h1>
              <p className="opacity-90">Câu hỏi {currentQuestionIndex + 1}/{quiz.length}</p>
            </div>
            {!submitted && (
              <div className="mt-4 md:mt-0 bg-blue-800 bg-opacity-50 px-4 py-2 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        {!submitted && (
          <div className="px-6 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tiến độ: {Object.keys(userAnswers).length}/{quiz.length} câu</span>
              <span>{Math.round((Object.keys(userAnswers).length / quiz.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(Object.keys(userAnswers).length / quiz.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Quiz Content - Chỉ hiển thị 1 câu tại một thời điểm */}
        <div className="p-6">
          <div 
            className={`mb-8 p-4 rounded-xl transition-all duration-300 ${
              submitted ? (isCorrect ? "bg-green-50" : "bg-red-50") : "bg-gray-50"
            }`}
          >
            <p className="font-semibold text-gray-800 mb-3 flex items-start">
              <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                {currentQuestionIndex + 1}
              </span>
              <span>{currentQuestion.question}</span>
            </p>
            <div className="space-y-3 ml-11">
              {currentQuestion.options.map((opt, i) => {
                const isOptionSelected = userAnswers[currentQuestionIndex] === i;
                const isOptionCorrect = submitted && i === currentQuestion.correctAnswerIndex;
                const isOptionWrong = submitted && isOptionSelected && i !== currentQuestion.correctAnswerIndex;
                
                let optionClass = "block w-full text-left px-4 py-3 rounded-lg border transition-all duration-300 ";
                
                if (isOptionCorrect) {
                  optionClass += "bg-green-100 border-green-500 shadow-sm";
                } else if (isOptionWrong) {
                  optionClass += "bg-red-100 border-red-500";
                } else if (isOptionSelected) {
                  optionClass += "bg-blue-100 border-blue-500";
                } else {
                  optionClass += "border-gray-300 hover:border-blue-400 hover:bg-blue-50";
                }
                
                return (
                  <button
                    key={i}
                    className={optionClass}
                    onClick={() => handleSelect(i)}
                    disabled={submitted}
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full border flex items-center justify-center mr-3 flex-shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                      {isOptionCorrect && (
                        <span className="ml-auto text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                      {isOptionWrong && (
                        <span className="ml-auto text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {submitted && currentQuestion.explanation && (
              <div className="mt-4 ml-11 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Giải thích
                </p>
                <p className="text-gray-700 mt-2">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
          
          {/* Điều hướng câu hỏi */}
          <div className="flex justify-between mt-6">
            <button
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentQuestionIndex === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              ← Câu trước
            </button>
            
            {!submitted ? (
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === quiz.length - 1}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentQuestionIndex === quiz.length - 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Câu tiếp theo →
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === quiz.length - 1}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentQuestionIndex === quiz.length - 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Câu tiếp theo →
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(userAnswers).length < quiz.length}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  Object.keys(userAnswers).length < quiz.length
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                Nộp bài kiểm tra
              </button>
            ) : (
              <>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white w-full">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="flex-shrink-0 w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                      <span className="text-3xl font-bold">{calculatePercentage()}%</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Kết quả bài kiểm tra</h3>
                      <p className="text-lg mb-1">Số câu đúng: <span className="font-bold">{score}/{quiz.length}</span></p>
                      <p className="text-sm opacity-90">
                        {calculatePercentage() >= 80 
                          ? "Xuất sắc! Bạn đã nắm vững kiến thức này." 
                          : calculatePercentage() >= 60 
                            ? "Khá tốt! Hãy xem lại các câu sai để cải thiện." 
                            : "Cần cải thiện! Bạn nên xem lại bài học và thử lại."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-300 shadow-md hover:shadow-lg"
                  >
                    Làm lại bài kiểm tra
                  </button>
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition duration-300"
                  >
                    {showExplanation ? "Ẩn giải thích" : "Xem tất cả giải thích"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Explanation Toggle */}
      {submitted && showExplanation && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 quiz-explanation-scroll">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Giải thích chi tiết
          </h3>
          
          <div className="space-y-6">
            {quiz.map((q, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium text-gray-800">
                  Câu {index + 1}: {q.question}
                </p>
                <p className="mt-2 text-gray-700">
                  <span className="font-medium text-green-600">Đáp án đúng:</span> {q.options[q.correctAnswerIndex]}
                </p>
                {q.explanation && (
                  <p className="mt-2 text-gray-700">
                    <span className="font-medium text-blue-600">Giải thích:</span> {q.explanation}
                  </p>
                )}
                {userAnswers[index] !== undefined && (
                  <p className="mt-2">
                    <span className="font-medium">Bạn đã chọn: </span>
                    <span className={userAnswers[index] === q.correctAnswerIndex ? "text-green-600" : "text-red-600"}>
                      {q.options[userAnswers[index]]}
                    </span>
                  </p>
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