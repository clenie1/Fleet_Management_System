import React, { useState, useEffect } from "react";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    VehicleCode: "",
    PlateNumber: "",
    VehicleType: "",
    Brand: "",
    Capacity: "",
    Status: "Available",
    PurchaseDate: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/vehicles", {
        credentials: "include",
      });
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Vehicle added successfully!");
        setShowForm(false);
        setFormData({
          VehicleCode: "",
          PlateNumber: "",
          VehicleType: "",
          Brand: "",
          Capacity: "",
          Status: "Available",
          PurchaseDate: "",
        });
        fetchVehicles();
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          + Add Vehicle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Vehicle Code (e.g., VH005)"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.VehicleCode}
              onChange={(e) => setFormData({ ...formData, VehicleCode: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Plate Number"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.PlateNumber}
              onChange={(e) => setFormData({ ...formData, PlateNumber: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Vehicle Type"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.VehicleType}
              onChange={(e) => setFormData({ ...formData, VehicleType: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Brand"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.Brand}
              onChange={(e) => setFormData({ ...formData, Brand: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Capacity"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.Capacity}
              onChange={(e) => setFormData({ ...formData, Capacity: e.target.value })}
              required
            />
            <select
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.Status}
              onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
            >
              <option>Available</option>
              <option>In Trip</option>
              <option>Maintenance</option>
              <option>Retired</option>
            </select>
            <input
              type="date"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.PurchaseDate}
              onChange={(e) => setFormData({ ...formData, PurchaseDate: e.target.value })}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition col-span-2"
            >
              Save Vehicle
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Code</th>
              <th className="border p-2">Plate</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">Capacity</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.VehicleCode}>
                <td className="border p-2">{vehicle.VehicleCode}</td>
                <td className="border p-2">{vehicle.PlateNumber}</td>
                <td className="border p-2">{vehicle.VehicleType}</td>
                <td className="border p-2">{vehicle.Brand}</td>
                <td className="border p-2">{vehicle.Capacity}</td>
                <td className="border p-2">{vehicle.Status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Vehicles;