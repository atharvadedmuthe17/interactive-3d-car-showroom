import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cars as staticCars } from "../data/cars";

const CarContext = createContext();

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/cars?t=${Date.now()}`);
      const data = await res.json();
      
      if (data.success) {
        // 🔥 Merge static cars with dynamic database cars
        // Using Map to avoid duplicates if any slug matches
        const mergedMap = new Map();
        
        staticCars.forEach(c => mergedMap.set(c.slug, c));
        data.data.forEach(c => mergedMap.set(c.slug, c));

        const finalCars = Array.from(mergedMap.values());
        setCars(finalCars);
      }
    } catch (err) {
      console.error("Failed to fetch cars:", err);
      // If server fails, at least show static cars
      setCars(staticCars);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => { fetchCars(); }, [fetchCars]);

  // Refetch when user returns to tab (covers admin adding car in another tab)
  useEffect(() => {
    const onFocus = () => fetchCars();
    const onVisible = () => { if (document.visibilityState === "visible") fetchCars(); };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchCars]);

  return (
    <CarContext.Provider value={{ cars, loading, fetchCars }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCars = () => useContext(CarContext);
