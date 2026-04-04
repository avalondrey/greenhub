import { PlantDefinition } from "./ai-engine.js";

export function getPlantStageSVG(plantId: string, stageIndex: number, size: number = 24): string {
  const plantData: Record<string, { baseColor: string; stemColor: string; leafColor: string; flowerColor: string; fruitColor: string }> = {
    tomato: { baseColor: "#8B4513", stemColor: "#6B8E23", leafColor: "#228B22", flowerColor: "#FF6347", fruitColor: "#FF0000" },
    carrot: { baseColor: "#8B4513", stemColor: "#DEB887", leafColor: "#006400", flowerColor: "#FFFFFF", fruitColor: "#FF8C00" },
    strawberry: { baseColor: "#8B4513", stemColor: "#CD853F", leafColor: "#008000", flowerColor: "#FFFFFF", fruitColor: "#FF0000" },
    lettuce: { baseColor: "#8B4513", stemColor: "#9ACD32", leafColor: "#90EE90", flowerColor: "#FFFFE0", fruitColor: "#90EE90" },
    basil: { baseColor: "#8B4513", stemColor: "#8FBC8F", leafColor: "#006400", flowerColor: "#FFFFFF", fruitColor: "#006400" },
    pepper: { baseColor: "#8B4513", stemColor: "#696969", leafColor: "#006400", flowerColor: "#FFFFFF", fruitColor: "#FF0000" },
  };

  const data = plantData[plantId] || plantData.tomato;
  const stage = stageIndex % 4;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="image-rendering: crisp-edges">
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
        </pattern>
      </defs>

      <!-- Pot/soil -->
      <rect x="8" y="16" width="8" height="4" fill="${data.baseColor}" />

      <!-- Stem -->
      <rect x="11" y="${stage === 0 ? 14 : stage === 1 ? 10 : stage === 2 ? 6 : 8}" width="2" height="${stage === 0 ? 2 : stage === 1 ? 4 : stage === 2 ? 8 : 6}" fill="${data.stemColor}" />

      <!-- Leaves/Flowers/Fruit based on stage -->
      <g>
        {stage === 0 ? (
          <circle cx="12" cy="13" r="1.5" fill="${data.leafColor}" />
        ) : stage === 1 ? (
          <path d="M10,11 Q8,9 10,7" stroke="${data.leafColor}" stroke-width="1.5" fill="none"/>
          <path d="M14,11 Q16,9 14,7" stroke="${data.leafColor}" stroke-width="1.5" fill="none"/>
        ) : stage === 2 ? (
          <circle cx="12" cy="8" r="3" fill="${data.flowerColor}" />
          <path d="M12,5 L12,7" stroke="${data.stemColor}" stroke-width="1.5" />
          <circle cx="12" cy="5" r="0.5" fill="#FFFFFF" />
        ) : (
          <circle cx="12" cy="9" r="2.5" fill="${data.fruitColor}" />
          <path d="M12,6.5 L12,8" stroke="${data.stemColor}" stroke-width="1" />
          <circle cx="12" cy="6.5" r="0.3" fill="#FFFFFF" />
        )}
      </g>

      <!-- Manga-style cross-hatching overlay for shadows -->
      <rect x="0" y="0" width="24" height="24" fill="url(#hatch)" />
    </svg>
  `;
}