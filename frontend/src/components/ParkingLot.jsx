import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { useCars } from "../context/CarContext";

function ParkingCar({ model, position }) {
  const { scene } = useGLTF(model);
  const ref = useRef();
  return (
    <primitive
      ref={ref}
      object={scene.clone()}
      scale={2.5}
      position={position}
    />
  );
}

// Spread N cars evenly across the back row
function buildPositions(count) {
  if (count === 0) return [];
  const spacing = 12;
  const totalWidth = (count - 1) * spacing;
  const startX = -totalWidth / 2;
  return Array.from({ length: count }, (_, i) => [
    startX + i * spacing,
    -1.4,
    -12,
  ]);
}

export default function ParkingLot() {
  const { cars } = useCars();
  if (!cars.length) return null;

  const positions = buildPositions(cars.length);

  return (
    <>
      {cars.map((car, i) => (
        <ParkingCar
          key={car.id}
          model={car.model_url}
          position={positions[i]}
        />
      ))}
    </>
  );
}
