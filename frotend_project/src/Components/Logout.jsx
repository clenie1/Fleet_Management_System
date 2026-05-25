import React from "react";

function Logout({ onLogout }) {
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include"
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert("Logged out successfully!");
        onLogout();
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-3 bg-red-600 hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}

export default Logout;