import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cars");
      const data = await res.json();
      if (data.success) {
        setCars(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCar = async (id, payload) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/cars/${id}/stock`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchCars();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCar = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/delete-car/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCars();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-cyan-400 font-mono animate-pulse">Loading cars...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-white">Inventory</h2>
          <p className="text-white/40 text-sm mt-1">Manage vehicles and stock levels</p>
        </div>
        <button 
          onClick={() => navigate('/admin/add-car')}
          className="px-6 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-cyan-400 transition-colors"
        >
          + Add New Car
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40 bg-black/40">
              <th className="p-5 font-medium">Model</th>
              <th className="p-5 font-medium">Price</th>
              <th className="p-5 font-medium text-center">Stock</th>
              <th className="p-5 font-medium text-center">Featured</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-5">
                  <p className="text-sm font-bold text-white">{car.name}</p>
                  <p className="text-[10px] text-white/40">{car.slug}</p>
                </td>
                <td className="p-5 text-sm font-mono text-cyan-400 italic font-bold">₹ {car.price}</td>
                <td className="p-5 text-center">
                  <input 
                    type="number" 
                    min="0"
                    value={car.stock !== undefined ? car.stock : 1}
                    onChange={(e) => updateCar(car.id, { stock: parseInt(e.target.value) })}
                    className="w-16 bg-black border border-white/10 text-white text-center rounded py-1"
                  />
                </td>
                <td className="p-5 text-center">
                  <input 
                    type="checkbox"
                    checked={car.is_featured || false}
                    onChange={(e) => updateCar(car.id, { is_featured: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => deleteCar(car.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && <div className="p-10 text-center text-white/40 text-sm">No cars in inventory.</div>}
      </div>
    </div>
  );
}
