# GreenHub Garden Tileset

Textures isométriques pour le rendu du jardin et de la serre.

## Structure

```
tileset/
├── index.js           # Exports centralisés
├── garden-tileset.js  # Tileset complet
└── README.md          # Documentation
```

## Catégories

### 1. Terrains (`TERRAIN_TILES`)

| ID | Nom | Description |
|---|---|---|
| `grass` | Herbe | Herbe standard avec variations |
| `grassLight` | Herbe claire | Pour zones ensoleillées |
| `grassDark` | Herbe sombre | Pour zones ombragées |
| `dirt` | Terre | Terre standard |
| `dirtWet` | Terre humide | Terre après pluie/arrosage |
| `soilSow` | Terre semis | Avec sillons et graines |
| `soilGerm` | Terre germination | Préparée pour germination |
| `soilReady` | Terre prête | Prête pour repiquage |
| `sand` | Sable | Sable sec |
| `sandWet` | Sable humide | Sable humide |
| `water` | Eau | Eau animée |
| `waterPond` | Eau bassin | Eau de bassin |

### 2. Allées (`PATH_TILES`)

| ID | Nom | Vitesse | Durabilité |
|---|---|---|---|
| `stoneCobble` | Pavés pierre | 1.0 | 100 |
| `stoneRough` | Pierre brute | 0.95 | - |
| `stoneFlagstone` | Dalles pierre | 1.0 | - |
| `gravelGrey` | Gravier gris | 0.9 | - |
| `gravelBrown` | Gravier brun | 0.9 | - |
| `gravelWhite` | Gravier blanc | 0.9 | - |
| `brick` | Briques | 1.0 | - |
| `brickOld` | Briques vieillies | 0.95 | - |
| `woodPlank` | Planches bois | 1.0 | 60 |
| `woodPlankDark` | Planches foncées | 1.0 | 60 |
| `slate` | Ardoise | 1.0 | - |
| `concrete` | Béton | 1.0 | - |
| `concreteTiles` | Dalles béton | 1.0 | - |

### 3. Structures (`STRUCTURE_TILES`)

| ID | Nom | Type | Taille |
|---|---|---|---|
| `shedWood` | Cabanon bois | shed | 2×2 |
| `shedWoodRustic` | Cabanon rustique | shed | 2×2 |
| `shedMetal` | Cabanon métal | shed | 2×2 |
| `shedMetalGreen` | Cabanon métal vert | shed | 2×2 |
| `greenhouse` | Serre | greenhouse | 2×2 |
| `greenhouseLarge` | Grande serre | greenhouse | 3×2 |
| `compostBin` | Compostier | compost | 1×1 |
| `compostOpen` | Compost ouvert | compost | 1×1 |
| `rainBarrel` | Cuve récupération | barrel | 1×1 |
| `waterButt` | Tonneau eau | barrel | 1×1 |
| `pond` | Bassin | pond | 2×1 |
| `pondNatural` | Mare naturelle | pond | 2×1 |
| `fenceWood` | Clôture bois | fence | 1×1 |
| `fencePicket` | Palissade | fence | 1×1 |

### 4. Décorations (`DECOR_TILES`)

#### Bordures
- `borderWood` - Bordure bois
- `borderStone` - Bordure pierre
- `borderBrick` - Bordure brique
- `borderLog` - Bordure rondins

#### Escaliers
- `stepsWood` - Marches bois
- `stepsStone` - Marches pierre
- `stepsBrick` - Marches brique

#### Pots
- `potTerraCotta` - Pot terre cuite
- `potCeramic` - Pot céramique
- `potWood` - Bac bois
- `potMetal` - Pot métal

#### Mobilier
- `benchWood` - Banc bois
- `tableWood` - Table bois
- `chairWood` - Chaise bois

#### Décorations
- `lantern` - Lanterne
- `birdhouse` - Nichoir
- `sundial` - Cadran solaire
- `statue` - Statue

### 5. Végétation (`VEGETATION_TILES`)

| ID | Nom | Type |
|---|---|---|
| `flowerbed` | Massif fleuri | fleurs |
| `tulipRow` | Tulipes | fleurs |
| `roseBush` | Rosier | fleurs |
| `bushRound` | Buisson rond | arbuste |
| `hedge` | Haie | arbuste |
| `shrubFlower` | Arbuste fleuri | arbuste |
| `berryBush` | Framboisier | petit fruit |
| `blueberryBush` | Myrtillier | petit fruit |

### 6. Saisons (`SEASON_MODIFIERS`)

| Saison | Teinte herbe | Teinte feuilles | Boost croissance |
|---|---|---|---|
| `spring` | #7bc844 | #32CD32 | ×1.1 |
| `summer` | #5aab2a | #228B22 | ×1.0 |
| `autumn` | #8a9a40 | #D2691E | ×0.8 |
| `winter` | #e8e8e8 | #a0a0a0 | ×0.3 |

## Utilisation

```javascript
import { TERRAIN_TILES, PATH_TILES, STRUCTURE_TILES } from './tileset';

// Accéder à une texture
const grass = TERRAIN_TILES.grass;
console.log(grass.patterns.top.base); // '#5aab2a'

// Vérifier si c'est praticable
if (grass.walkable) {
  // La vitesse de déplacement
  const speed = grass.speed; // 1.0
}
```

## Dimensions isométriques

```javascript
import { TILE_DIMS } from './tileset';

const { TW, TH, TD } = TILE_DIMS;
// TW = 64 (largeur tile)
// TH = 32 (hauteur tile)
// TD = 22 (profondeur tile)
```

## Patterns SVG

Chaque texture contient des patterns pour les 3 faces isométriques:

1. **top** - Face supérieure (losange)
2. **sideLeft** - Face gauche (parallélogramme)
3. **sideRight** - Face droite (parallélogramme)

Exemple de structure:
```javascript
patterns: {
  top: { base: '#5aab2a', variants: ['#4e9e22', '#62b830'] },
  sideLeft: { base: '#4a9e20', highlight: '#5ab830' },
  sideRight: { base: '#3d8a18', shadow: '#2d7010' },
}
```

## Intégration avec App.jsx

Pour utiliser le tileset dans le composant `IsoDefs()`:

```jsx
import { TERRAIN_TILES, PATH_TILES } from './tileset';

function IsoDefs() {
  return (
    <defs>
      {/* Générer les patterns pour chaque terrain */}
      {Object.entries(TERRAIN_TILES).map(([key, tile]) => (
        <pattern key={tile.id} id={tile.id} ...>
          {/* SVG pattern elements */}
        </pattern>
      ))}
    </defs>
  );
}
```