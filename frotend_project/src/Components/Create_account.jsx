import React, { useState } from "react";

function Create_account({ setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          password, 
          confirmPassword,  // Make sure this matches backend
          email, 
          fullname 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          setPage("Login");
        }, 2000);
      } else {
        setError(data.message || "Failed to create account");
      }
    } catch (error) {
      setError("Connection error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username *</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email (Optional)</label>
            <input
              type="email"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 4 characters</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Confirm Password *</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          {error && <p className="text-red-500 mb-3">{error}</p>}
          {success && <p className="text-green-500 mb-3">{success}</p>}
          <button 
            type="submit" 
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
          >
            Create Account
          </button>
          <button 
            type="button"
            onClick={() => setPage("Login")}
            className="w-full mt-3 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Create_account;