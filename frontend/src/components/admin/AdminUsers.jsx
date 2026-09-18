import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id, isBlocked) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isBlocked ? "unblock" : "block";
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-cyan-400 font-mono animate-pulse">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-white">Users</h2>
          <p className="text-white/40 text-sm mt-1">Manage platform access and user accounts</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40 bg-black/40">
              <th className="p-5 font-medium">Username</th>
              <th className="p-5 font-medium">Email</th>
              <th className="p-5 font-medium">Role</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-5 text-sm font-bold text-white">{user.username}</td>
                <td className="p-5 text-sm text-white/60">{user.email}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${user.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-5">
                  <span className={`text-xs font-bold ${user.is_blocked ? 'text-red-400' : 'text-emerald-400'}`}>
                    {user.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="p-5 text-right">
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => toggleBlock(user.id, user.is_blocked)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${user.is_blocked ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'}`}
                    >
                      {user.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-10 text-center text-white/40 text-sm">No users found.</div>}
      </div>
    </div>
  );
}
