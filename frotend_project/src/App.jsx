import React, { useState, useEffect } from "react";
import Login from "./Components/Login";
import Create_account from "./Components/Create_account";
import Dashboard from "./Components/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState("Login");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/check-auth", {
        credentials: "include"
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setPage("Dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include"
      });
      setIsAuthenticated(false);
      setPage("Login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isAuthenticated) {
    if (page === "Create_account") {
      return <Create_account setPage={setPage} />;
    }
    return <Login onLogin={handleLogin} setPage={setPage} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;