const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
}

// ========== SHADERS ==========
const vsSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
varying lowp vec4 vColor;
void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
}
`;

const fsSource = `
varying lowp vec4 vColor;
void main() {
    gl_FragColor = vColor;
}
`;

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

const vs = compileShader(gl.VERTEX_SHADER, vsSource);
const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

// ========== ATTRIBUTES / UNIFORMS ==========
const attribPos = gl.getAttribLocation(program, "aVertexPosition");
const attribColor = gl.getAttribLocation(program, "aVertexColor");
const uniProjection = gl.getUniformLocation(program, "uProjectionMatrix");
const uniModelView = gl.getUniformLocation(program, "uModelViewMatrix");

// ========== CUBE GEOMETRY ==========

// 24 vertices (4 per face × 6 faces)
const positions = [
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,

  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,

  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,

  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0,
];


// One color per face (same color for all 4 vertices of each face)
const faceColors = [
    [1,0,0,1],  // Front - red
    [0,1,0,1],  // Back - green
    [0,0,1,1],  // Top - blue
    [1,1,0,1],  // Bottom - yellow
    [1,0,1,1],  // Right - purple
    [0,1,1,1],  // Left - cyan
];

let colors = [];
for (let c of faceColors) {
    colors.push(...c, ...c, ...c, ...c);
}

// Indices (two triangles per face)
const indices = [
    0,1,2, 0,2,3,       // Front
    4,5,6, 4,6,7,       // Back
    8,9,10, 8,10,11,    // Top
    12,13,14, 12,14,15, // Bottom
    16,17,18, 16,18,19, // Right
    20,21,22, 20,22,23  // Left
];

// ========== BUFFERS ==========
function makeArrayBuffer(data) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    return buf;
}

const posBuffer = makeArrayBuffer(positions);
const colorBuffer = makeArrayBuffer(colors);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Disable backface culling (easy fix)
gl.disable(gl.CULL_FACE);

let rotation = 0;

function draw() {
    resizeCanvas();

    gl.viewport(0, 0, canvas.width, canvas.height);
    
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);

    // Perspective
    const projection = mat4.create();
    mat4.perspective(projection, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

    // ModelView
    const modelView = mat4.create();
    mat4.translate(modelView, modelView, [0, 0, -6]);
    mat4.rotate(modelView, modelView, rotation * 0.7, [1, 0, 0]); // X axis
    mat4.rotate(modelView, modelView, rotation * 0.9, [0, 1, 0]); // Y axis
    mat4.rotate(modelView, modelView, rotation * 1.3, [0, 0, 1]); // Z axis



    gl.uniformMatrix4fv(uniProjection, false, projection);
    gl.uniformMatrix4fv(uniModelView, false, modelView);

    // bind positions
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribPos);

    // bind colors
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(attribColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    rotation += 0.01;
    requestAnimationFrame(draw);
}

function resizeCanvas() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
}

draw();