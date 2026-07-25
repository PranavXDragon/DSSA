const fs = require('fs');
const path = require('path');
const draco3d = require('draco3d');
const OBJFile = require('obj-file-parser');

const inputFile = path.join(process.cwd(), 'my_logo.obj');
const outputFile = path.join(__dirname, '../public/assets/geometry/particles/ds_particles.bin');

if (!fs.existsSync(inputFile)) {
  console.error('Error: Could not find ' + inputFile);
  process.exit(1);
}

const objContent = fs.readFileSync(inputFile, 'utf8');
const objFile = new OBJFile(objContent).parse();

let scale = 0.3; // Restore original scale so it fits perfectly in the incubator

const positions = [];
const normals = [];
const uvs = [];

const TARGET_PARTICLES = 65536;

// 1. Flatten all vertices into a global array
const globalVertices = [];
for (let m = 0; m < objFile.models.length; m++) {
  const model = objFile.models[m];
  for (let i = 0; i < model.vertices.length; i++) {
    globalVertices.push(model.vertices[i]);
  }
}

// 2. Triangulate all faces and calculate surface areas
const triangles = [];
let totalArea = 0;

for (let m = 0; m < objFile.models.length; m++) {
  const model = objFile.models[m];
  for (let f = 0; f < model.faces.length; f++) {
    const face = model.faces[f];
    // Triangulate (assuming convex quads/polygons)
    for (let i = 1; i < face.vertices.length - 1; i++) {
      const v0 = globalVertices[face.vertices[0].vertexIndex - 1];
      const v1 = globalVertices[face.vertices[i].vertexIndex - 1];
      const v2 = globalVertices[face.vertices[i+1].vertexIndex - 1];
      
      // Calculate area
      const ab = {x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z};
      const ac = {x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z};
      const crossx = ab.y * ac.z - ab.z * ac.y;
      const crossy = ab.z * ac.x - ab.x * ac.z;
      const crossz = ab.x * ac.y - ab.y * ac.x;
      const area = 0.5 * Math.sqrt(crossx*crossx + crossy*crossy + crossz*crossz);
      
      triangles.push({v0, v1, v2, area});
      totalArea += area;
    }
  }
}

// 2. Distribute 65536 points across the triangles based on area
const rawPositions = [];
for (let i = 0; i < TARGET_PARTICLES; i++) {
  // Pick a random triangle weighted by area
  let r = Math.random() * totalArea;
  let tri = triangles[triangles.length - 1];
  for (let t = 0; t < triangles.length; t++) {
    r -= triangles[t].area;
    if (r <= 0) {
      tri = triangles[t];
      break;
    }
  }
  
  // Random point in triangle
  let r1 = Math.random();
  let r2 = Math.random();
  if (r1 + r2 > 1) {
    r1 = 1 - r1;
    r2 = 1 - r2;
  }
  const r3 = 1 - r1 - r2;
  
  rawPositions.push({
    x: tri.v0.x * r1 + tri.v1.x * r2 + tri.v2.x * r3,
    y: tri.v0.y * r1 + tri.v1.y * r2 + tri.v2.y * r3,
    z: tri.v0.z * r1 + tri.v1.z * r2 + tri.v2.z * r3
  });
}

// 3. Center and scale the mesh
let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999, minZ = 9999, maxZ = -9999;
for (let i = 0; i < rawPositions.length; i++) {
  const p = rawPositions[i];
  if (p.x < minX) minX = p.x;
  if (p.x > maxX) maxX = p.x;
  if (p.y < minY) minY = p.y;
  if (p.y > maxY) maxY = p.y;
  if (p.z < minZ) minZ = p.z;
  if (p.z > maxZ) maxZ = p.z;
}
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const cz = (minZ + maxZ) / 2;

for (let i = 0; i < rawPositions.length; i++) {
  positions.push((rawPositions[i].x - cx) * scale);
  positions.push((rawPositions[i].y - cy) * scale);
  positions.push((rawPositions[i].z - cz) * scale);
  normals.push(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
  uvs.push(0, 0);
}

draco3d.createEncoderModule({}).then(function(module) {
  const encoder = new module.Encoder();
  const pcBuilder = new module.PointCloudBuilder();
  const dracoPC = new module.PointCloud();

  const numVerts = positions.length / 3;
  
  const posArray = new Float32Array(positions);
  const normArray = new Float32Array(normals);
  const uvArray = new Float32Array(uvs);

  const posId = pcBuilder.AddFloatAttribute(dracoPC, module.POSITION, numVerts, 3, posArray);
  const normId = pcBuilder.AddFloatAttribute(dracoPC, module.NORMAL, numVerts, 3, normArray);
  const uvId = pcBuilder.AddFloatAttribute(dracoPC, module.TEX_COORD, numVerts, 2, uvArray);

  const encodedData = new module.DracoInt8Array();
  
  encoder.SetSpeedOptions(5, 5);
  encoder.SetAttributeQuantization(module.POSITION, 14);
  encoder.SetAttributeQuantization(module.NORMAL, 10);
  encoder.SetAttributeQuantization(module.TEX_COORD, 12);
  
  encoder.EncodePointCloudToDracoBuffer(dracoPC, true, encodedData);

  const dracoBuffer = Buffer.alloc(encodedData.size());
  for (let i = 0; i < encodedData.size(); i++) dracoBuffer[i] = encodedData.GetValue(i);

  module.destroy(dracoPC);
  module.destroy(pcBuilder);
  module.destroy(encoder);
  module.destroy(encodedData);

  const jsonMetaParticles = JSON.stringify({
    name: "DS_Particles",
    type: 0,
    attributes: [["offset", 7], ["random", 7], ["uv", 7]]
  });
  
  const jsonSizeStrParticles = jsonMetaParticles.length.toString().padEnd(10, ' ');
  const headerBufferParticles = Buffer.from(jsonSizeStrParticles + jsonMetaParticles, 'utf8');
  const outputBufferParticles = Buffer.concat([headerBufferParticles, dracoBuffer]);
  
  fs.writeFileSync(outputFile, new Buffer.from(outputBufferParticles));
  
  console.log('✅ Successfully generated perfect particle mesh!');
  console.log('Saved particles to: ' + outputFile);
});
