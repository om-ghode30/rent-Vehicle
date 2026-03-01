// src/services/payment.service.js

async function processPayment(amount, bookingId) {

  // Simulate payment delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const success = true;

  if (!success) {
    return {
      success: false,
      transaction_id: null,
      message: "Payment failed"
    };
  }

  return {
    success: true,
    transaction_id: "TXN" + Date.now(),
    message: "Payment successful"
  };
}

module.exports = { processPayment };