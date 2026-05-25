import React, { useState, useEffect } from "react";
import Drivers from "./Drivers";
import Vehicles from "./Vehicles";
import Trips from "./Trips";
import Reports from "./Reports";
import Logout from "./Logout";

function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("Home");
  const [stats, setStats] = useState({ drivers: 0, vehicles: 0, trips: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const drivers = await fetch("http://localhost:5000/api/drivers", { credentials: "include" });
        const vehicles = await fetch("http://localhost:5000/api/vehicles", { credentials: "include" });
        const trips = await fetch("http://localhost:5000/api/trips", { credentials: "include" });
        const driversData = await drivers.json();
        const vehiclesData = await vehicles.json();
        const tripsData = await trips.json();
        setStats({
          drivers: driversData.length,
          vehicles: vehiclesData.length,
          trips: tripsData.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* Navigation Menu Bar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button onClick={() => setActivePage("Home")}className="px-4 py-3 hover:bg-blue-700 transition">Home</button>
              <button onClick={() => setActivePage("Drivers")} className="px-4 py-3 hover:bg-blue-700 transition">Drivers</button>
              <button onClick={() => setActivePage("Vehicles")}className="px-4 py-3 hover:bg-blue-700 transition">Vehicles</button>
              <button onClick={() => setActivePage("Trips")}className="px-4 py-3 hover:bg-blue-700 transition">Trips</button>
              <button onClick={() => setActivePage("Reports")}className="px-4 py-3 hover:bg-blue-700 transition">Reports</button>
            </div>
            <Logout onLogout={onLogout} />
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-6">
        {activePage === "Home" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Welcome to Fleet Management System</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
                <h3 className="text-lg">Total Drivers</h3>
                <p className="text-4xl font-bold">{stats.drivers}</p>
              </div>
              <div className="bg-green-500 text-white p-6 rounded-lg shadow">
                <h3 className="text-lg">Total Vehicles</h3>
                <p className="text-4xl font-bold">{stats.vehicles}</p>
              </div>
              <div className="bg-yellow-500 text-white p-6 rounded-lg shadow">
                <h3 className="text-lg">Total Trips</h3>
                <p className="text-4xl font-bold">{stats.trips}</p>
              </div>
            </div>
          </div>
        )}
        {activePage === " Home" && <Home />}
        {activePage === "Drivers" && <Drivers />}
        {activePage === "Vehicles" && <Vehicles />}
        {activePage === "Trips" && <Trips />}
        {activePage === "Reports" && <Reports />}
      </div>
    </div>
  );
}

export default Dashboard;