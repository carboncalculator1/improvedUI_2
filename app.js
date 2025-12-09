    let currentSection = 'personal';
    let calculationData = {};

const studentEmissionFactors = {
    transport: {
        walking: 0,
        bicycle: 0,
        bus: 0.05,
        carpool: 0.08,
        public: 0.07,
        car: 0.12
    },
    electricity: 0.02, // kg CO₂e per hour (average)
    meals: 0.5, // kg CO₂e per meat meal
    waste: 0.1, // kg CO₂e per item
    digital: 0.02 // kg CO₂e per hour
};

const recyclingMultipliers = {
    none: 1.0,
    sometimes: 0.7,
    often: 0.4,
    always: 0.1
};

	const electricityEmissionFactors = {
	zesco: 0.02, // kg CO₂e per kWh (Zambia grid average)
	solar: 0.001, // kg CO₂e per kWh (solar PV)
	generator: 0.25, // kg CO₂e per kWh (diesel generator)
	hybrid: 0.01 // kg CO₂e per kWh (grid + solar hybrid)
	};

	const mealEmissionFactors = {
    beef: 7,        // kg CO₂e per serving (average of 6-8)
    chicken: 2.5,   // kg CO₂e per serving (average of 2-3)  
    vegetarian: 1.2 // kg CO₂e per serving (average of 0.8-1.5)
	};

	const commuteEmissionFactors = {
	walking: 0,
	bicycle: 0,
	motorbike: 0.078,
	carSmall: 0.100,
	carMedium: 0.113,
	carLarge: 0.140,
	carElectric: 0.040
	};

	const wasteEmissionFactors = { // everything in kg CO₂e/kg
	foodWaste: 2.0, 
	foodRecycling: -2.0, 
	paperWaste: 2.8, 
	paperRecycling: -2.8, 
	plasticWaste: -0.2, 
	plasticRecycling: 0.2, 
	metalWaste: 9.0, 
	metalRecycling: -9.0
	};

    const emissionFactors = {
        openAir: {
            plastics: 2.5,    // kg CO₂e per kg
            paper: 1.2,       // kg CO₂e per kg  
            food: 0.8,        // kg CO₂e per kg
            garden: 0.6,      // kg CO₂e per kg
            mixed: 1.5        // kg CO₂e per kg
        }
    };

    // Add frequency multipliers
    const frequencyMultipliers = {
        daily: 30,    // Approx monthly (30 days)
        weekly: 4,    // 4 weeks per month
        monthly: 1    // Already monthly
    };

// Three.js Particle System for Carbon Emissions Visualization
let particleScene, particleCamera, particleRenderer, particleSystem;
let sectorParticles = {};
let isParticleSystemInitialized = false;

function initParticleSystem() {
    if (isParticleSystemInitialized) return;
    
    // Scene setup
    particleScene = new THREE.Scene();
    particleCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    particleRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    particleRenderer.setSize(window.innerWidth, window.innerHeight);
    particleRenderer.setClearColor(0x000000, 0);
    document.getElementById('particle-container').appendChild(particleRenderer.domElement);
    
    // Camera position
    particleCamera.position.z = 15;
    
    // Create particle systems for each sector
    const sectors = ['personal', 'construction', 'manufacturing', 'agriculture', 'openair', 'student'];
    const sectorColors = {
        'personal': 0x10b981,     // Green
        'construction': 0x3b82f6,  // Blue
        'manufacturing': 0xf59e0b, // Yellow
        'agriculture': 0x84cc16,   // Lime
        'openair': 0xef4444,      // Red
        'student': 0x8b5cf6       // Purple
    };
    
    const sectorPositions = {
        'personal': { x: -8, y: 3, z: 0 },
        'construction': { x: -4, y: 3, z: 0 },
        'manufacturing': { x: 0, y: 3, z: 0 },
        'agriculture': { x: 4, y: 3, z: 0 },
        'openair': { x: 8, y: 3, z: 0 },
        'student': { x: 0, y: -3, z: 0 }
    };
    
    sectors.forEach(sector => {
        createSectorParticles(sector, sectorColors[sector], sectorPositions[sector]);
    });
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    particleScene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    particleScene.add(directionalLight);
    
    isParticleSystemInitialized = true;
    animateParticles();
}

function createSectorParticles(sectorName, color, position) {
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];
    const lifetimes = [];
    
    // Convert hex color to RGB
    const rgbColor = new THREE.Color(color);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Initial positions around the sector source
        positions[i3] = position.x + (Math.random() - 0.5) * 2;
        positions[i3 + 1] = position.y + (Math.random() - 0.5) * 2;
        positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
        
        // Colors with some variation
        colors[i3] = rgbColor.r + (Math.random() - 0.5) * 0.2;
        colors[i3 + 1] = rgbColor.g + (Math.random() - 0.5) * 0.2;
        colors[i3 + 2] = rgbColor.b + (Math.random() - 0.5) * 0.2;
        
        // Random velocities (flowing downward)
        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: -Math.random() * 0.05 - 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
        
        lifetimes.push(Math.random() * 100);
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleScene.add(particleSystem);
    
    sectorParticles[sectorName] = {
        system: particleSystem,
        geometry: particles,
        velocities: velocities,
        lifetimes: lifetimes,
        basePosition: position,
        active: false
    };
}

