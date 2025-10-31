const STORAGE_KEY = 'pinsState';
const DEFAULT_PIN_SIZE = 'medium';
const DEFAULT_PIN_COLOR = '#000000';

const SELECTORS = {
    addPinBtn: 'addPinBtn',
    removePinBtn: 'removePinBtn',
    viewToggle: 'viewToggle',
    editPanel: 'editPanel',
    editTitle: 'editTitle',
    editImage: 'editImage',
    editText: 'editText',
    editSize: 'editSize',
    editColor: 'editColor',
    editBold: 'editBold',
    saveBtn: 'saveBtn',
    cancelBtn: 'cancelBtn',
    deleteBtn: 'deleteBtn',
    pinboard: '.pinboard'
};

// Global state variables
let pinsState = [];
let currentEditingPin = null;
let isGridView = true;
let pinCounter = 1;

const elements = {};

// Cache DOM elements
function cacheElements() {
    Object.keys(SELECTORS).forEach(key => {
        const selector = SELECTORS[key];
        elements[key] = key === 'pinboard'
            ? document.querySelector(selector)
            : document.getElementById(selector);
    });
}

function generatePinId() {
    return `pin${pinCounter++}`;
}

function validateRequiredFields(title, text) {
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();

    let hasErrors = false;

    if (!trimmedTitle) {
        elements.editTitle.classList.add('required-field');
        hasErrors = true;
    } else {
        elements.editTitle.classList.remove('required-field');
    }

    if (!trimmedText) {
        elements.editText.classList.add('required-field');
        hasErrors = true;
    } else {
        elements.editText.classList.remove('required-field');
    }

    return !hasErrors;
}

function clearValidationErrors() {
    elements.editTitle.classList.remove('required-field');
    elements.editText.classList.remove('required-field');
}



// Utility functions for image handling
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

// Resize image to max dimensions
function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(resolve, file.type, 0.8); // quality 0.8
        };
        img.src = URL.createObjectURL(file);
    });
}

// Pin DOM manipulation
function createPinElement(pinData) {
    const pin = document.createElement('div');
    pin.classList.add('pin', pinData.size || DEFAULT_PIN_SIZE);
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

    pin.style.color = pinData.color || DEFAULT_PIN_COLOR;
    pin.addEventListener('click', () => openEditPanel(pin));

    return pin;
}

// Update pin DOM element with new data
function updatePinElement(pinElement, pinData) {
    pinElement.innerHTML = '';

    if (pinData.title) {
        const titleEl = document.createElement('h3');
        titleEl.textContent = pinData.title;
        pinElement.appendChild(titleEl);
    }

    if (pinData.imageData) {
        const imgEl = document.createElement('img');
        imgEl.src = `data:${pinData.imageData.type};base64,${pinData.imageData.data}`;
        pinElement.appendChild(imgEl);
    }

    const textEl = document.createElement('p');
    textEl.textContent = pinData.text;
    pinElement.appendChild(textEl);

    pinElement.className = 'pin ' + pinData.size + (pinData.bold ? ' bold' : '');
    pinElement.style.color = pinData.color;
}

// State management
function addPinToState(pinData) {
    pinsState.push(pinData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinsState));
}

function updatePinInState(pinId, newData) {
    const pinIndex = pinsState.findIndex(pin => pin.id === pinId);
    if (pinIndex !== -1) {
        Object.assign(pinsState[pinIndex], newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pinsState));
    }
}

function removePinFromState(pinId) {
    pinsState = pinsState.filter(pin => pin.id !== pinId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinsState));
}

