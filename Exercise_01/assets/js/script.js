let pinsState = [];

const addPinBtn = document.getElementById('addPinBtn');
const removePinBtn = document.getElementById('removePinBtn');
const viewToggle = document.getElementById('viewToggle');
const editPanel = document.getElementById('editPanel');
const editTitle = document.getElementById('editTitle');
const editImage = document.getElementById('editImage');
const editText = document.getElementById('editText');
const editSize = document.getElementById('editSize');
const editColor = document.getElementById('editColor');
const editBold = document.getElementById('editBold');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.getElementById('closeBtn');
const deleteBtn = document.getElementById('deleteBtn');

let currentEditingPin = null;
let isGridView = true;

function toggleView() {
    const pinboard = document.querySelector('.pinboard');
    const switchSlider = document.querySelector('.switch-slider');
    isGridView = !viewToggle.checked;
    if (isGridView) {
        pinboard.classList.remove('list');
    } else {
        pinboard.classList.add('list');
    }
    switchSlider.classList.add('animating');
    setTimeout(() => {
        switchSlider.classList.remove('animating');
    }, 600);
}

// Edit panel functions
function openEditPanel(pinElement) {
    currentEditingPin = pinElement;
    const pinId = pinElement.id;
    const pinData = pinsState.find(pin => pin.id === pinId);
    editTitle.value = pinData ? pinData.title || '' : '';
    
    // Don't reset file input - let user choose to keep existing or upload new
    
    editText.value = pinElement.querySelector('p') ? pinElement.querySelector('p').textContent : pinElement.textContent;
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
async function savePin() {
    if (currentEditingPin) {
        const newTitle = editTitle.value.trim();
        const newText = editText.value.trim();
        const newSize = editSize.value;
        const newColor = editColor.value;
        const newBold = editBold.checked;
        
        const pinId = currentEditingPin.id;
        const pinData = pinsState.find(pin => pin.id === pinId);
        let newImageData = null;
        
        const file = editImage.files[0];
        if (file) {
            // User selected a new file
            newImageData = await readFileAsBase64(file);
        } else if (pinData && pinData.imageData && imagePreview.style.display !== 'none') {
            // Keep existing image if not removed
            newImageData = pinData.imageData;
        }
        
        if (newText || newTitle || newImageData || true) { // Always save changes
            // Update DOM
            currentEditingPin.innerHTML = '';
            if (newTitle) {
                const titleEl = document.createElement('h3');
                titleEl.textContent = newTitle;
                currentEditingPin.appendChild(titleEl);
            }
            if (newImageData) {
                const imgEl = document.createElement('img');
                imgEl.src = `data:${newImageData.type};base64,${newImageData.data}`;
                currentEditingPin.appendChild(imgEl);
            }
            const textEl = document.createElement('p');
            textEl.textContent = newText;
            currentEditingPin.appendChild(textEl);
            currentEditingPin.className = 'pin ' + newSize + (newBold ? ' bold' : '');
            currentEditingPin.style.color = newColor;
            
            // Update state
            if (pinData) {
                pinData.title = newTitle;
                pinData.imageData = newImageData;
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

// Helper function to read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64Data = result.split(',')[1];
            resolve({ data: base64Data, type: file.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
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
        if (pinData.title) {
            const titleEl = document.createElement('h3');
            titleEl.textContent = pinData.title;
            pin.appendChild(titleEl);
        }
        if (pinData.imageData) {
            const imgEl = document.createElement('img');
            imgEl.src = `data:${pinData.imageData.type};base64,${pinData.imageData.data}`;
            pin.appendChild(imgEl);
        }
        const textEl = document.createElement('p');
        textEl.textContent = pinData.text;
        pin.appendChild(textEl);
        pin.style.color = pinData.color || '#000000';
        pin.addEventListener('click', () => openEditPanel(pin));
        pinboard.appendChild(pin);
    });
}

addPinBtn.addEventListener('click', () => {
    const pinCount = pinsState.length + 1;
    const newPinData = { id: `pin${pinCount}`, title: '', imageData: null, text: `Pin ${pinCount}`, size: 'medium', color: '#000000', bold: false };
    pinsState.push(newPinData);
    localStorage.setItem('pinsState', JSON.stringify(pinsState));
    // Add to DOM
    const newPin = document.createElement('div');
    newPin.classList.add('pin', 'medium');
    newPin.id = newPinData.id;
    const textEl = document.createElement('p');
    textEl.textContent = newPinData.text;
    newPin.appendChild(textEl);
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

deleteBtn.addEventListener('click', () => {
    if (currentEditingPin) {
        const pinId = currentEditingPin.id;
        pinsState = pinsState.filter(pin => pin.id !== pinId);
        currentEditingPin.remove();
        localStorage.setItem('pinsState', JSON.stringify(pinsState));
        closeEditPanel();
    }
});