function animateParticles() {
    if (!isParticleSystemInitialized) return;
    
    requestAnimationFrame(animateParticles);
    
    Object.keys(sectorParticles).forEach(sectorName => {
        const particleData = sectorParticles[sectorName];
        if (!particleData.active) return;
        
        const positions = particleData.geometry.attributes.position.array;
        const velocities = particleData.velocities;
        const lifetimes = particleData.lifetimes;
        
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            
            // Update particle position based on velocity
            positions[i3] += velocities[i].x;
            positions[i3 + 1] += velocities[i].y;
            positions[i3 + 2] += velocities[i].z;
            
            // Update lifetime
            lifetimes[i]--;
            
            // Reset particles that are too old or out of bounds
            if (lifetimes[i] <= 0 || positions[i3 + 1] < -10) {
                // Reset to base position with some randomness
                positions[i3] = particleData.basePosition.x + (Math.random() - 0.5) * 2;
                positions[i3 + 1] = particleData.basePosition.y + (Math.random() - 0.5) * 2;
                positions[i3 + 2] = particleData.basePosition.z + (Math.random() - 0.5) * 2;
                
                lifetimes[i] = Math.random() * 100 + 50;
                
                // Reset velocity
                velocities[i] = {
                    x: (Math.random() - 0.5) * 0.02,
                    y: -Math.random() * 0.05 - 0.02,
                    z: (Math.random() - 0.5) * 0.02
                };
            }
        }
        
        particleData.geometry.attributes.position.needsUpdate = true;
    });
    
    // Gentle camera rotation for dynamic effect
    particleCamera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    particleCamera.position.z = 15 + Math.cos(Date.now() * 0.0001) * 2;
    particleCamera.lookAt(0, 0, 0);
    
    particleRenderer.render(particleScene, particleCamera);
}

function activateSectorParticles(sectorName) {
    // Deactivate all sectors first
    Object.keys(sectorParticles).forEach(sector => {
        sectorParticles[sector].active = false;
    });
    
    // Activate the current sector
    if (sectorParticles[sectorName]) {
        sectorParticles[sectorName].active = true;
    }
}

function updateParticleIntensity(sectorName, intensity) {
    // Scale particle activity based on calculation intensity
    if (sectorParticles[sectorName]) {
        const particleCount = sectorParticles[sectorName].geometry.attributes.position.array.length / 3;
        const activeParticles = Math.min(particleCount, Math.floor(intensity * 2));
        
        // You can adjust particle behavior based on intensity here
        // For example, increase particle speed or size
    }
}

