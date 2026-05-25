import React, { useState, useEffect } from "react";

function Reports() {
  const [tripReport, setTripReport] = useState([]);
  const [fuelReport, setFuelReport] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [trips, fuel] = await Promise.all([
        fetch("http://localhost:5000/api/reports/trip-history", { credentials: "include" }),
        fetch("http://localhost:5000/api/reports/fuel-summary", { credentials: "include" }),
      ]);
      setTripReport(await trips.json());
      setFuelReport(await fuel.json());
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      {/* Trip History Report */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Trip History Report</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Driver Name</th>
                <th className="border p-2">Vehicle Plate</th>
                <th className="border p-2">Departure Location</th>
                <th className="border p-2">Destination</th>
                <th className="border p-2">Departure Date</th>
                <th className="border p-2">Return Date</th>
                <th className="border p-2">Fuel Used</th>
                <th className="border p-2">Trip Status</th>
              </tr>
            </thead>
            <tbody>
              {tripReport.map((trip, index) => (
                <tr key={index}>
                  <td className="border p-2">{trip.DriverName}</td>
                  <td className="border p-2">{trip.PlateNumber}</td>
                  <td className="border p-2">{trip.DepartureLocation}</td>
                  <td className="border p-2">{trip.Destination}</td>
                  <td className="border p-2">
                    {new Date(trip.DepartureDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    {trip.ReturnDate ? new Date(trip.ReturnDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="border p-2">{trip.FuelUsed} L</td>
                  <td className="border p-2">{trip.TripStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuel Usage Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Fuel Usage Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Vehicle Plate</th>
                <th className="border p-2">Vehicle Type</th>
                <th className="border p-2">Total Trips</th>
                <th className="border p-2">Total Fuel Used (L)</th>
              </tr>
            </thead>
            <tbody>
              {fuelReport.map((vehicle, index) => (
                <tr key={index}>
                  <td className="border p-2">{vehicle.PlateNumber}</td>
                  <td className="border p-2">{vehicle.VehicleType}</td>
                  <td className="border p-2">{vehicle.TotalTrips}</td>
                  <td className="border p-2">{vehicle.TotalFuelUsed} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;