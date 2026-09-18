import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "./Navbar.css"; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth(); 
  const [visible, setVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); 

  useEffect(() => {
    if (!loading && user && (location.pathname === "/login" || location.pathname === "/register")) {
      navigate("/home#main-content", { replace: true });
    }

    if ((location.pathname !== "/" && location.pathname !== "/intro") || location.hash === "#main-content") {
      setVisible(true);
    } else {
      let lastVisible = false;
      const handleScroll = () => {
        const totalScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        const shouldBeVisible = currentScroll >= totalScrollableHeight - 50;
        
        if (shouldBeVisible !== lastVisible) {
          setVisible(shouldBeVisible);
          lastVisible = shouldBeVisible;
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [location.pathname, user, navigate, loading]);

  useEffect(() => {
    const closeDropdown = () => setShowDropdown(false);
    if (showDropdown) window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, [showDropdown]);

  // 🔥 IMPORTANT: Maine yahan se Tailwind ki purani background/border classes hata di hain
  return (
    <nav className={`navbar-mac-main ${visible ? "nav-visible" : "nav-hidden"}`}>
      <div className="flex items-center justify-between w-full">
        {/* LOGO */}
        <h1 onClick={() => navigate("/")} className="text-2xl font-black italic tracking-tighter cursor-pointer text-white hover:text-blue-500 transition-colors">
          ADYX
        </h1>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-white/40">
          <button className="hover:text-white transition-all hover:tracking-[0.5em]" onClick={() => navigate("/")}>Home</button>
          <button className="hover:text-white transition-all hover:tracking-[0.5em]" onClick={() => navigate("/cars")}>Cars</button>
          <button className="hover:text-white transition-all hover:tracking-[0.5em]" onClick={() => navigate("/about")}>About</button> 
          <button className="hover:text-white transition-all hover:tracking-[0.5em]" onClick={() => navigate("/contact")}>Contact</button> 
        </div>

        {/* PROFILE / LOGIN SECTION */}
        <div className="flex items-center gap-4">
          {!loading && user ? (
            <div className="relative flex items-center gap-4 profile-container-mac" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>
              {/* User Label styled in CSS */}
              <span className="user-label-mac hidden lg:block">{user.username}</span>
              
              <div className="relative group">
                <img 
                  src={user.profile_pic ? user.profile_pic : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                  alt="Profile" 
                  className="navbar-avatar-mac"
                  onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                />
                
                {showDropdown && (
                  <div className="dropdown-menu-adyx">
                    <button onClick={() => navigate("/profile")} className="dropdown-item italic font-black">Profile Settings</button>
                    <div className="divider-adyx"></div>
                    <button onClick={logout} className="dropdown-item logout-btn italic font-black">Sign Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="px-6 py-2 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500 text-white rounded-full">
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;