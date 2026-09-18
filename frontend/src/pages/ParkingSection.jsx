import { useNavigate } from "react-router-dom";

import { useNavigate } from "react-router-dom";

export default function ParkingSection() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h2 className="text-5xl font-bold mb-10">Choose Your Ride</h2>

      <button
        onClick={() => navigate("/cars")}
        className="px-8 py-4 bg-cyan-500 rounded-xl"
      >
        View Cars
      </button>
    </section>
  );
}

export default function ParkingSection() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h2 className="text-5xl font-bold mb-10">Choose Your Ride</h2>

      <button
        onClick={() => navigate("/cars")}
        className="px-8 py-4 bg-cyan-500 rounded-xl"
      >
        View Cars
      </button>
    </section>
  );
}