// ----------------------------------------------------------------- THREE.JS PRACTICE -----------------------------------------------------------------
// three.js documentation I used https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene

const numberOfParticles = 8000;

const particleImage = "https://motionarray.imgix.net/preview-34649aJ93evd9dG_0008.jpg?w=660&q=60&fit=max&auto=format",
particleColor = "0xFFFFFF",
particleSize = 0.2;

const defaultAnimationSpeed = 1,
morphAnimationSpeed = 3;

const triggers = document.getElementsByClassName("triggers")[0].querySelectorAll("span");
  
let stats = new Stats();
stats.showPanel(0);

// Creates WebGL renderer, configures settings based on devices pixel ratio and window size, then appends to HTML
let renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adjusts camera aspect ratio then updates renderer's size to match current window dimensions
function fullScreen() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", fullScreen, false);

let scene = new THREE.Scene();

// Creates perspective camera with 45 degree field of view, clipping at 1 unit and again at 10,000 units to create 3D rendering
let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  10000
);

camera.position.y = 25;
camera.position.z = 36;

let controls = new THREE.OrbitControls(camera);
controls.update();

let particleCount = numberOfParticles;

let spherePoints, cubePoints, rocketPoints, spacemanPoints;

// Adding the particle data to the Three.js objects
let particles = new THREE.Geometry(),
sphereParticles = new THREE.Geometry(),
cubeParticles = new THREE.Geometry(),
rocketParticles = new THREE.Geometry(),
spacemanParticles = new THREE.Geometry();

// Creates specific properties
let pMaterial = new THREE.PointCloudMaterial({
  color: particleColor,
  size: particleSize,
  map: THREE.ImageUtils.loadTexture(particleImage),
  blending: THREE.AdditiveBlending,
  transparent: true,
});

// Creates sets of 3D points
geometry = new THREE.SphereGeometry(5, 30, 30);

spherePoints = THREE.GeometryUtils.randomPointsInGeometry(
  geometry,
  particleCount
);

geometry = new THREE.BoxGeometry(9, 9, 9);

cubePoints = THREE.GeometryUtils.randomPointsInGeometry(
  geometry,
  particleCount
);

const codepenAssetUrl = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/605067/";

// Loads OBJ model of the rocket, scales it, generates points, then creates vertices with specific yOffset and scale factor
objLoader = new THREE.OBJLoader();
objLoader.setPath(codepenAssetUrl);
objLoader.load("CartoonRocket.obj", function (object) {
  object.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      let scale = 2.1;
      let area = new THREE.Box3();
      area.setFromObject(child);
      let yOffset = (area.max.y * scale) / 2;

      child.geometry.scale(scale, scale, scale);
      rocketPoints = THREE.GeometryUtils.randomPointsInBufferGeometry(
        child.geometry,
        particleCount
      );
      createVertices(rocketParticles, rocketPoints, yOffset, 2);
    }
  });
});

// Repeat for astronaut
objLoader = new THREE.OBJLoader();
objLoader.setPath(codepenAssetUrl);
objLoader.load("Astronaut.obj", function (object) {
  object.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      let scale = 4.6;
      let area = new THREE.Box3();
      area.setFromObject(child);
      let yOffset = (area.max.y * scale) / 2;

      child.geometry.scale(scale, scale, scale);
      spacemanPoints = THREE.GeometryUtils.randomPointsInBufferGeometry(
        child.geometry,
        particleCount
      );
      createVertices(spacemanParticles, spacemanPoints, yOffset, 3);
    }
  });
});

// Adds specific number of empty 3D vertices at the origin (0,0,0) to the Three.js particle system so we can position and render
for (let p = 0; p < particleCount; p++) {
  vertex = new THREE.Vector3();
  vertex.x = 0;
  vertex.y = 0;
  vertex.z = 0;

  particles.vertices.push(vertex);
}

createVertices(sphereParticles, spherePoints, null, null);
createVertices(cubeParticles, cubePoints, null, 1);

// Creates 3D vertices using the specified points to adjust the Y-coordinates by subtracting yOffset, then adds them to the Three.js emptyArray so once the trigger
// is specified, it will update an attribute in the triggers array
function createVertices(emptyArray, points, yOffset = 0, trigger = null) {
  for (let p = 0; p < particleCount; p++) {
    vertex = new THREE.Vector3();
    vertex.x = points[p]["x"];
    vertex.y = points[p]["y"] - yOffset;
    vertex.z = points[p]["z"];

    emptyArray.vertices.push(vertex);
  }

  if (trigger !== null) {
    triggers[trigger].setAttribute("data-disabled", false);
  }
}

particleSystem = new THREE.PointCloud(particles, pMaterial);

particleSystem.sortParticles = true;

scene.add(particleSystem);

let normalSpeed = defaultAnimationSpeed / 100,
fullSpeed = morphAnimationSpeed / 100;

const animationVars = {
  speed: normalSpeed,
};

// Updates the rotation of a particle system, marks for update, then renders to create a continuous loop
function animate() {
  stats.begin();
  particleSystem.rotation.y += animationVars.speed;
  particles.verticesNeedUpdate = true;
  stats.end();

  window.requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
setTimeout(toSphere, 500);

// Triggers animation
function toSphere() {
  handleTriggers(0);
  morphTo(sphereParticles);
}

function toCube() {
  handleTriggers(1);
  morphTo(cubeParticles);
}

function toRocket() {
  handleTriggers(2);
  morphTo(rocketParticles);
}

function toSpaceman() {
  handleTriggers(3);
  morphTo(spacemanParticles);
}

// Smoothly transitions to the next shape by adjusting the animation speed and the positions of the particles
function morphTo(newParticles, color = "0xffffff") {
  TweenMax.to(animationVars, 0.3, {
    ease: Power4.easeIn,
    speed: fullSpeed,
    onComplete: slowDown,
  });
  particleSystem.material.color.setHex(color);

  for (let i = 0; i < particles.vertices.length; i++) {
    TweenMax.to(particles.vertices[i], 4, {
      ease: Elastic.easeOut.config(1, 0.75),
      x: newParticles.vertices[i].x,
      y: newParticles.vertices[i].y,
      z: newParticles.vertices[i].z,
    });
  }
}

// Smoothly slowing down the animation speed
function slowDown() {
  TweenMax.to(animationVars, 4, {
    ease: Power2.easeOut,
    speed: normalSpeed,
    delay: 1,
  });
}

triggers[0].addEventListener("click", toSphere);
triggers[1].addEventListener("click", toCube);
triggers[2].addEventListener("click", toRocket);
triggers[3].addEventListener("click", toSpaceman);

// Manages triggers to control user interaction of elements
function handleTriggers(disable) {
  for (let x = 0; x < triggers.length; x++) {
    if (disable === x) {
      triggers[x].setAttribute("data-disabled", true);
    } else {
      triggers[x].setAttribute("data-disabled", false);
    }
  }
}