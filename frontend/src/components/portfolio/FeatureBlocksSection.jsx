import React from "react";
import FeatureBlock from "./FeatureBlock";

const blocks = [
  {
    title: "Precision in Motion",
    text: "Engineered for control. Designed to respond instantly. Every curve, every line, built with intent.",
    modelPath: "/models/audi_r8.glb",
    isReversed: false,
  },
  {
    title: "Future Meets Performance",
    text: "Electric innovation fused with aggressive design. A glimpse into the next generation of driving.",
    modelPath: "/models/bmw_i8.glb",
    isReversed: true,
  },
  {
    title: "Built to Dominate",
    text: "Wider stance. Stronger presence. Performance that doesn’t ask for attention — it takes it.",
    modelPath: "/models/bmw_m4_widebody.glb",
    isReversed: false,
  },
  {
    title: "Raw Power Unleashed",
    text: "No limits. No compromises. Pure speed engineered for those who demand more.",
    modelPath: "/models/venom.glb",
    isReversed: true,
  },
];

const FeatureBlocksSection = () => {
  return (
    <section id="features" className="w-full">
      {blocks.map((block, index) => (
        <FeatureBlock 
          key={index}
          title={block.title}
          text={block.text}
          modelPath={block.modelPath}
          isReversed={block.isReversed}
        />
      ))}
    </section>
  );
};

export default FeatureBlocksSection;
