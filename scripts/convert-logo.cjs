const fs = require('fs');
const path = require('path');
const draco3d = require('draco3d');
const OBJFile = require('obj-file-parser');

const inputFile = path.join(process.cwd(), 'my_logo.obj');
const outputFile = path.join(__dirname, '../public/assets/geometry/logo/AT_logo.bin');

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Could not find ${inputFile}`);
  console.error('Please place your 3D logo as "my_logo.obj" in the root directory.');
  process.exit(1);
}

const objContent = fs.readFileSync(inputFile, 'utf8');
const objFile = new OBJFile(objContent).parse();
const model = objFile.models[0];

if (!model) {
  console.error('Error: No 3D model found in the OBJ file.');
  process.exit(1);
}

// Convert OBJ to indexed format
const positions = [];
const normals = [];
const uvs = [];
const indices = [];

// A map to reuse identical vertices
const vertexMap = new Map();
let vertexCount = 0;

let scale = 2.1;
try {
  const settingsFile = path.join(__dirname, '../public/assets/data/cms_settings.json');
  if (fs.existsSync(settingsFile)) {
    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    if (settings && settings.logoScale) {
      scale = Number(settings.logoScale);
    }
  }
} catch(e) {
  console.log("Could not read settings file, using default scale.");
}
console.log(`Using scale multiplier: ${scale}`);


let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;

// Find bounds for planar UV mapping
model.vertices.forEach(v => {
  if (v.x < minX) minX = v.x;
  if (v.x > maxX) maxX = v.x;
  if (v.y < minY) minY = v.y;
  if (v.y > maxY) maxY = v.y;
});

// Compute smooth vertex normals
const computedNormals = new Float32Array(model.vertices.length * 3);
model.faces.forEach(face => {
  for (let i = 1; i < face.vertices.length - 1; i++) {
    const v0 = model.vertices[face.vertices[0].vertexIndex - 1];
    const v1 = model.vertices[face.vertices[i].vertexIndex - 1];
    const v2 = model.vertices[face.vertices[i+1].vertexIndex - 1];
    if(!v0 || !v1 || !v2) continue;
    
    // Cross product
    const ax = v1.x - v0.x, ay = v1.y - v0.y, az = v1.z - v0.z;
    const bx = v2.x - v0.x, by = v2.y - v0.y, bz = v2.z - v0.z;
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    
    const i0 = (face.vertices[0].vertexIndex - 1) * 3;
    const i1 = (face.vertices[i].vertexIndex - 1) * 3;
    const i2 = (face.vertices[i+1].vertexIndex - 1) * 3;
    
    computedNormals[i0] += nx; computedNormals[i0+1] += ny; computedNormals[i0+2] += nz;
    computedNormals[i1] += nx; computedNormals[i1+1] += ny; computedNormals[i1+2] += nz;
    computedNormals[i2] += nx; computedNormals[i2+1] += ny; computedNormals[i2+2] += nz;
  }
});

// Normalize the computed normals
for (let i = 0; i < computedNormals.length; i += 3) {
  const len = Math.sqrt(computedNormals[i]**2 + computedNormals[i+1]**2 + computedNormals[i+2]**2);
  if (len > 0) {
    computedNormals[i] /= len;
    computedNormals[i+1] /= len;
    computedNormals[i+2] /= len;
  }
}

// Shuffle faces to get uniform distribution when we truncate
for (let i = model.faces.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [model.faces[i], model.faces[j]] = [model.faces[j], model.faces[i]];
}

for (let f = 0; f < model.faces.length; f++) {
  const face = model.faces[f];
  if (vertexCount + (face.vertices.length - 2) * 3 > 65500) break;
  
  for (let i = 1; i < face.vertices.length - 1; i++) {
    const tri = [face.vertices[0], face.vertices[i], face.vertices[i+1]];
    
    tri.forEach(v => {
      const vIdx = v.vertexIndex - 1;
      const key = `${vIdx}`;
      
      if (vertexMap.has(key)) {
        indices.push(vertexMap.get(key));
      } else {
        const p = model.vertices[vIdx] || {x:0, y:0, z:0};
        
        let nx = computedNormals[vIdx * 3];
        let ny = computedNormals[vIdx * 3 + 1];
        let nz = computedNormals[vIdx * 3 + 2];
        if (isNaN(nx) || isNaN(ny) || isNaN(nz)) { nx = 0; ny = 1; nz = 0; }
        
        let u = (p.x - minX) / (maxX - minX || 1);
        let v_coord = (p.y - minY) / (maxY - minY || 1);
        
        positions.push(p.x * scale, p.y * scale, p.z * scale);
        normals.push(nx, ny, nz);
        uvs.push(u, v_coord);
        
        const idx = vertexCount++;
        vertexMap.set(key, idx);
        indices.push(idx);
      }
    });
  }
}
draco3d.createEncoderModule({}).then(function(module) {
  const encoder = new module.Encoder();
  const meshBuilder = new module.MeshBuilder();
  const dracoMesh = new module.Mesh();

  const numFaces = indices.length / 3;
  const numVerts = positions.length / 3;
  
  const posArray = new Float32Array(positions);
  const normArray = new Float32Array(normals);
  const uvArray = new Float32Array(uvs);
  const indexArray = new Uint32Array(indices);

  meshBuilder.AddFacesToMesh(dracoMesh, numFaces, indexArray);
  
  // The IDs match the ones expected by the engine (7 = float32 in Draco usually, but AT engine maps by name)
  const posId = meshBuilder.AddFloatAttributeToMesh(dracoMesh, module.POSITION, numVerts, 3, posArray);
  const normId = meshBuilder.AddFloatAttributeToMesh(dracoMesh, module.NORMAL, numVerts, 3, normArray);
  const uvId = meshBuilder.AddFloatAttributeToMesh(dracoMesh, module.TEX_COORD, numVerts, 2, uvArray);

  const encodedData = new module.DracoInt8Array();
  
  // Encode
  encoder.SetSpeedOptions(5, 5);
  encoder.SetAttributeQuantization(module.POSITION, 14);
  encoder.SetAttributeQuantization(module.NORMAL, 10);
  encoder.SetAttributeQuantization(module.TEX_COORD, 12);
  encoder.SetAttributeQuantization(module.GENERIC, 8);
  encoder.SetTrackEncodedProperties(true);
  
  encoder.EncodeMeshToDracoBuffer(dracoMesh, encodedData);

  // Extract raw Draco buffer
  const dracoBuffer = Buffer.alloc(encodedData.size());
  for (let i = 0; i < encodedData.size(); i++) {
    dracoBuffer[i] = encodedData.GetValue(i);
  }

  module.destroy(dracoMesh);
  module.destroy(meshBuilder);
  module.destroy(encoder);
  module.destroy(encodedData);

  // Create Active Theory Proprietary Header
  // The engine expects:
  // 1. 10 byte string (size of JSON)
  // 2. JSON string: {"name":"AT_logo","type":0,"attributes":[["position",7],["normal",7],["uv",7]]}
  // 3. Draco Buffer
  
  const jsonMeta = JSON.stringify({
    name: "AT_logo",
    type: 0,
    attributes: [["position", 7], ["normal", 7], ["uv", 7]]
  });
  
  const jsonSizeStr = jsonMeta.length.toString().padEnd(10, ' ');
  const headerBuffer = Buffer.from(jsonSizeStr + jsonMeta, 'utf8');
  
  const outputBuffer = Buffer.concat([headerBuffer, dracoBuffer]);

  // Write to disk
  fs.writeFileSync(outputFile, new Buffer.from(outputBuffer));
  
  // Create particle-specific header as a Point Cloud (type: 1)
  const jsonMetaParticles = JSON.stringify({
    name: "DS_Particles",
    type: 0,
    attributes: [["offset", 7], ["random", 7], ["uv", 7]]
  });
  
  const jsonSizeStrParticles = jsonMetaParticles.length.toString().padEnd(10, ' ');
  const headerBufferParticles = Buffer.from(jsonSizeStrParticles + jsonMetaParticles, 'utf8');
  const outputBufferParticles = Buffer.concat([headerBufferParticles, dracoBuffer]);
  
  const particleFile = path.join(__dirname, '../public/assets/geometry/particles/at_logo.bin');
  fs.writeFileSync(particleFile, new Buffer.from(outputBufferParticles));
  
  const dsParticleFile = path.join(__dirname, '../public/assets/geometry/particles/ds_particles.bin');
  fs.writeFileSync(dsParticleFile, new Buffer.from(outputBufferParticles));

  try {
    fs.mkdirSync(path.join(__dirname, '../dist/assets/geometry/logo'), { recursive: true });
    fs.mkdirSync(path.join(__dirname, '../dist/assets/geometry/particles'), { recursive: true });
    fs.copyFileSync(outputFile, path.join(__dirname, '../dist/assets/geometry/logo/AT_logo.bin'));
    fs.copyFileSync(particleFile, path.join(__dirname, '../dist/assets/geometry/particles/at_logo.bin'));
    fs.copyFileSync(dsParticleFile, path.join(__dirname, '../dist/assets/geometry/particles/ds_particles.bin'));
  } catch(e) {}

  console.log(`✅ Successfully converted my_logo.obj!`);
  console.log(`Saved logo to: ${outputFile}`);
  console.log(`Saved particles to: ${particleFile} & ds_particles.bin`);
});
