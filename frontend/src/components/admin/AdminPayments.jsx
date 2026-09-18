import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/payments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/payments/${id}/refund`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-cyan-400 font-mono animate-pulse">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-white">Payments</h2>
          <p className="text-white/40 text-sm mt-1">Track financial transactions and refunds</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40 bg-black/40">
              <th className="p-5 font-medium">User</th>
              <th className="p-5 font-medium">Amount</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium">Date</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-5">
                  <p className="text-sm font-bold text-white">{p.username || 'Guest'}</p>
                  <p className="text-[10px] text-white/40">{p.email || 'N/A'}</p>
                </td>
                <td className="p-5 text-sm font-mono text-cyan-400 italic font-bold">₹ {p.total}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${p.status === 'Success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : p.status === 'Refunded' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {p.status || 'Pending'}
                  </span>
                </td>
                <td className="p-5 text-xs text-white/40">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="p-5 text-right">
                  {(p.status !== 'Refunded' && p.status !== 'Failed') && (
                    <button 
                      onClick={() => refundPayment(p.id)}
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Mark Refunded
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <div className="p-10 text-center text-white/40 text-sm">No payments found.</div>}
      </div>
    </div>
  );
}
