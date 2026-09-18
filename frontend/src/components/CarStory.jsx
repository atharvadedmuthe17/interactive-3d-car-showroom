import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// One full-screen section per car
function CarSection({ car }) {
  const sectionRef = useRef();
  const buttonsRef = useRef();
  const nameRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const section = sectionRef.current;
    const triggers = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: "20% center",
        end: "50% center",
        animation: gsap.fromTo(
          nameRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        ),
        scrub: true,
      })
    );

    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: "40% center",
        end: "60% center",
        animation: gsap.fromTo(
          buttonsRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        ),
        scrub: true,
      })
    );

    // Only kill THIS section's triggers on unmount — not all triggers globally
    return () => triggers.forEach((t) => t.kill());
  }, [car.id]);

  return (
    <section ref={sectionRef} className="h-screen relative flex items-center justify-center">
      {/* Car name + price */}
      <div
        ref={nameRef}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <p className="text-white/30 text-[11px] uppercase tracking-[0.5em] font-bold">{car.name}</p>
        <p className="text-cyan-400 text-[10px] uppercase tracking-widest mt-2">₹ {car.price}</p>
      </div>

      {/* Buttons */}
      <div
        ref={buttonsRef}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-6 z-20"
        style={{ opacity: 0 }}
      >
        <button
          onClick={() => navigate(`/car/${car.slug}`)}
          className="px-8 py-4 bg-white text-black font-bold hover:bg-cyan-400 transition-colors"
        >
          Explore
        </button>
        <button
          onClick={() => navigate(`/booking/${car.slug}`)}
          className="px-8 py-4 border border-white text-white font-bold hover:border-blue-500 hover:text-blue-500 transition-colors"
        >
          Book
        </button>
        <button
          onClick={() => navigate(`/buy/${car.slug}`)}
          className="px-8 py-4 border border-white text-white font-bold hover:border-cyan-400 hover:text-cyan-400 transition-colors"
        >
          Buy
        </button>
      </div>
    </section>
  );
}

export default function CarStory({ cars = [], onCarChange }) {
  const containerRef = useRef();
  // Keep refs to index-change triggers so we can kill only them on re-run
  const indexTriggersRef = useRef([]);

  useEffect(() => {
    if (!cars.length) return;

    // Kill previous index triggers before re-registering
    indexTriggersRef.current.forEach((t) => t.kill());
    indexTriggersRef.current = [];

    // Wait one tick for DOM sections to be in place
    const raf = requestAnimationFrame(() => {
      const children = containerRef.current?.children;
      if (!children) return;

      cars.forEach((car, i) => {
        const section = children[i];
        if (!section) return;

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: () => onCarChange?.(i),
          onEnterBack: () => onCarChange?.(i),
        });

        indexTriggersRef.current.push(trigger);
      });

      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(raf);
      indexTriggersRef.current.forEach((t) => t.kill());
      indexTriggersRef.current = [];
    };
  }, [cars, onCarChange]);

  if (!cars.length) return null;

  return (
    <div ref={containerRef}>
      {cars.map((car) => (
        <CarSection key={car.id} car={car} />
      ))}
    </div>
  );
}
