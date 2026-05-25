import React, { useState, useEffect } from "react";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Gender: "Male",
    Telephone: "",
    LicenseNumber: "",
    Address: "",
    HireDate: "",
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/drivers", {
        credentials: "include",
      });
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Driver added successfully!");
        setShowForm(false);
        setFormData({
          FirstName: "",
          LastName: "",
          Gender: "Male",
          Telephone: "",
          LicenseNumber: "",
          Address: "",
          HireDate: "",
        });
        fetchDrivers();
      }
    } catch (error) {
      console.error("Error adding driver:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Driver Management</h1>
        <button onClick={() => setShowForm(!showForm)}className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"> + Add Driver
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text"placeholder="First Name"className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"value={formData.FirstName}onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}required/>
            <input type="text"placeholder="Last Name"className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"value={formData.LastName}onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}required/>
            <select className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"value={formData.Gender}onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
               <option>Married</option>
            </select>
            <input type="text"placeholder="Telephone"className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"value={formData.Telephone}onChange={(e) => setFormData({ ...formData, Telephone: e.target.value })}required/>
            <input type="text"placeholder="License Number"className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"value={formData.LicenseNumber}onChange={(e) => setFormData({ ...formData, LicenseNumber: e.target.value })}required/>
            <input type="text" placeholder="Address"className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.Address}
              onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
            />
            <input
              type="date"
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.HireDate}
              onChange={(e) => setFormData({ ...formData, HireDate: e.target.value })}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition col-span-2"
            >
              Save Driver
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Gender</th>
              <th className="border p-2">Telephone</th>
              <th className="border p-2">License</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.DriverID}>
                <td className="border p-2">{driver.DriverID}</td>
                <td className="border p-2">{driver.FirstName} {driver.LastName}</td>
                <td className="border p-2">{driver.Gender}</td>
                <td className="border p-2">{driver.Telephone}</td>
                <td className="border p-2">{driver.LicenseNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Drivers;