# Maryam Sparkle — 3D Jewelry Asset Pipeline (.glb / .gltf)

This directory is the production destination for real 3D jewelry assets rendered by the `Real3DProductViewer` component.

---

## Supported Formats

- **Format**: Binary glTF (`.glb`) — Preferred for single-file delivery with embedded textures and buffers.
- **Alternative**: Text glTF (`.gltf` + `.bin` + texture images).
- **Target Scale**: 1 Three.js unit = 1 decimeter (or 10 cm). The `Real3DProductViewer` automatically calculates `THREE.Box3` bounding geometry and centers + fits any arbitrary dimensions.

---

## Step-by-Step Asset Integration Workflow

1. **Model Export**:
   - In Blender, Rhino, or ZBrush, export the jewelry piece (beads, links, clasps, pendants, gemstones) as a standard `.glb` file.
   - Ensure origins are centered on the piece.

2. **Mesh & Texture Optimization**:
   - Aim for 15,000–45,000 polygons for smooth mobile WebGL frame rates (60 FPS).
   - Textures: 1024x1024 or 2048x2048 PBR maps (BaseColor, MetallicRoughness, Normal map).
   - Use `gltf-transform` to compress with Draco or meshopt if file size exceeds 3 MB:
     ```bash
     npx @gltf-transform/cli optimize input.glb output.glb --compress draco
     ```

3. **Placement**:
   - Copy the optimized file into:
     ```
     public/models/jewelry/<piece-name>-001.glb
     ```
   - For example:
     - `public/models/jewelry/bracelet-001.glb`
     - `public/models/jewelry/necklace-001.glb`
     - `public/models/jewelry/earrings-001.glb`

4. **Product Catalog Association**:
   - Open `frontend/src/data/products.ts` (or the Supabase `products` table).
   - Add the relative public path to the product definition:
     ```typescript
     {
       id: "...",
       name: "Pink Pearl & Gold Sparkle Bracelet",
       image: "/products/bracelet.jpg",
       model3dUrl: "/models/jewelry/bracelet-001.glb",
       model3dPoster: "/products/bracelet.jpg",
       has3dModel: true
     }
     ```

5. **Automatic Fallback Verification**:
   - If `model3dUrl` is omitted or unavailable, the viewer seamlessly displays high-resolution atelier photography.
   - When a valid `.glb` is provided, a `[ Photos ]` / `[ 3D View ]` switcher appears automatically.
