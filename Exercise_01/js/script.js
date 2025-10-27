let pinsState = [];

const addPinBtn = document.getElementById('addPinBtn');
const removePinBtn = document.getElementById('removePinBtn');
const viewToggle = document.getElementById('viewToggle');
const editPanel = document.getElementById('editPanel');
const editText = document.getElementById('editText');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

let currentEditingPin = null;
let isGridView = true;

function toggleView() {
    const pinboard = document.querySelector('.pinboard');
    isGridView = !viewToggle.checked;
    if (isGridView) {
        pinboard.classList.remove('list');
    } else {
        pinboard.classList.add('list');
    }
}

function openEditPanel(pinElement) {
    currentEditingPin = pinElement;
    editText.value = pinElement.textContent;
    editPanel.classList.add('open');
}

function closeEditPanel() {
    editPanel.classList.remove('open');
    currentEditingPin = null;
}

function savePin() {
    if (currentEditingPin) {
        const newText = editText.value.trim();
        if (newText) {
            currentEditingPin.textContent = newText;
            const pinId = currentEditingPin.id;
            const pinData = pinsState.find(pin => pin.id === pinId);
            if (pinData) {
                pinData.text = newText;
                localStorage.setItem('pinsState', JSON.stringify(pinsState));
            }
        }
        closeEditPanel();
    }
}

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
        pin.addEventListener('click', () => openEditPanel(pin));
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
    newPin.addEventListener('click', () => openEditPanel(newPin));
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

saveBtn.addEventListener('click', savePin);
cancelBtn.addEventListener('click', closeEditPanel);
viewToggle.addEventListener('change', toggleView);
