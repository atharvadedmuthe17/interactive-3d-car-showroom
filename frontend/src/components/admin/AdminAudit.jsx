import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/audit-logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-cyan-400 font-mono animate-pulse">Loading audit logs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-white">Audit Logs</h2>
          <p className="text-white/40 text-sm mt-1">Track administrative actions across the platform</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40 bg-black/40">
              <th className="p-5 font-medium">Timestamp</th>
              <th className="p-5 font-medium">Admin</th>
              <th className="p-5 font-medium">Action</th>
              <th className="p-5 font-medium">Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-5 text-xs text-white/40">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-5 text-sm font-bold text-emerald-400">{log.username || 'System'}</td>
                <td className="p-5 text-sm font-bold text-white">{log.action}</td>
                <td className="p-5 text-xs text-white/60">
                  <span className="bg-white/5 px-2 py-1 rounded text-cyan-400 font-mono">
                    {log.target_type}: {log.target_id}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <div className="p-10 text-center text-white/40 text-sm">No audit logs found.</div>}
      </div>
    </div>
  );
}