// Handle window resize
function handleResize() {
    if (!isParticleSystemInitialized) return;
    
    particleCamera.aspect = window.innerWidth / window.innerHeight;
    particleCamera.updateProjectionMatrix();
    particleRenderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize particle system when page loads
window.addEventListener('load', function() {
    setTimeout(initParticleSystem, 1000); // Delay to ensure page is loaded
});

window.addEventListener('resize', handleResize);

    function showSection(section) {
        document.getElementById(currentSection).classList.remove('active');
        document.getElementById('results').classList.remove('active');
        document.getElementById(section).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
        currentSection = section;

			// Activate particles for the current section
    		if (isParticleSystemInitialized) {
        		activateSectorParticles(section);
    		}
    }

    function updateSliderValue(slider, outputId) {
        document.getElementById(outputId).textContent = slider.value;
    }

    function changeMeals(delta) {
        const mealsInput = document.getElementById('meals');
        let value = parseInt(mealsInput.value) + delta;
        if (value < 1) value = 1;
        if (value > 10) value = 10;
        mealsInput.value = value;
    }

function validateInputs(inputs) {
    for (const [key, value] of Object.entries(inputs)) {
        // Skip validation for non-numeric fields
        if (typeof value === "string") continue;

        if (isNaN(value) || value < 0) {
            alert(`Please enter a valid number for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return false;
        }
    }
    return true;
}

//save to firestore
async function saveCalculation(inputs, results, type) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return false;
        }
        
        // Prepare calculation object with separate inputs and results
        const calculation = {
            type: type,
            inputs: inputs,      // Store only the inputs
            results: results,    // Store only the results
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add calculation to user's calculations subcollection
        await db.collection('users').doc(user.uid)
                .collection('calculations')
                .add(calculation);
        
        return true;
    } catch (error) {
        console.error('Error saving calculation:', error);
        return false;
    }
}


async function calculatePersonal() {
    // Get waste inputs from sliders
    const wasteInputs = {
        food: parseFloat(document.getElementById('foodWasteValue').textContent) || 0,
        paper: parseFloat(document.getElementById('paperWasteValue').textContent) || 0,
        plastic: parseFloat(document.getElementById('plasticWasteValue').textContent) || 0,
        metal: parseFloat(document.getElementById('metalWasteValue').textContent) || 0
    };

    const inputs = {
    commute: parseFloat(document.getElementById('commuteValue').textContent),
    commuteType: document.getElementById('commuteType').value,
    electricity: parseFloat(document.getElementById('electricityValue').textContent),
    electricityType: document.getElementById('electricityTypePersonal').value, // NEW
    meals: parseFloat(document.getElementById('meals').value),
    mealType: document.getElementById('mealType').value,
};

    // Create a flattened version for validation
    const validationInputs = {
        ...inputs,
        foodWaste: wasteInputs.food,
        paperWaste: wasteInputs.paper,
        plasticWaste: wasteInputs.plastic,
        metalWaste: wasteInputs.metal
    };

    if (!validateInputs(validationInputs)) return;

    // Get emission factors
    const mealEmissionFactor = mealEmissionFactors[inputs.mealType];
    const commuteEmissionFactor = commuteEmissionFactors[inputs.commuteType];
	const electricityEmissionFactor = electricityEmissionFactors[inputs.electricityType]; // NEW
    
    // Calculate waste emissions (no recycling offsets)
    let totalWasteEmissions = 0;
    
    // Food waste
    totalWasteEmissions += wasteInputs.food * wasteEmissionFactors.foodWaste;
    
    // Paper waste
    totalWasteEmissions += wasteInputs.paper * wasteEmissionFactors.paperWaste;
    
    // Plastic waste
    totalWasteEmissions += wasteInputs.plastic * wasteEmissionFactors.plasticWaste;
    
    // Metal waste
    totalWasteEmissions += wasteInputs.metal * wasteEmissionFactors.metalWaste;
    
    // Convert weekly inputs to monthly values
    const results = {
        Commute: inputs.commute * commuteEmissionFactor * 22, // 22 working days per month
        Waste: totalWasteEmissions * 4, // Convert weekly to monthly (4 weeks)
       	Electricity: inputs.electricity * electricityEmissionFactor, //New
        Meals: inputs.meals * mealEmissionFactor * 30 // Daily to monthly (30 days)
    };

    results.total = Object.values(results).reduce((sum, val) => sum + val, 0);
    
    // Include waste inputs in the calculation data for display/PDF
    calculationData = { 
        inputs: {...inputs, waste: wasteInputs}, 
        results 
    };
    
    // After calculation
    const saved = await saveCalculation({...inputs, waste: wasteInputs}, results, 'personal');

	    // After calculation, update particle intensity
    if (isParticleSystemInitialized) {
        updateParticleIntensity('personal', results.total / 1000); // Scale intensity
    }
    
    displayResults(results);
}

   async function calculateConstruction() {
        const inputs = {
            embodiedCarbon: parseFloat(document.getElementById('embodiedCarbonValue').textContent),
            constructionElectricity: parseFloat(document.getElementById('constructionElectricityValue').textContent),
			electricityTypeConstruction: document.getElementById('electricityTypeConstruction').value, // NEW
            machinery: parseFloat(document.getElementById('machineryValue').textContent),
            constructionTransport: parseFloat(document.getElementById('constructionTransportValue').textContent)
        };

        if (!validateInputs(inputs)) return;

	   // Get electricity emission factor
		const electricityEmissionFactor = electricityEmissionFactors[inputs.electricityTypeConstruction]; // NEW

        // Convert weekly inputs to monthly values
        const results = {
            Materials: inputs.embodiedCarbon * 2.7, // Already monthly
            Electricity: inputs.constructionElectricity * electricityEmissionFactor, // New
            Machinery: inputs.machinery * 0.26 * 4, // Convert weekly to monthly (4 weeks)
            Transport: inputs.constructionTransport * 0.26 * 4 // Convert weekly to monthly (4 weeks)
        };

        results.total = Object.values(results).reduce((sum, val) => sum + val, 0);
        calculationData = { inputs, results };

	
	// After calculation
    	const saved = await saveCalculation(inputs, results, 'construction');

	    if (isParticleSystemInitialized) {
        updateParticleIntensity('construction', results.total / 1000);
    }
    	

        displayResults(results);
    }

   async function calculateManufacturing() {
        const inputs = {
            rawMaterial: parseFloat(document.getElementById('rawMaterialValue').textContent),
            manufacturingEnergy: parseFloat(document.getElementById('manufacturingEnergyValue').textContent),
			electricityTypeManufacturing: document.getElementById('electricityTypeManufacturing').value, // NEW
            water: parseFloat(document.getElementById('waterValue').textContent),
            manufacturingWaste: parseFloat(document.getElementById('manufacturingWasteValue').textContent),
            manufacturingTransport: parseFloat(document.getElementById('manufacturingTransportValue').textContent)
        };

        if (!validateInputs(inputs)) return;
	   // Get electricity emission factor
		const electricityEmissionFactor = electricityEmissionFactors[inputs.electricityTypeManufacturing]; // NEW

        // All inputs are already monthly
        const results = {
            Materials: inputs.rawMaterial * 1.8,
            Energy: inputs.manufacturingEnergy * electricityEmissionFactor, //New
            Water: inputs.water * 0.01,
            Waste: inputs.manufacturingWaste * 0.8,
            Transport: inputs.manufacturingTransport * 0.26
        };

        results.total = Object.values(results).reduce((sum, val) => sum + val, 0);
        calculationData = { inputs, results };

    		// After calculation
    		const saved = await saveCalculation(inputs, results, 'manufacturing');

	       if (isParticleSystemInitialized) {
        updateParticleIntensity('manufacturing', results.total / 1000);
    }

        displayResults(results);
    }

async function calculateAgriculture() {
    const inputs = {
        land: parseFloat(document.getElementById('agricultureLandValue').textContent),
        fertilizer: parseFloat(document.getElementById('fertilizerValue').textContent),
        livestock: parseFloat(document.getElementById('livestockValue').textContent),
        methaneCapture: document.getElementById('methaneCaptureCheckbox').checked
    };

    if (!validateInputs(inputs)) return;

    // Calculate livestock emissions with optional methane capture reduction
    let livestockEmissions = inputs.livestock * 50;
    if (inputs.methaneCapture) {
        livestockEmissions *= 0.7; // 30% reduction
    }

    // All inputs are monthly
    const results = {
        Land: inputs.land * 0.3,
        Fertilizer: inputs.fertilizer * 1.2,
        Livestock: livestockEmissions
    };

    results.total = Object.values(results).reduce((sum, val) => sum + val, 0);
    calculationData = { inputs, results };

    // Save to Firestore
    const saved = await saveCalculation(inputs, results, 'agriculture');

	    if (isParticleSystemInitialized) {
        updateParticleIntensity('agriculture', results.total / 1000);
    }

    displayResults(results);
}

async function calculateOpenAir() {
    const wasteType = document.getElementById('wasteType').value;
    const frequency = document.getElementById('burnFrequency').value;
    const amount = parseFloat(document.getElementById('burnAmountValue').textContent);

    if (isNaN(amount) || amount < 0) {
        alert('Please enter a valid amount for waste burned');
        return;
    }

    const inputs = {
        wasteType: wasteType,
        frequency: frequency,
        amount: amount
    };

    // Calculate monthly emissions
    const emissionFactor = emissionFactors.openAir[wasteType];
    const frequencyMultiplier = frequencyMultipliers[frequency];
    const monthlyEmissions = amount * emissionFactor * frequencyMultiplier;

    // Black carbon equivalent (approx 5-10% of total emissions as BC)
    const blackCarbon = monthlyEmissions * 0.07; // 7% as BC estimate

    const results = {
        TotalEmissions: monthlyEmissions,
        BlackCarbon: blackCarbon,
        CO2e: monthlyEmissions - blackCarbon
    };

    results.total = monthlyEmissions;
    calculationData = { inputs, results };

    // Save to Firestore
    const saved = await saveCalculation(inputs, results, 'openair');

	    if (isParticleSystemInitialized) {
        updateParticleIntensity('openair', results.total / 1000);
    }

    displayOpenAirResults(results);
}

function displayOpenAirResults(data) {
    document.getElementById(currentSection).classList.remove('active');

    const totalKg = data.total.toFixed(1);
    const totalTonnes = (data.total / 1000).toFixed(1);
    const dailyAverage = (data.total / 30).toFixed(1);

    const summaryContainer = document.querySelector('.emissions-summary');
    summaryContainer.innerHTML = `
        <div class="emissions-category">
            <div class="category-name">Total CO₂e Emissions</div>
            <div class="category-value">${data.CO2e.toFixed(1)} kg CO₂e/month</div>
            <div class="category-percentage">${((data.CO2e / data.total) * 100).toFixed(1)}% of total</div>
        </div>
        <div class="emissions-category">
            <div class="category-name">Black Carbon Equivalent</div>
            <div class="category-value">${data.BlackCarbon.toFixed(1)} kg BCe/month</div>
            <div class="category-percentage">${((data.BlackCarbon / data.total) * 100).toFixed(1)}% of total</div>
        </div>
        <div class="emissions-category">
            <div class="category-name">Health Impact Indicator</div>
            <div class="category-value">${(data.BlackCarbon * 10).toFixed(0)} PM2.5 equivalent</div>
            <div class="category-percentage">Based on IPCC conversion factors</div>
        </div>
    `;

    // Update total emissions
    const annualTonnes = (data.total * 12) / 1000; // numeric tonnes/year
    const approxCredits = annualTonnes;

    document.getElementById('totalEmissions').textContent = `Total Annual Emissions: ${annualTonnes.toFixed(1)} Tonnes CO₂e/Year`;
    document.getElementById('dailyAverage').textContent = `Daily Average: ${dailyAverage} kg CO₂e/day`;
    document.getElementById("carbonCreditsValue").textContent = approxCredits.toFixed(1);
    document.getElementById("carbonCreditsSection").style.display = "block";


    // Add equivalent comparison
    const drivingEquivalent = (data.total / 2.3).toFixed(0); // approx 2.3kg CO₂e per km driving
    summaryContainer.innerHTML += `
        <div class="emissions-category">
            <div class="category-name">Equivalent to driving</div>
            <div class="category-value">${drivingEquivalent} km/month</div>
            <div class="category-percentage">Lusaka to Kabwe: ~${(drivingEquivalent / 140).toFixed(1)} trips</div>
        </div>
    `;

    document.getElementById('results').classList.add('active');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

async function calculateStudent() {
    const inputs = {
        schoolName: document.getElementById('schoolName').value,
        gradeLevel: document.getElementById('gradeLevel').value,
        transportType: document.getElementById('studentTransportType').value,
        commuteDistance: parseFloat(document.getElementById('studentCommuteValue').textContent),
        electricityHours: parseFloat(document.getElementById('studentElectricityValue').textContent),
        electricityType: document.getElementById('electricityTypeStudent').value,
        meatMeals: parseFloat(document.getElementById('studentMealsValue').textContent),
        recycling: document.getElementById('studentRecycling').value,
        wasteItems: parseFloat(document.getElementById('studentWasteValue').textContent),
        digitalHours: parseFloat(document.getElementById('studentDigitalValue').textContent)
    };

    // Create validation inputs (numeric only)
    const validationInputs = {
        commuteDistance: inputs.commuteDistance,
        electricityHours: inputs.electricityHours,
        meatMeals: inputs.meatMeals,
        wasteItems: inputs.wasteItems,
        digitalHours: inputs.digitalHours
    };

    if (!validateInputs(validationInputs)) return;

    // Get electricity emission factor
    const electricityEmissionFactor = electricityEmissionFactors[inputs.electricityType];

    // Calculate emissions
    const transportEmission = studentEmissionFactors.transport[inputs.transportType];
    const recyclingMultiplier = recyclingMultipliers[inputs.recycling];

    const results = {
        Transport: inputs.commuteDistance * transportEmission * 22, // 22 school days per month
        Electricity: inputs.electricityHours * electricityEmissionFactor * 30, // Daily to monthly
        Food: inputs.meatMeals * studentEmissionFactors.meals * 4, // Weekly to monthly
        Waste: inputs.wasteItems * studentEmissionFactors.waste * recyclingMultiplier * 4, // Weekly to monthly
        Digital: inputs.digitalHours * studentEmissionFactors.digital * 30 // Daily to monthly
    };

    results.total = Object.values(results).reduce((sum, val) => sum + val, 0);
    calculationData = { inputs, results };

    // Save to Firestore
    const saved = await saveCalculation(inputs, results, 'student');

	    if (isParticleSystemInitialized) {
        updateParticleIntensity('student', results.total / 1000);
    }
    displayResults(results);
}



    function displayResults(data) {
        document.getElementById(currentSection).classList.remove('active');

        // Update the results with the calculated data
        const totalKg = data.total.toFixed(1);
        const totalTonnes = (data.total / 1000).toFixed(1);
        const dailyAverage = (data.total / 30).toFixed(1);

        // Clear previous results
        const summaryContainer = document.querySelector('.emissions-summary');
        summaryContainer.innerHTML = '';

        // Add new results based on current section
        if (currentSection === 'personal') {
            summaryContainer.innerHTML = `
                <div class="emissions-category">
                    <div class="category-name">Commute</div>
                    <div class="category-value">${data.Commute.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Commute / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Waste</div>
                    <div class="category-value">${data.Waste.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Waste / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Electricity</div>
                    <div class="category-value">${data.Electricity.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Electricity / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Meals</div>
                    <div class="category-value">${data.Meals.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Meals / data.total) * 100).toFixed(1)}% of total</div>
                </div>
            `;
        } else if (currentSection === 'construction') {
            summaryContainer.innerHTML = `
                <div class="emissions-category">
                    <div class="category-name">Materials</div>
                    <div class="category-value">${data.Materials.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Materials / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Electricity</div>
                    <div class="category-value">${data.Electricity.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Electricity / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Machinery</div>
                    <div class="category-value">${data.Machinery.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Machinery / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Transport</div>
                    <div class="category-value">${data.Transport.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Transport / data.total) * 100).toFixed(1)}% of total</div>
                </div>
            `;
        } else if (currentSection === 'manufacturing') {
            summaryContainer.innerHTML = `
                <div class="emissions-category">
                    <div class="category-name">Materials</div>
                    <div class="category-value">${data.Materials.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Materials / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Energy</div>
                    <div class="category-value">${data.Energy.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Energy / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Water</div>
                    <div class="category-value">${data.Water.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Water / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Waste</div>
                    <div class="category-value">${data.Waste.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Waste / data.total) * 100).toFixed(1)}% of total</div>
                </div>
                <div class="emissions-category">
                    <div class="category-name">Transport</div>
                    <div class="category-value">${data.Transport.toFixed(1)} kg CO₂e/month</div>
                    <div class="category-percentage">${((data.Transport / data.total) * 100).toFixed(1)}% of total</div>
                </div>
            `;
        } else if (currentSection === 'agriculture') {
        summaryContainer.innerHTML = `
            <div class="emissions-category">
                <div class="category-name">Land Use</div>
                <div class="category-value">${data.Land.toFixed(1)} kg CO₂e/month</div>
                <div class="category-percentage">${((data.Land / data.total) * 100).toFixed(1)}% of total</div>
            </div>
            <div class="emissions-category">
                <div class="category-name">Fertilizer</div>
                <div class="category-value">${data.Fertilizer.toFixed(1)} kg CO₂e/month</div>
                <div class="category-percentage">${((data.Fertilizer / data.total) * 100).toFixed(1)}% of total</div>
            </div>
            <div class="emissions-category">
                <div class="category-name">Livestock</div>
                <div class="category-value">${data.Livestock.toFixed(1)} kg CO₂e/month</div>
                <div class="category-percentage">${((data.Livestock / data.total) * 100).toFixed(1)}% of total</div>
            </div>
        `;
        } else if (currentSection === 'openair') {
        displayOpenAirResults(data);
    } else if (currentSection === 'student') {
    summaryContainer.innerHTML = `
        <div class="emissions-category">
            <div class="category-name">Transport</div>
            <div class="category-value">${data.Transport.toFixed(1)} kg CO₂e/month</div>
            <div class="category-percentage">${((data.Transport / data.total) * 100).toFixed(1)}% of total</div>
        </div>
        <div class="emissions-category">
            <div class="category-name">Electricity</div>
            <div class="category-value">${data.Electricity.toFixed(1)} kg CO₂e/month</div>
            <div class="category-percentage">${((data.Electricity / data.total) * 100).toFixed(1)}% of total</div>
        </div>
        <div class="emissions-category">
            <div class="category-name">Food</div>
            <div class="category-value">${data.Food.toFixed(1)} kg CO₂e/month</div>
            <div class="category-percentage">${((data.Food / data.total) * 100).toFixed(1)}% of total</div>
        </div>
        <div class="emissions-category">
            <div class="category-name">Waste</div>
            <div class="category-value">${data.Waste.toFixed(1)} kg CO₂e/month</div>
            <div class="category-percentage">${((data.Waste / data.total) * 100).toFixed(1)}% of total</div>
        </div>
        <div class="emissions-category">
            <div class="category-name">Digital</div>
            <div class="category-value">${data.Digital.toFixed(1)} kg CO₂e/month</div>
            <div class="category-percentage">${((data.Digital / data.total) * 100).toFixed(1)}% of total</div>
        </div>
    `;
}


        // Update total emissions (show in tonnes for annual total)
        const annualTonnes = (data.total * 12) / 1000; // numeric value (tonnes/year)
        const approxCredits = annualTonnes; // 1 tonne ≈ 1 credit

        document.getElementById('totalEmissions').textContent = `Total Annual Emissions: ${annualTonnes.toFixed(1)} Tonnes CO₂e/Year`;
        document.getElementById('dailyAverage').textContent = `Daily Average: ${dailyAverage} kg CO₂e/day`;

        // now approxCredits is numeric, safe to call toFixed()
        document.getElementById("carbonCreditsValue").textContent = approxCredits.toFixed(1);
        document.getElementById("carbonCreditsSection").style.display = "block";

        document.getElementById('results').classList.add('active');
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    }

    function getIconForCategory(category) {
        const icons = {
            'Commute': 'fas fa-car',
            'Waste': 'fas fa-trash',
            'Electricity': 'fas fa-bolt',
            'Meals': 'fas fa-utensils',
            'Materials': 'fas fa-cubes',
            'Machinery': 'fas fa-tractor',
            'Transport': 'fas fa-truck',
            'Energy': 'fas fa-plug',
            'Water': 'fas fa-tint'
        };

        return `<i class="${icons[category] || 'fas fa-circle'}"></i>`;
    }


// PDF export function
async function exportToPDF() {
    const user = auth.currentUser;
    if (!user) {
        if (confirm('You need to be logged in to export PDF. Would you like to login now?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const username = userData.username || user.email.split('@')[0];

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // === HEADER BAR ===
    doc.setFillColor(0, 153, 51); // Green
    doc.rect(0, 0, 210, 15, 'F'); // full-width top bar
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Carbon Emissions Summary', 105, 10, { align: 'center' });

    // === USER INFO ===
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`User: ${username}`, 10, 25);
    const userProvince = userData.province || 'Not specified';
    doc.text(`Province: ${userProvince}`, 10, 31);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 37);
    
    // === CALCULATION DETAILS BOX ===
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.rect(10, 40, 190, 160); // outer box
    doc.line(10, 50, 200, 50); // line after header
    doc.text('Calculation Details', 12, 47);

    // Inputs
    doc.setFont(undefined, 'bold');
    doc.text('Inputs:', 12, 57);
    let y = 65;
    
    // Handle different input types based on calculation type
    for (const [key, value] of Object.entries(calculationData.inputs)) {
        if (['total'].includes(key)) continue; // skip totals here
        
        let displayText = '';
        
        // Format the display based on input type and calculation section
        if (typeof value === 'number') {
            displayText = `${key}: ${value.toFixed(2)}`;
        } else if (typeof value === 'string') {
        // Handle electricity type
        if (key === 'electricityTypePersonal' || key === 'electricityTypeConstruction' || key === 'electricityTypeManufacturing') {
            const electricityTypes = {
                'zesco': 'ZESCO (Grid)',
                'solar': 'Solar',
                'generator': 'Generator',
                'hybrid': 'Hybrid'
            };
            displayText = `Electricity Type: ${electricityTypes[value] || value}`;
        } else if (key === 'mealType') {
                const mealTypes = {
                    'beef': 'Beef stew with nshima & vegetables',
                    'chicken': 'Chicken with rice & greens',
                    'vegetarian': 'Beans & vegetables with nshima/rice'
                };
                displayText = `Meal Type: ${mealTypes[value] || value}`;
            } else if (key === 'wasteType') {
                const wasteTypes = {
                    'plastics': 'Plastics',
                    'paper': 'Paper/Cardboard',
                    'food': 'Food Waste',
                    'garden': 'Garden Waste',
                    'mixed': 'Mixed Waste'
                };
                displayText = `Waste Type: ${wasteTypes[value] || value}`;
            } else if (key === 'frequency') {
                const frequencyTypes = {
                    'daily': 'Daily',
                    'weekly': 'Weekly',
                    'monthly': 'Monthly'
                };
                displayText = `Burning Frequency: ${frequencyTypes[value] || value}`;
            } else if (key === 'commuteType') {
                const commuteTypes = {
                    'walking': 'Walk',
                    'bicycle': 'Bicycle',
                    'motorbike': 'Motorbike',
                    'carSmall': 'Small vehicle',
                    'carMedium': 'Medium vehicle',
                    'carLarge': 'Large vehicle',
                    'carElectric': 'Electrical Vehicle'
                };
                displayText = `Commute Type: ${commuteTypes[value] || value}`;
            } else {
                displayText = `${key}: ${value}`;
            }
        } else if (typeof value === 'boolean') {
            displayText = `${key}: ${value ? 'Yes' : 'No'}`;
        } else if (typeof value === 'object' && value !== null) {
            // Handle waste inputs for personal section
            if (key === 'waste') {
                doc.text('Waste Generated (kg/week):', 20, y);
                y += 7;
                
                // Display each waste type
                for (const [wasteType, wasteAmount] of Object.entries(value)) {
                    const formattedType = wasteType.charAt(0).toUpperCase() + wasteType.slice(1);
                    doc.text(`  ${formattedType}: ${wasteAmount.toFixed(2)} kg`, 25, y);
                    y += 7;
                }
                continue; // Skip the regular display for waste object
            }
        }
        
        doc.text(displayText, 20, y);
        y += 7;
    }

    // Results section
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Summary (results):', 12, y);
    y += 8;
    doc.setFont(undefined, 'normal');

    for (const [key, value] of Object.entries(calculationData.results)) {
        if (key === 'total') continue;
        if (typeof value === 'number') {
            doc.text(`${key}: ${value.toFixed(2)} kg CO₂e/month`, 20, y);
            y += 7;
        }
    }

    // === TOTAL EMISSIONS ===
    y += 10;
    doc.setTextColor(255, 0, 0); // red text
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(
        `Total Emissions yearly: ${(calculationData.results.total * 12).toFixed(2)} kg CO₂e/Year`,
        12,
        y
    );

    // === FOOTER ===
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(
        'A climate awareness and action initiative by: Carbon Calculator Yanga Foundation, © 2025',
        105,
        290,
        { align: 'center' }
    );

    // === SAVE ===
    doc.save(`${username}_emissions_summary.pdf`);
}

// ESG Appointment functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get modal elements
  const modal = document.getElementById('esgModal');
  const esgBtn = document.getElementById('esgBtn');
  const closeBtn = document.getElementsByClassName('close')[0];
  const appointmentForm = document.getElementById('appointmentForm');
  const snackbar = document.getElementById('snackbar');
  const toggleBtn = document.querySelector('.toggle-modal-btn');
  const wasteModal = document.getElementById('wasteModal');

  // Open modal when ESG button is clicked
  esgBtn.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'flex';
  });

  // Close modal when X is clicked
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });

  // Handle form submission
  appointmentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const province = document.getElementById('province').value;
    
    // Validate all fields are filled
    if (!fullName || !email || !phone || !province) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      // Save appointment to Firestore
      await db.collection('appointments').add({
        fullName,
        email,
        phone,
        province,
        status: 'Pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  		updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Show success message
      showSnackbar();
      
      // Close modal and reset form
      modal.style.display = 'none';
      appointmentForm.reset();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error requesting appointment. Please try again.');
    }
  });

  // Function to show snackbar
  function showSnackbar() {
    snackbar.className = 'show';
    setTimeout(function(){ snackbar.className = snackbar.className.replace('show', ''); }, 3000);
  }


    
// Then check if they exist
if (toggleBtn && wasteModal) {
    toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const isVisible = wasteModal.style.display === 'block';
        wasteModal.style.display = isVisible ? 'none' : 'block';
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (!wasteModal.contains(e.target) && !toggleBtn.contains(e.target)) {
            wasteModal.style.display = 'none';
        }
    });
}
});

// Combine into one DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // 1. Recycling checkbox functionality
    const recyclingCheckboxes = [
        'foodRecycled', 'paperRecycled', 'plasticRecycled', 'metalRecycled'
    ];
    
    recyclingCheckboxes.forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        const amountInput = document.getElementById(checkboxId + 'Amount');
        
        if (checkbox && amountInput) {
            // Set initial state
            amountInput.disabled = !checkbox.checked;
            
            // Add change listener
            checkbox.addEventListener('change', function() {
                amountInput.disabled = !this.checked;
                if (!this.checked) {
                    amountInput.value = '0';
                }
            });
        }
    });

    // 2. ESG Appointment functionality
    const modal = document.getElementById('esgModal');
    const esgBtn = document.getElementById('esgBtn');
    const closeBtn = document.querySelector('.modal .close'); // More specific selector
    const appointmentForm = document.getElementById('appointmentForm');
    const snackbar = document.getElementById('snackbar');

    // Only set up ESG functionality if elements exist
    if (modal && esgBtn && closeBtn && appointmentForm && snackbar) {
        // Open modal when ESG button is clicked
        esgBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
        });

        // Close modal when X is clicked
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });

        // Handle form submission
        appointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const province = document.getElementById('province').value;
            
            // Validate all fields are filled
            if (!fullName || !email || !phone || !province) {
                alert('Please fill all required fields');
                return;
            }
            
            try {
                // Save appointment to Firestore
                await db.collection('appointments').add({
                    fullName,
                    email,
                    phone,
                    province,
                    status: 'Pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Show success message
                showSnackbar();
                
                // Close modal and reset form
                modal.style.display = 'none';
                appointmentForm.reset();
            } catch (error) {
                console.error('Error saving appointment:', error);
                alert('Error requesting appointment. Please try again.');
            }
        });

        // Function to show snackbar
        function showSnackbar() {
            snackbar.className = 'show';
            setTimeout(function(){ 
                snackbar.className = snackbar.className.replace('show', ''); 
            }, 3000);
        }
    }
});




function smoothlyActivateParticles(sectorName) {
    // Fade out all particles first
    Object.keys(sectorParticles).forEach(sector => {
        if (sectorParticles[sector].active) {
            // Smooth deactivation
            setTimeout(() => {
                sectorParticles[sector].active = false;
            }, 500);
        }
    });
    
    // Activate new sector particles after a short delay
    setTimeout(() => {
        if (sectorParticles[sectorName]) {
            sectorParticles[sectorName].active = true;
        }
    }, 600);
}


function toggleWastePopup() {
    const popup = document.getElementById('wastePopup');
    const btn = document.getElementById('wasteSupportBtn');

    if (popup.classList.contains('active')) {
        // Close it
        popup.classList.remove('active');
        btn.textContent = 'Support';
        btn.style.background = ''; // Return to default CSS styling
    } else {
        // Open it
        popup.classList.add('active');
        btn.textContent = 'Hide Options';
        // Optional: darken the main button to indicate it's active
        btn.style.background = 'var(--dark-600)'; 
    }
}



