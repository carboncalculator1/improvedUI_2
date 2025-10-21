// main.js - Homepage functionality

// Initialize Three.js background
let scene, camera, renderer, particles;

function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('threejs-background').appendChild(renderer.domElement);
    
    // Create particle system
    const particleCount = 1500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions in a sphere
        const radius = 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Greenish colors for environmental theme
        colors[i3] = Math.random() * 0.3 + 0.2;     // R
        colors[i3 + 1] = Math.random() * 0.5 + 0.3; // G
        colors[i3 + 2] = Math.random() * 0.2 + 0.1; // B
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Position camera
    camera.position.z = 15;
    
    // Start animation
    animateBackground();
}

function animateBackground() {
    requestAnimationFrame(animateBackground);
    
    // Gentle rotation
    scene.rotation.y += 0.0005;
    scene.rotation.x += 0.0002;
    
    // Subtle camera movement
    camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    camera.position.y = Math.cos(Date.now() * 0.0002) * 1;
    
    renderer.render(scene, camera);
}

// Navigation and smooth scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Redirect to calculator
function goToCalculator() {
    window.location.href = 'index.html';
}

// Animate numbers
function animateNumbers() {
    const usersCount = document.getElementById('usersCount');
    const carbonSaved = document.getElementById('carbonSaved');
    const projects = document.getElementById('projects');
    
    animateValue(usersCount, 0, 10000, 2000);
    animateValue(carbonSaved, 0, 250, 2000);
    animateValue(projects, 0, 50, 2000);
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString() + '+';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all feature cards and team cards
    document.querySelectorAll('.feature-card, .team-card, .impact-card').forEach(card => {
        observer.observe(card);
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js background
    initThreeJS();
    
    // Animate numbers in hero section
    setTimeout(animateNumbers, 1000);
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
    .feature-card, .team-card, .impact-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .feature-card.animate-in, 
    .team-card.animate-in, 
    .impact-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .feature-card:nth-child(1) { transition-delay: 0.1s; }
    .feature-card:nth-child(2) { transition-delay: 0.2s; }
    .feature-card:nth-child(3) { transition-delay: 0.3s; }
    .feature-card:nth-child(4) { transition-delay: 0.4s; }
`;
document.head.appendChild(style);
