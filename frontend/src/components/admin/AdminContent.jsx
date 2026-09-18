import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminContent() {
  const [content, setContent] = useState({
    homepage_title: "",
    homepage_subtitle: "",
    show_featured_cars: "true",
    banner_image: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/content");
      const data = await res.json();
      if (data.success && data.content) {
        setContent(data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/content", {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(content)
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Content updated successfully");
      } else {
        setMessage("❌ Failed to update content");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <div className="p-8 text-cyan-400 font-mono animate-pulse">Loading content...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-widest text-white">Content Management</h2>
        <p className="text-white/40 text-sm mt-1">Update website copy and visuals</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 backdrop-blur-xl space-y-6">
        
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Homepage Title</label>
          <input 
            type="text" 
            value={content.homepage_title || ""}
            onChange={(e) => setContent({...content, homepage_title: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Homepage Subtitle</label>
          <textarea 
            value={content.homepage_subtitle || ""}
            onChange={(e) => setContent({...content, homepage_subtitle: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-500 transition-colors h-24 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-black">Banner Image URL</label>
          <input 
            type="text" 
            value={content.banner_image || ""}
            onChange={(e) => setContent({...content, banner_image: e.target.value})}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 py-2">
          <input 
            type="checkbox" 
            id="featured"
            checked={content.show_featured_cars === 'true'}
            onChange={(e) => setContent({...content, show_featured_cars: e.target.checked ? 'true' : 'false'})}
            className="w-5 h-5 accent-cyan-500"
          />
          <label htmlFor="featured" className="text-sm font-bold text-white tracking-wider cursor-pointer">Show Featured Cars on Homepage</label>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-sm font-bold text-emerald-400">{message}</span>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
