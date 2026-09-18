import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-cyan-400 font-mono animate-pulse">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-white">Bookings</h2>
          <p className="text-white/40 text-sm mt-1">Monitor and manage reservations</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40 bg-black/40">
              <th className="p-5 font-medium">User</th>
              <th className="p-5 font-medium">Car Name</th>
              <th className="p-5 font-medium">Type</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-5">
                  <p className="text-sm font-bold text-white">{b.username}</p>
                  <p className="text-[10px] text-white/40">{b.email}</p>
                </td>
                <td className="p-5 text-sm font-bold text-white">{b.car_name}</td>
                <td className="p-5 text-xs text-white/60">{b.booking_type}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${b.status === 'Confirmed' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : b.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <select 
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    className="bg-black border border-white/10 text-white text-xs p-2 rounded outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <div className="p-10 text-center text-white/40 text-sm">No bookings found.</div>}
      </div>
    </div>
  );
}
