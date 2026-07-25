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

// Shuffle faces to get uniform distribution when we truncate
for (let i = model.faces.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [model.faces[i], model.faces[j]] = [model.faces[j], model.faces[i]];
}

for (let f = 0; f < model.faces.length; f++) {
  const face = model.faces[f];
  if (vertexCount + (face.vertices.length - 2) * 3 > 65500) break; // Keep it under 65536
  
  // Triangulate polygons (assuming convex)
  for (let i = 1; i < face.vertices.length - 1; i++) {
    const tri = [face.vertices[0], face.vertices[i], face.vertices[i+1]];
    
    tri.forEach(v => {
      // Key uniquely identifies the pos/normal/uv combination
      const key = `${v.vertexIndex}/${v.textureCoordsIndex}/${v.vertexNormalIndex}`;
      
      if (vertexMap.has(key)) {
        indices.push(vertexMap.get(key));
      } else {
        const p = model.vertices[v.vertexIndex - 1] || {x:0, y:0, z:0};
        const n = model.vertexNormals[v.vertexNormalIndex - 1] || {x:0, y:1, z:0};
        const uv = model.textureCoords[v.textureCoordsIndex - 1] || {u:0, v:0};
        
        positions.push(p.x * scale, p.y * scale, p.z * scale);
        normals.push(n.x, n.y, n.z);
        uvs.push(uv.u, uv.v);
        
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
  
  console.log(`✅ Successfully converted my_logo.obj!`);
  console.log(`Saved logo to: ${outputFile}`);
  console.log(`Saved particles to: ${particleFile}`);
});
