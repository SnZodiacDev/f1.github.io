// script.js

let scene, camera, renderer;
let world; // Physics world
let trackSegments = [];
let car, aiCars = [];
let isDesigningTrack = false;
let speed = 0.1;
let turnSpeed = 0.05;
let carBody;

function init() {
    // Create the scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize physics world
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // Gravity

    // Create the car
    createCar();

    camera.position.set(0, 5, 10);

    animate();
}

function createCar() {
    const carGeometry = new THREE.BoxGeometry(0.5, 0.5, 1);
    const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeometry, carMaterial);
    scene.add(car);
    
    // Physics body for the car
    carBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 1, 0)
    });
    carBody.addShape(new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.5)));
    world.addBody(carBody);
}

function animate() {
    requestAnimationFrame(animate);
    world.step(1/60); // Step physics world

    // Update car position based on physics
    car.position.copy(carBody.position);
    car.quaternion.copy(carBody.quaternion);

    renderer.render(scene, camera);
}

function toggleTrackDesigner() {
    isDesigningTrack = !isDesigningTrack;
    if (isDesigningTrack) {
        console.log("Track Designer Active");
        car.position.set(0, 1, 0);
        camera.position.set(0, 5, 10); // Move camera for designing
    } else {
        console.log("Play Mode Active");
        camera.position.set(0, 5, 10); // Reset camera for racing
    }
}

function addTrackSegment() {
    const trackGeometry = new THREE.BoxGeometry(1, 0.1, 10);
    const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    
    // Position the track segment
    if (trackSegments.length > 0) {
        const lastSegment = trackSegments[trackSegments.length - 1];
        track.position.set(lastSegment.position.x, 0, lastSegment.position.z + 10);
    } else {
        track.position.set(0, 0, 0); // First segment
    }

    scene.add(track);
    trackSegments.push(track);
    
    // Physics for the track
    const trackBody = new CANNON.Body({ mass: 0 });
    trackBody.position.set(track.position.x, track.position.y, track.position.z);
    trackBody.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 5)));
    world.addBody(trackBody);
}

function removeTrackSegment() {
    if (trackSegments.length > 0) {
        const lastSegment = trackSegments.pop();
        scene.remove(lastSegment);
    }
}

document.addEventListener('keydown', (event) => {
    if (isDesigningTrack) {
        // Track designer mode does not allow car movement
    } else {
        // Control the car in racing mode
        if (event.key === 'ArrowUp') {
            carBody.velocity.z = -speed; // Move forward
        }
        if (event.key === 'ArrowDown') {
            carBody.velocity.z = speed; // Move backward
        }
        if (event.key === 'ArrowLeft') {
            carBody.angularVelocity.y = turnSpeed; // Turn left
        }
        if (event.key === 'ArrowRight') {
            carBody.angularVelocity.y = -turnSpeed; // Turn right
        }
    }
});

function startRace() {
    if (trackSegments.length === 0) {
        alert("Please add some track segments before starting the race!");
        return;
    }
    
    // Create AI cars
    createAICars();
    
    camera.position.set(0, 5, 10); // Set the camera for racing
    console.log("Race started!");
}

function createAICars() {
    for (let i = 0; i < 3; i++) { // Create 3 AI cars
        const aiCarGeometry = new THREE.BoxGeometry(0.5, 0.5, 1);
        const aiCarMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const aiCar = new THREE.Mesh(aiCarGeometry, aiCarMaterial);
        aiCar.position.set(Math.random() * 5 - 2.5, 0.5, Math.random() * 5 - 2.5);
        scene.add(aiCar);
        aiCars.push(aiCar);
    }
}

// Initialize the scene
init();
