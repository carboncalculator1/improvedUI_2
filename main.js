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

// ==========================================================================
// Mobile-Specific Improvements
// ==========================================================================

// Handle touch events for better mobile UX
function initMobileTouchSupport() {
    // Add touch feedback for floating elements
    document.querySelectorAll('.floating-element').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
        
        // Prevent long press context menu on mobile
        element.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });
    
    // Swipe to close modal on mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        const modal = document.getElementById('scopeModal');
        if (modal && modal.classList.contains('show')) {
            touchStartY = e.changedTouches[0].screenY;
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        const modal = document.getElementById('scopeModal');
        if (modal && modal.classList.contains('show')) {
            touchEndY = e.changedTouches[0].screenY;
            
            // Swipe down to close (minimum 50px swipe)
            if (touchEndY - touchStartY > 50) {
                closeScopeModal();
            }
        }
    }, { passive: true });
    
    // Prevent modal content from scrolling when swiping to close
    document.addEventListener('touchmove', function(e) {
        const modal = document.getElementById('scopeModal');
        if (modal && modal.classList.contains('show')) {
            const modalContent = modal.querySelector('.scope-modal-content');
            if (modalContent) {
                const isAtTop = modalContent.scrollTop === 0;
                const isSwipingDown = e.changedTouches[0].screenY > touchStartY;
                
                // If at top and swiping down, prevent default to enable swipe-to-close
                if (isAtTop && isSwipingDown) {
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });
}

// Optimize floating elements for mobile
function optimizeFloatingElementsForMobile() {
    const floatingElements = document.querySelectorAll('.floating-element');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && floatingElements.length > 0) {
        // Remove conflicting animations on mobile
        floatingElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
            element.style.animationDuration = '4s';
            
            // Make sure elements don't overlap
            element.style.position = 'relative';
            element.style.margin = '10px';
        });
        
        // Reorder hero section for mobile
        const heroVisual = document.querySelector('.hero-visual');
        const heroContent = document.querySelector('.hero-content');
        
        if (heroVisual && heroContent) {
            // Visual comes first on mobile
            heroVisual.parentNode.insertBefore(heroVisual, heroContent);
        }
    }
}

// Enhanced modal close with vibration feedback (if supported)
function closeScopeModal() {
    const modal = document.getElementById('scopeModal');
    if (!modal) return;
    
    // Add haptic feedback on mobile
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Add closing animation
    modal.style.animation = '';
    modal.style.display = '';
    
    setTimeout(() => {
        modal.style.animation = '';
    }, 300);
}

// Improved scope modal show function for mobile
function showScopeModal(scopeNumber) {
    const scope = scopeData[scopeNumber];
    const modal = document.getElementById('scopeModal');
    const isMobile = window.innerWidth <= 768;
    
    if (!modal) return;
    
    // Add haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
        navigator.vibrate(100);
    }
    
    // Update modal content
    document.getElementById('scopeModalTitle').innerHTML = scope.title;
    document.getElementById('scopeModalIcon').className = `fas ${scope.icon}`;
    document.getElementById('scopeModalDescription').innerHTML = scope.description;
    
    // Update examples list
    const examplesList = document.getElementById('scopeModalExamples');
    examplesList.innerHTML = '';
    scope.examples.forEach(example => {
        const li = document.createElement('li');
        li.textContent = example;
        examplesList.appendChild(li);
    });
    
    // Set scope-specific class and show modal
    modal.className = `scope-modal show scope-${scopeNumber}`;
    document.body.style.overflow = 'hidden';
    
    // Scroll to top of modal on mobile
    if (isMobile) {
        setTimeout(() => {
            const modalContent = modal.querySelector('.scope-modal-content');
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
        }, 100);
    }
}

