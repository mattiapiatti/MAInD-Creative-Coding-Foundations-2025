let pinsState = [];

const addPinBtn = document.getElementById('addPinBtn');
const removePinBtn = document.getElementById('removePinBtn');

async function loadPins() {
    const stored = localStorage.getItem('pinsState');
    if (stored) {
        pinsState = JSON.parse(stored);
    } else {
        try {
            const response = await fetch('assets/pins.json');
            pinsState = await response.json();
        } catch (error) {
            console.error('Error loading pins.json:', error);
            pinsState = [];
        }
    }
    // Populate DOM
    const pinboard = document.querySelector('.pinboard');
    pinboard.innerHTML = '';
    pinsState.forEach(pinData => {
        const pin = document.createElement('div');
        pin.classList.add('pin');
        pin.id = pinData.id;
        pin.textContent = pinData.text;
        pinboard.appendChild(pin);
    });
}

addPinBtn.addEventListener('click', () => {
    const pinCount = pinsState.length + 1;
    const newPinData = { id: `pin${pinCount}`, text: `Pin ${pinCount}` };
    pinsState.push(newPinData);
    localStorage.setItem('pinsState', JSON.stringify(pinsState));
    // Add to DOM
    const newPin = document.createElement('div');
    newPin.classList.add('pin');
    newPin.id = newPinData.id;
    newPin.textContent = newPinData.text;
    document.querySelector('.pinboard').appendChild(newPin);
});

removePinBtn.addEventListener('click', () => {
    if (pinsState.length > 0) {
        pinsState.pop();
        localStorage.setItem('pinsState', JSON.stringify(pinsState));
        // Remove from DOM
        const pins = document.querySelectorAll('.pin');
        pins[pins.length - 1].remove();
    }
});

// Load pins on page load
loadPins();
