let pinsState = [];

const addPinBtn = document.getElementById('addPinBtn');
const removePinBtn = document.getElementById('removePinBtn');
const viewToggle = document.getElementById('viewToggle');
const editPanel = document.getElementById('editPanel');
const editText = document.getElementById('editText');
const editSize = document.getElementById('editSize');
const editColor = document.getElementById('editColor');
const editBold = document.getElementById('editBold');
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

// Edit panel functions
function openEditPanel(pinElement) {
    currentEditingPin = pinElement;
    const pinId = pinElement.id;
    const pinData = pinsState.find(pin => pin.id === pinId);
    editText.value = pinElement.textContent;
    editSize.value = pinData ? pinData.size : 'medium';
    editColor.value = pinData ? pinData.color : '#000000';
    editBold.checked = pinData ? pinData.bold : false;
    editPanel.classList.add('open');
}

function closeEditPanel() {
    editPanel.classList.remove('open');
    currentEditingPin = null;
}

// Close panel on Escape key press
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && editPanel.classList.contains('open')) {
        closeEditPanel();
    }
});

// Save changes to pin
function savePin() {
    if (currentEditingPin) {
        const newText = editText.value.trim();
        const newSize = editSize.value;
        const newColor = editColor.value;
        const newBold = editBold.checked;
        if (newText) {
            currentEditingPin.textContent = newText;
            currentEditingPin.className = 'pin ' + newSize + (newBold ? ' bold' : '');
            currentEditingPin.style.color = newColor;
            const pinId = currentEditingPin.id;
            const pinData = pinsState.find(pin => pin.id === pinId);
            if (pinData) {
                pinData.text = newText;
                pinData.size = newSize;
                pinData.color = newColor;
                pinData.bold = newBold;
                localStorage.setItem('pinsState', JSON.stringify(pinsState));
            }
        }
        closeEditPanel();
    }
}

// Load pins from JSON or localStorage
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
        pin.classList.add('pin', pinData.size || 'medium');
        if (pinData.bold) pin.classList.add('bold');
        pin.id = pinData.id;
        pin.textContent = pinData.text;
        pin.style.color = pinData.color || '#000000';
        pin.addEventListener('click', () => openEditPanel(pin));
        pinboard.appendChild(pin);
    });
}

addPinBtn.addEventListener('click', () => {
    const pinCount = pinsState.length + 1;
    const newPinData = { id: `pin${pinCount}`, text: `Pin ${pinCount}`, size: 'medium', color: '#000000', bold: false };
    pinsState.push(newPinData);
    localStorage.setItem('pinsState', JSON.stringify(pinsState));
    // Add to DOM
    const newPin = document.createElement('div');
    newPin.classList.add('pin', 'medium');
    newPin.id = newPinData.id;
    newPin.textContent = newPinData.text;
    newPin.style.color = '#000000';
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
