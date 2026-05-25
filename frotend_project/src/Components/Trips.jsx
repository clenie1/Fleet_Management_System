import React, { useState, useEffect } from "react";

function Trips() {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    DriverID: "",
    VehicleCode: "",
    DepartureLocation: "",
    Destination: "",
    DepartureDate: "",
    ReturnDate: "",
    FuelUsed: "",
    TripStatus: "Scheduled",
  });

  useEffect(() => {
    fetchTrips();
    fetchDriversAndVehicles();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/trips", {
        credentials: "include",
      });
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const fetchDriversAndVehicles = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        fetch("http://localhost:5000/api/drivers/list", { credentials: "include" }),
        fetch("http://localhost:5000/api/vehicles/list", { credentials: "include" }),
      ]);
      setDrivers(await driversRes.json());
      setVehicles(await vehiclesRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `http://localhost:5000/api/trips/${editingId}` : "http://localhost:5000/api/trips";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingId ? "Trip updated!" : "Trip added!");
        setShowForm(false);
        setEditingId(null);
        setFormData({
          DriverID: "",
          VehicleCode: "",
          DepartureLocation: "",
          Destination: "",
          DepartureDate: "",
          ReturnDate: "",
          FuelUsed: "",
          TripStatus: "Scheduled",
        });
        fetchTrips();
      }
    } catch (error) {
      console.error("Error saving trip:", error);
    }
  };

  const handleEdit = (trip) => {
    setFormData({
      DriverID: trip.DriverID,
      VehicleCode: trip.VehicleCode,
      DepartureLocation: trip.DepartureLocation,
      Destination: trip.Destination,
      DepartureDate: trip.DepartureDate ? trip.DepartureDate.slice(0, 16) : "",
      ReturnDate: trip.ReturnDate ? trip.ReturnDate.slice(0, 16) : "",
      FuelUsed: trip.FuelUsed,
      TripStatus: trip.TripStatus,
    });
    setEditingId(trip.TripID);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this trip?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/trips/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (response.ok) {
          alert("Trip deleted!");
          fetchTrips();
        }
      } catch (error) {
        console.error("Error deleting trip:", error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Trip Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          + Add Trip
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.DriverID}
              onChange={(e) => setFormData({ ...formData, DriverID: e.target.value })}
              required
            >
              <option value="">Select Driver</option>
              {drivers.map((d) => (
                <option key={d.DriverID} value={d.DriverID}>
                  {d.FirstName} {d.LastName}
                </option>
              ))}
            </select>
            <select
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.VehicleCode}
              onChange={(e) => setFormData({ ...formData, VehicleCode: e.target.value })}
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.VehicleCode} value={v.VehicleCode}>
                  {v.PlateNumber}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Departure Location"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.DepartureLocation}
              onChange={(e) => setFormData({ ...formData, DepartureLocation: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Destination"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.Destination}
              onChange={(e) => setFormData({ ...formData, Destination: e.target.value })}
              required
            />
            <input
              type="datetime-local"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.DepartureDate}
              onChange={(e) => setFormData({ ...formData, DepartureDate: e.target.value })}
              required
            />
            <input
              type="datetime-local"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.ReturnDate}
              onChange={(e) => setFormData({ ...formData, ReturnDate: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Fuel Used (Liters)"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.FuelUsed}
              onChange={(e) => setFormData({ ...formData, FuelUsed: e.target.value })}
            />
            <select
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.TripStatus}
              onChange={(e) => setFormData({ ...formData, TripStatus: e.target.value })}
            >
              <option>Scheduled</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition col-span-2"
            >
              {editingId ? "Update Trip" : "Save Trip"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Driver</th>
              <th className="border p-2">Vehicle</th>
              <th className="border p-2">Route</th>
              <th className="border p-2">Departure</th>
              <th className="border p-2">Fuel</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.TripID}>
                <td className="border p-2">{t.TripID}</td>
                <td className="border p-2">{t.DriverName}</td>
                <td className="border p-2">{t.PlateNumber}</td>
                <td className="border p-2">{t.DepartureLocation} → {t.Destination}</td>
                <td className="border p-2">{new Date(t.DepartureDate).toLocaleDateString()}</td>
                <td className="border p-2">{t.FuelUsed} L</td>
                <td className="border p-2">{t.TripStatus}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-1 hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.TripID)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Trips;