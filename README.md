# ARES — Autonomous Route Exploration System
### NASA Space Apps Challenge 2026 | Planetary Science & Mission Planning Platform

> **"Transforming scattered planetary observations into actionable exploration context."**

ARES is an interactive Martian exploration and mission-planning decision-support platform designed to support astronauts and mission planners conducting Marswalk extravehicular activities (EVAs). It unifies multi-mission NASA scientific datasets into a single tactical mission control interface.

---

## 🚀 Key Features

### 1. Interactive Multi-Layer Mars Mapping (NASA Mars Trek Integration)
* **Real NASA WMTS Tile Integration:** Connects directly to NASA Solar System Treks RESTful WMTS services.
* **Optical Layer:** Viking Orbiter MDIM 2.1 calibrated global color mosaic (232m/px).
* **Topographic Layer:** Mars Global Surveyor (MGS) MOLA Color Shaded Relief & high-resolution ESA HRSC blend.
* **Thermal Infrared Layers:** Mars Odyssey THEMIS Daytime & Nighttime IR mosaics for thermal inertia and rock abundance.
* **Resilient Offline Tile Fallbacks:** Canvas-rendered mathematical Mars surface shaders if network/CORS issues occur.

### 2. Intelligent A* Route Planning Engine
* **8-Directional Graph Search:** Explores Gale Crater & Mount Sharp traversing 56×72 geospatial grid nodes using a high-performance binary min-heap.
* **Multi-Objective Cost Model ($C = w_d D + w_s S + w_h H$):**
  * $D$: Distance in kilometers.
  * $S$: Slope gradient ($S = \arctan(|\Delta z| / d)$) with non-linear penalties for slopes $> 14^\circ$.
  * $H$: Hazard intensity (penalizing loose dune sand, active scarps, boulder fields).
* **Three Traversal Profiles:**
  * **Safest:** Maximizes terrain stability and bypasses dangerous sand dunes & steep cliffs.
  * **Shortest:** Directly minimizes traversal distance.
  * **Science-Focused:** Optimizes path to visit high-value geological targets (Boxwork structures, sulfate contacts).

### 3. Route Scoring & Trade-off Matrix
* **Formula:** $\text{Score} = 100 - (aR + bT + cD) + \text{ScienceBonus}$
* **Transparent Metrics:** Distance (km), Duration (hrs at $0.38g$ pace), Max & Avg Slope (°), Hazard Exposure (%), Bioenergetic Calorie Burn (kcal).

### 4. Destination & Scientific Location Inspector
* Click anywhere on Mars or select scientific targets to inspect:
  * IAU2000 Martian Coordinates (Decimal & DMS).
  * MOLA Elevation & Gale Crater Stratigraphy.
  * Geological formation, rock roughness, and structural stability.
  * THEMIS Thermal estimates (Day/Night surface temps).
  * High-resolution Curiosity & Perseverance rover surface images.

### 5. Historical MSL RAD Dosimetry Panel
* Real measurements from Curiosity's **Radiation Assessment Detector (RAD)** across mission Sols.
* Astronaut EVA Dosage Calculator based on traverse duration.
* SPE (Solar Particle Event) alert toggle.
* Contextual comparison to Earth natural background and transatlantic flight exposures.

### 6. Marswalk EVA Briefing Directive Generator
* Generates an operational mission directive with waypoints, hazard mitigation protocols, radiation assessment, and contingency abort criteria.
* One-click Export to Markdown, printable view, or clipboard.

---

## 🛠 Tech Stack & Architecture

* **Frontend:** React 19 + Vite (ESNext)
* **Mapping:** OpenLayers (`ol`) with `proj4` IAU2000 / Equirectangular projection
* **Pathfinding:** Custom optimized A* engine with Binary Min-Heap
* **Styling:** Tailwind CSS with NASA Mission Control tactical dark palette:
  * `--bg`: `#17191c`
  * `--surface`: `#22262b`
  * `--accent`: `#c47b50` (Mars Terracotta)
  * `--cyan`: `#38bdf8` (Tactical telemetry)
  * `--danger`: `#cf665d`
  * `--success`: `#91a68b`
* **Icons & Animation:** Lucide React & Framer Motion
* **Typography:** Manrope (UI) + JetBrains Mono (Telemetry)

---

## 🏁 Quickstart

```bash
# Navigate to project folder
cd ares

# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Run automated validation test suite
node test_ares_engine.js

# Build production bundle
npm run build
```

---

## 📜 Scientific Integrity & Provenance

* **Decision Support Prototype:** ARES is designed as a decision-support and mission-planning prototype, not a flight-certified autonomous life-support or safety system.
* **Historical Data:** MSL RAD measurements are historical rover observations, not real-time planetary weather forecasts.
* **Coarse vs Fine Topography:** MOLA data represents regional topography; localized meter-scale obstacles require tactical rover/suit sensor validation.
