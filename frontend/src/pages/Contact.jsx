import React, { useState } from "react";
import axios from "axios";

const Contact = () => {

  const [formData, setFormData] = useState({
    fullName: "",
    model: "",
    location: "",
    message: ""
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/contact", formData);

      setSuccessMessage("Consultation request received successfully.");
      setFormData({
        fullName: "",
        model: "",
        location: "",
        message: ""
      });

    } catch (error) {
      console.error(error);
      setSuccessMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  };
  return (
    <div className="relative min-h-screen bg-[#050507] text-white pt-40 pb-20 px-10 md:px-20 overflow-hidden font-sans italic">
      
      {/* SOFT LUXURY LIGHTING - Clean and Expensive, not Cyberpunk */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        
        {/* LEFT COLUMN: BRAND AUTHORITY */}
        <div className="space-y-12">
          <div>
            <h4 className="text-blue-500 font-bold uppercase tracking-[0.5em] text-[10px] mb-6 italic">
              Private Inquiry
            </h4>
            <h1 className="text-7xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
              BEGIN YOUR <br /> 
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                ACQUISITION.
              </span>
            </h1>
            <div className="space-y-6 max-w-md">
              <p className="text-white font-light text-xl leading-relaxed">
                OWNERSHIP BEGINS WITH A CONVERSATION. TELL US WHICH MODEL DEFINES YOUR PERFORMANCE REQUIREMENTS.
              </p>
              <p className="text-white/50 font-light text-sm tracking-widest uppercase italic border-l border-blue-600 pl-6">
                EVERY ADYX VEHICLE IS DELIVERED THROUGH A PERSONALIZED CONCIERGE EXPERIENCE. OUR SPECIALISTS WILL GUIDE YOU THROUGH CUSTOMIZATION AND DELIVERY TIMELINES.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACQUISITION FORM */}
        <div className="relative">
          <div className="relative bg-[#0a0c12]/40 p-12 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10 font-bold uppercase">
               
               <div className="space-y-2">
                 <label className="text-[10px] tracking-[0.3em] text-white/40 ml-2">Primary Contact</label>
                <input
  name="fullName"
  value={formData.fullName}
  onChange={handleChange}
  className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 focus:bg-white/[0.05] transition-all duration-500 font-bold placeholder:text-white/10 text-white"
  placeholder="FULL NAME"
/>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.3em] text-white/40 ml-2">Model of Interest</label>
                    <input
  name="model"
  value={formData.model}
  onChange={handleChange}
  className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold placeholder:text-white/10"
  placeholder="e.g. ADYX-01"
/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.3em] text-white/40 ml-2">Location</label>
                    <input
  name="location"
  value={formData.location}
  onChange={handleChange}
  className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold placeholder:text-white/10"
  placeholder="CITY / COUNTRY"
/>
                  </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] tracking-[0.3em] text-white/40 ml-2">Acquisition Details</label>
                 <textarea
  name="message"
  value={formData.message}
  onChange={handleChange}
  rows="3"
  className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 focus:bg-white/[0.05] transition-all duration-500 font-bold placeholder:text-white/10 text-white resize-none"
  placeholder="SHARE YOUR SPECIFIC REQUIREMENTS..."
></textarea>
               </div>

               <div className="pt-4">
                {successMessage && (
  <p className="text-green-400 text-sm mt-6 text-center font-bold">
    {successMessage}
  </p>
)}
                 <button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-600 hover:bg-white hover:text-black py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-[12px] transition-all duration-700 shadow-xl active:scale-[0.98]"
>
  {loading ? "SENDING..." : "REQUEST CONSULTATION"}
</button>
                 
                 <div className="mt-8 text-center">
                   <p className="text-[9px] tracking-[0.3em] text-white/30 font-bold uppercase italic">
                     PRIVATE CONSULTATION ONLY. RESPONSE WITHIN 12 HOURS.
                   </p>
                 </div>
               </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};




export default Contact;