function toggleView() {
    const pinboard = elements.pinboard;
    const switchSlider = document.querySelector('.switch-slider');
    isGridView = !elements.viewToggle.checked;

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

function openEditPanel(pinElement) {
    currentEditingPin = pinElement;
    const pinId = pinElement.id;
    const pinData = pinsState.find(pin => pin.id === pinId);

    // Hide delete button for new pins (not yet saved)
    elements.deleteBtn.style.display = pinData ? 'block' : 'none';

    // Disable pin management buttons while editing
    elements.addPinBtn.disabled = true;
    elements.removePinBtn.disabled = true;
    elements.pinboard.style.pointerEvents = 'none';

    populateEditForm(pinData, pinElement);

    elements.editPanel.classList.add('open');
}

// Populate edit form with pin data
function populateEditForm(pinData, pinElement) {
    if (pinData) {
        // Existing pin
        elements.editTitle.value = pinData.title || '';
        elements.editText.value = pinData.text;
        elements.editText.placeholder = '';
        elements.editSize.value = pinData.size;
        elements.editColor.value = pinData.color;
        elements.editBold.checked = pinData.bold;
        // For existing pins, don't reset image input
    } else {
        // New pin
        elements.editTitle.value = '';
        elements.editText.value = '';
        elements.editText.placeholder = `Pin ${parseInt(pinElement.id.slice(3))}`;
        // Reset image input for new pins
        const newFileInput = document.createElement('input');
        newFileInput.type = 'file';
        newFileInput.id = 'editImage';
        newFileInput.accept = 'image/*';
        elements.editImage.parentNode.replaceChild(newFileInput, elements.editImage);
        elements.editImage = newFileInput;
        elements.editSize.value = DEFAULT_PIN_SIZE;
        elements.editColor.value = DEFAULT_PIN_COLOR;
        elements.editBold.checked = false;
    }
}

function closeEditPanel() {
    // If editing a new unsaved pin, remove it from DOM
    if (currentEditingPin) {
        const pinId = currentEditingPin.id;
        const pinExists = pinsState.some(pin => pin.id === pinId);
        if (!pinExists) {
            currentEditingPin.remove();
        }
    }

    // Re-enable pin management buttons
    elements.addPinBtn.disabled = false;
    elements.removePinBtn.disabled = false;
    elements.pinboard.style.pointerEvents = 'auto';


    elements.editPanel.classList.remove('open');
    currentEditingPin = null;
}

async function savePin() {
    if (!currentEditingPin) return;

    clearValidationErrors();

    const newTitle = elements.editTitle.value.trim();
    const newText = elements.editText.value.trim();

    if (!validateRequiredFields(newTitle, newText)) {
        return;
    }

    const newSize = elements.editSize.value;
    const newColor = elements.editColor.value;
    const newBold = elements.editBold.checked;

    const pinId = currentEditingPin.id;
    const existingPinData = pinsState.find(pin => pin.id === pinId);

    let newImageData = null;
    try {
        newImageData = await processImageUpload(existingPinData);
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
        newImageData = null;
    }

    const newPinData = {
        id: pinId,
        title: newTitle,
        imageData: newImageData,
        text: newText,
        size: newSize,
        color: newColor,
        bold: newBold
    };

    updatePinElement(currentEditingPin, newPinData);

    if (existingPinData) {
        updatePinInState(pinId, newPinData);
    } else {
        addPinToState(newPinData);
    }

    closeEditPanel();
}

// Process image upload or removal
async function processImageUpload(existingPinData) {
    const file = elements.editImage.files[0];
    if (file) {
        const resizedBlob = await resizeImage(file, 300, 300);
        return await readFileAsBase64(resizedBlob);
    }

    return existingPinData?.imageData || null;
}

function deletePin() {
    if (!currentEditingPin) return;

    const pinId = currentEditingPin.id;
    removePinFromState(pinId);
    currentEditingPin.remove();
    closeEditPanel();
}

async function loadPins() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        pinsState = JSON.parse(stored);
    } else {
        await loadPinsFromJSON();
    }

    // Set pinCounter to the next available number
    if (pinsState.length > 0) {
        const maxId = Math.max(...pinsState.map(pin => parseInt(pin.id.slice(3))));
        pinCounter = maxId + 1;
    } else {
        pinCounter = 1;
    }

    renderPins();
}

async function loadPinsFromJSON() {
    try {
        const response = await fetch('assets/pins.json');
        pinsState = await response.json();
    } catch (error) {
        console.error('Error loading pins.json:', error);
        pinsState = [];
    }
}

function renderPins() {
    const pinboard = elements.pinboard;
    pinboard.innerHTML = '';

    pinsState.forEach(pinData => {
        const pinElement = createPinElement(pinData);
        pinboard.appendChild(pinElement);
    });
}

function addNewPin() {
    const newPinId = generatePinId();
    const pinNumber = parseInt(newPinId.slice(3));
    const newPinData = {
        id: newPinId,
        title: '',
        text: `Pin ${pinNumber}`,
        size: DEFAULT_PIN_SIZE,
        color: DEFAULT_PIN_COLOR,
        bold: false
    };

    const newPinElement = createPinElement(newPinData);
    elements.pinboard.appendChild(newPinElement);
    openEditPanel(newPinElement);
}

function removeLastPin() {
    if (pinsState.length > 0) {
        pinsState.pop();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pinsState));

        const pins = document.querySelectorAll('.pin');
        pins[pins.length - 1].remove();
    }
}

function handleInputValidation() {
    elements.editTitle.addEventListener('input', () => {
        if (elements.editTitle.value.trim()) {
            elements.editTitle.classList.remove('required-field');
        }
    });

    elements.editText.addEventListener('input', () => {
        if (elements.editText.value.trim()) {
            elements.editText.classList.remove('required-field');
        }
    });
}

function handleKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.editPanel.classList.contains('open')) {
            closeEditPanel();
        }
    });
}

function setupEventListeners() {
    elements.addPinBtn.addEventListener('click', addNewPin);
    elements.removePinBtn.addEventListener('click', removeLastPin);

    elements.viewToggle.addEventListener('change', toggleView);

    elements.saveBtn.addEventListener('click', savePin);
    elements.cancelBtn.addEventListener('click', closeEditPanel);
    elements.deleteBtn.addEventListener('click', deletePin);

    handleInputValidation();
    handleKeyboardShortcuts();
}

async function init() {
    cacheElements();
    setupEventListeners();
    await loadPins();
}

document.addEventListener('DOMContentLoaded', init);
