import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend endpoint if exists
    console.log("Password reset link sent to:", email);
    setSubmitted(true);
  };

  return (
    <div className="forgot-password-container">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      {submitted ? (
        <p className="text-green-500">
          Password reset link sent to your email!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-4 py-2 w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send Reset Link
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