// Check if device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Initialize mobile-specific features
function initMobileFeatures() {
    if (window.innerWidth <= 768 || isMobileDevice()) {
        initMobileTouchSupport();
        optimizeFloatingElementsForMobile();
        
        // Add CSS class for mobile-specific styling
        document.body.classList.add('mobile-device');
        
        // Adjust floating elements animation for mobile
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device .floating-element {
                animation-play-state: running !important;
            }
            
            .mobile-device .hero-visual {
                order: 1;
            }
            
            .mobile-device .hero-content {
                order: 2;
            }
            
            /* Better tap targets */
            .mobile-device .floating-element:active {
                transform: scale(0.95) !important;
                transition: transform 0.1s ease !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==========================================================================
// Scope Modal Functionality
// ==========================================================================

const scopeData = {
    1: {
        title: "Scope 1 – Direct Emissions",
        icon: "fa-fire",
        description: "Emissions your business creates <strong>directly</strong> — like fuel burned in company cars, generators, or onsite equipment.",
        examples: [
            "Company vehicles (cars, trucks, buses)",
            "Onsite generators and boilers",
            "Refrigerant leaks from AC systems",
            "Manufacturing processes",
            "Agricultural livestock emissions"
        ]
    },
    2: {
        title: "Scope 2 – Energy Emissions",
        icon: "fa-bolt",
        description: "Emissions from the <strong>electricity or energy you buy</strong> — such as the power used in your office or factory.",
        examples: [
            "Purchased electricity for offices",
            "Heating and cooling systems",
            "Industrial process electricity",
            "Lighting and equipment power",
            "Purchased steam or district heating"
        ]
    },
    3: {
        title: "Scope 3 – Value Chain Emissions",
        icon: "fa-network-wired",
        description: "All other <strong>indirect emissions</strong> linked to your operations — including suppliers, transport, waste, business travel, employee commuting, and product use or disposal.",
        examples: [
            "Purchased goods and services",
            "Business travel and employee commuting",
            "Waste disposal and treatment",
            "Transportation and distribution",
            "Use of sold products and end-of-life"
        ]
    }
};

function initScopeModal() {
    const modal = document.getElementById('scopeModal');
    if (!modal) return;
    
    const closeBtn = document.querySelector('.scope-close-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeScopeModal);
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeScopeModal();
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeScopeModal();
        }
    });
    
    // Make floating scope elements clickable - FIXED VERSION
    document.querySelectorAll('.floating-element').forEach(element => {
        element.style.cursor = 'pointer';
        
        // Remove any existing click event listeners first
        element.replaceWith(element.cloneNode(true));
        
        // Get the new reference after clone
        const newElement = element.parentElement.querySelector('.floating-element[data-scope]') || element;
        
        newElement.addEventListener('click', function() {
            const scopeNumber = this.getAttribute('data-scope');
            if (scopeNumber) {
                showScopeModal(parseInt(scopeNumber));
            } else {
                // Fallback to text detection if data-scope attribute is missing
                const text = this.textContent || this.innerText;
                if (text.includes('Scope 1')) showScopeModal(1);
                else if (text.includes('Scope 2')) showScopeModal(2);
                else if (text.includes('Scope 3')) showScopeModal(3);
            }
        });
    });
}

// ==========================================================================
// Navigation and smooth scrolling
// ==========================================================================

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
    
    if (usersCount) animateValue(usersCount, 0, 1400, 2000);
    if (carbonSaved) animateValue(carbonSaved, 0, 250, 2000);
    if (projects) animateValue(projects, 0, 50, 2000);
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

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navLinks.contains(event.target) || mobileMenuToggle.contains(event.target);
            if (!isClickInsideNav && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
}

function closeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    }
}

// ==========================================================================
// Initialize everything when page loads
// ==========================================================================

// Add CSS for scroll animations and scope modal animations
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
    
    /* Scope modal animations */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideInUp {
        from { 
            opacity: 0; 
            transform: translateY(50px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }
    
    .floating-element {
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .floating-element:hover {
        transform: translateY(-10px) scale(1.1) !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
        z-index: 10;
    }
    
    /* Focus styles for keyboard navigation */
    .floating-element:focus {
        outline: 3px solid #10b981;
        outline-offset: 2px;
        transform: translateY(-10px) scale(1.1) !important;
    }
    
    /* Mobile menu styles */
    .mobile-menu-toggle {
        display: none;
        flex-direction: column;
        justify-content: space-between;
        width: 30px;
        height: 21px;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        z-index: 1001;
    }
    
    .mobile-menu-toggle span {
        width: 100%;
        height: 3px;
        background: var(--primary-400);
        border-radius: 3px;
        transition: all 0.3s ease;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    @media (max-width: 768px) {
        .mobile-menu-toggle {
            display: flex;
        }
        
        .nav-links {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--dark-800);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--glass-border);
            flex-direction: column;
            padding: 2rem;
            gap: 1.5rem;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .nav-links.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js background
    initThreeJS();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize scope modal
    initScopeModal();
    
    // Initialize mobile-specific features
    initMobileFeatures();
    
    // Animate numbers in hero section
    setTimeout(animateNumbers, 1000);
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            closeMobileMenu();
            document.body.classList.remove('mobile-device');
        } else {
            initMobileFeatures();
        }
        
        // Re-optimize floating elements on resize
        optimizeFloatingElementsForMobile();
    });
    
    // Close mobile menu when scrolling
    window.addEventListener('scroll', function() {
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(initMobileFeatures, 300);
        setTimeout(optimizeFloatingElementsForMobile, 300);
    });
});
