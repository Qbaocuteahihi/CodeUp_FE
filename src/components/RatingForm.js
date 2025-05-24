import React, { useEffect, useState } from "react";
import "./RatingForm.css";

const RatingForm = ({ courseId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`/api/ratings/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setRating(data.rating || 0);
        }
      } catch (err) {
        console.error("Error fetching rating:", err);
      }
    };

    fetchRating();
  }, [courseId]);

  const handleSubmit = async (star) => {
    if (submitting) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Bạn cần đăng nhập để đánh giá");

    setSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, rating: star }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "Gửi đánh giá thất bại");
      } else {
        setRating(star);
        alert(`Cảm ơn bạn đã đánh giá khóa học ${star} sao!`);
        onSubmitted?.();
      }
    } catch (err) {
      alert("Lỗi kết nối đến máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-form">
      <h3>Đánh giá khóa học:</h3>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? "selected" : ""} ${submitting ? "disabled" : ""}`}
          onClick={() => !submitting && handleSubmit(star)}
          title={`${star} sao`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingForm;