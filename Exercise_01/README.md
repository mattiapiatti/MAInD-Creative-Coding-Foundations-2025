# Exercise 01: PinBoard Interactive Web Application

## Brief
Starting from the concept of a pinboard, implement a web page that:
- is responsive (properly layout for smartphone, tablet, and desktop)
- allows the user to add and remove elements
- allows the user to customize elements (i.e. colors, size)
- allows the switch between two views (at least)

## Screenshots

### Grid View
![Grid View](assets/img/grid-view.png)

### List View
![List View](assets/img/list-view.png)

### Edit Panel
![Edit Panel](assets/img/edit-panel.png)

## Project Description

The PinBoard application is an interactive web interface for managing digital notes/pins with customizable visual properties. Users can toggle between grid and list layouts, add new pins, remove existing ones, and edit pin content through a slide-up panel. The application features responsive design for mobile and tablet devices, with data persistence across browser sessions using localStorage and JSON file fallback. Functional logic includes DOM manipulation for dynamic pin creation/rendering, event handling for user interactions, and state management for pin data. Interaction modalities comprise click-to-edit pins, toggle switches for view modes, and form-based editing with real-time preview. (248 characters)

## Block Diagram
[![](https://mermaid.ink/img/pako:eNpVk0tz2jAQx7-KRmdCebg29qEzBEOBBkxq0kMFB9XeGGeM5JHlEAp89-qBU_BJ_92f9qX1CSc8BRzgTNByh9bhhiH1DclLBQLNmARBE5lztkUPD9_QIxm_A5NoSllagKi2Fn80ztFpaFC0PpZwsZ6R9pyHaYpWOTujkIwEUAloCQdtQdGfN0jk9hb-CXv-DpYfk6t6opXUpjtynObSchMSlcCQNVAGxR235llWAPqVw-GMvpP4kMtkp0IeeX2fOqYq1WhHWQbVGU3JS5nqYnWhIZVUsZYOTb-zxl_mrIqlPg2FoMdryLGFrJg2wsqZkXOyUjPMVWeSo4IntIglFzSDa4S5oX40acJo8VnBE1kpDj1xmtqXWRB9bsrUyMLYlydtQjGvRdI8ytI0e5vwjCIVUFSA5nG03N5i2oAmeaGYFZmAnhytKpDVF912-63i7LOqyKR8Vo_GUrU-am7Nhqysx4pn2xduqa3LUxxIUUML70HsqZb4pLENljvYwwYH6pjCK60LucEbdlHXSsp-c75vbgpeZzscvNKiUqo20wpzqlb6P2IqGvGaSRx8NRFwcMIfOHCdtjNwOm7HHzhO13GcFj7ioNdtDzoDx_P6rj_w-57nXlr4r8nZafu9ftf3eq7v9H3X99QNUIvHxcL-SuaPuvwDBrAGLg?type=png)](https://mermaid.live/edit#pako:eNpVk0tz2jAQx7-KRmdCebg29qEzBEOBBkxq0kMFB9XeGGeM5JHlEAp89-qBU_BJ_92f9qX1CSc8BRzgTNByh9bhhiH1DclLBQLNmARBE5lztkUPD9_QIxm_A5NoSllagKi2Fn80ztFpaFC0PpZwsZ6R9pyHaYpWOTujkIwEUAloCQdtQdGfN0jk9hb-CXv-DpYfk6t6opXUpjtynObSchMSlcCQNVAGxR235llWAPqVw-GMvpP4kMtkp0IeeX2fOqYq1WhHWQbVGU3JS5nqYnWhIZVUsZYOTb-zxl_mrIqlPg2FoMdryLGFrJg2wsqZkXOyUjPMVWeSo4IntIglFzSDa4S5oX40acJo8VnBE1kpDj1xmtqXWRB9bsrUyMLYlydtQjGvRdI8ytI0e5vwjCIVUFSA5nG03N5i2oAmeaGYFZmAnhytKpDVF912-63i7LOqyKR8Vo_GUrU-am7Nhqysx4pn2xduqa3LUxxIUUML70HsqZb4pLENljvYwwYH6pjCK60LucEbdlHXSsp-c75vbgpeZzscvNKiUqo20wpzqlb6P2IqGvGaSRx8NRFwcMIfOHCdtjNwOm7HHzhO13GcFj7ioNdtDzoDx_P6rj_w-57nXlr4r8nZafu9ftf3eq7v9H3X99QNUIvHxcL-SuaPuvwDBrAGLg)

## Functions List

### `toggleView()`
- **Arguments**: None
- **Description**: Toggles between grid and list view modes by adding/removing CSS classes
- **Returns**: void

### `openEditPanel(pinElement)`
- **Arguments**: `pinElement` (DOM element) - The pin element being edited
- **Description**: Opens the edit panel and populates it with current pin data
- **Returns**: void

### `closeEditPanel()`
- **Arguments**: None
- **Description**: Closes the edit panel and resets editing state
- **Returns**: void

### `savePin()`
- **Arguments**: None
- **Description**: Saves changes from edit panel to pin data and updates DOM/localStorage
- **Returns**: void

### `loadPins()`
- **Arguments**: None
- **Description**: Loads pin data from localStorage or JSON file and renders pins to DOM
- **Returns**: Promise<void>

## Content and Data Sources

- **Initial Pin Data**: `assets/pins.json` - Contains default pin objects with id, text, size, color, and bold properties
- **Persistent Data**: Browser localStorage - Stores pin state between sessions
- **Icons**: Inline SVG icons for grid/list toggle switch
- **Styling**: CSS custom properties for consistent theming

## API Documentation

No external APIs are used in this application. The application uses native browser APIs:

- **localStorage API**: For client-side data persistence
  - `localStorage.getItem(key)` - Retrieves stored data
  - `localStorage.setItem(key, value)` - Stores data

- **Fetch API**: For loading initial JSON data
  - `fetch(url)` - Loads JSON file from assets directory

- **DOM API**: For dynamic element manipulation
  - `document.createElement()` - Creates new pin elements
  - `document.querySelector()` - Selects DOM elements
  - `addEventListener()` - Attaches event handlers

## Licence
2025 (c) Mattia Piatti. All rights reserved. License: None