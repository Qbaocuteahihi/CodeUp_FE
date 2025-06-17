import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentStatus = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const vnp_TxnRef = queryParams.get("vnp_TxnRef");
    const vnp_Amount = queryParams.get("vnp_Amount");
    const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");

    const checkPayment = async () => {
      try {
        const response = await fetch(
          `/api/check-payment-vnpay?vnp_TxnRef=${vnp_TxnRef}&vnp_Amount=${vnp_Amount}&vnp_ResponseCode=${vnp_ResponseCode}`
        );
        const data = await response.json();

        if (data.paymentStatus === "success") {
          setStatus("success");
          setTimeout(() => navigate(`/courses/${data.courseId}`), 3000); // chuyển sau 3s
        } else {
          setStatus("failed");
          setTimeout(() => navigate("/"), 5000); // chuyển về trang chủ sau 5s
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra thanh toán:", error);
        setStatus("error");
        setTimeout(() => navigate("/"), 5000);
      }
    };

    if (vnp_TxnRef && vnp_ResponseCode) checkPayment();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {status === "checking" && <p>🔄 Đang xác nhận thanh toán...</p>}
      {status === "success" && <p>✅ Thanh toán thành công! Đang chuyển hướng...</p>}
      {status === "failed" && (
        <p>❌ Thanh toán thất bại hoặc bị hủy. Đang quay lại trang chủ...</p>
      )}
      {status === "error" && <p>⚠️ Có lỗi xảy ra. Vui lòng thử lại sau.</p>}
    </div>
  );
};

export default PaymentStatus;
