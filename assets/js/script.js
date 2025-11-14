// Project Configuration
const projects = {
    assignments: [
        {
            name: 'Assignment 01',
            path: 'Assignmets/Assignment_01/',
            description: 'First assignment project',
            files: ['index.html', 'assets/js/script.js', 'assets/css/style.css', 'assets/css/global.css', 'README.md']
        },
        {
            name: 'Assignment 02',
            path: 'Assignmets/Assignment_02/',
            description: 'Second assignment project',
            files: ['index.html', 'assets/js/script.js', 'assets/css/style.css', 'assets/css/global.css', 'README.md']
        }
    ],
    lessons: [
        {
            name: 'Lesson 01',
            path: 'Lessons/Lesson_01/',
            description: 'First lesson example',
            files: ['html/index.html', 'css/styles.css']
        }
    ]
};

let currentProject = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchRepoOwner();
    initializeTabs();
    renderProjects();
    initializeModal();
});

// Fetch repository owner from GitHub API
async function fetchRepoOwner() {
    const repoOwnerElement = document.getElementById('repo-owner');
    
    try {
        let repoOwner = null;
        let repoName = null;
        
        const metaRepo = document.querySelector('meta[name="github:repo"]');
        if (metaRepo) {
            const repoFullName = metaRepo.content;
            [repoOwner, repoName] = repoFullName.split('/');
        }
        
        if (!repoOwner || !repoName) {
            const pathParts = window.location.pathname.split('/').filter(p => p);
            const repoPattern = pathParts.find(part => 
                part.includes('MAInD') || part.includes('Creative-Coding') || part.includes('Foundations')
            );
            
            if (repoPattern) {
                repoName = repoPattern;
                repoOwner = 'mattiapiatti';
            }
        }
        
        if (repoOwner && repoName) {
            const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`);
            
            if (response.ok) {
                const data = await response.json();
                const ownerName = data.owner.name || data.owner.login;
                repoOwnerElement.textContent = ownerName;
                return;
            }
        }
        
        // Fallback
        try {
            const gitConfigResponse = await fetch('/.git/config');
            if (gitConfigResponse.ok) {
                const gitConfig = await gitConfigResponse.text();
                const match = gitConfig.match(/github\.com[:/]([^/]+)\/([^.]+)/);
                if (match) {
                    repoOwner = match[1];
                    const response = await fetch(`https://api.github.com/users/${repoOwner}`);
                    if (response.ok) {
                        const userData = await response.json();
                        repoOwnerElement.textContent = userData.name || userData.login;
                        return;
                    }
                }
            }
        } catch (e) {
        }
        
        repoOwnerElement.textContent = repoOwner || 'Repository Owner';
        
    } catch (error) {
        console.error('Error fetching repo owner:', error);
        repoOwnerElement.textContent = 'Repository Owner';
    }
}

// Main tabs handling
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.nav-link');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Render projects
function renderProjects() {
    renderProjectGrid('assignments', projects.assignments);
    renderProjectGrid('lessons', projects.lessons);
}

function renderProjectGrid(type, projectList) {
    const grid = document.getElementById(`${type}-grid`);
    grid.innerHTML = '';
    
    projectList.forEach(project => {
        const card = createProjectCard(project, type);
        grid.appendChild(card);
    });
}

function createProjectCard(project, type) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const fileCount = project.files.length;
    const badge = type === 'assignments' ? 'Assignment' : 'Lesson';
    
    card.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description}</p>
        <div class="project-meta">
            <span class="badge">${badge}</span>
            <span>${fileCount} files</span>
        </div>
    `;
    
    card.addEventListener('click', () => openProject(project));
    
    return card;
}

// Modal
function initializeModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('close-modal');
    
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Modal tabs
    const modalTabButtons = document.querySelectorAll('.modal-tab-btn');
    modalTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            
            document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.modal-view').forEach(v => v.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${view}-view`).classList.add('active');
            
            if (view === 'code' && currentProject) {
                loadProjectFiles(currentProject);
            }
        });
    });
    
    // Close modal with ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openProject(project) {
    currentProject = project;
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const iframe = document.getElementById('project-frame');
    
    title.textContent = project.name;
    iframe.src = project.path + 'index.html';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.modal-view').forEach(v => v.classList.remove('active'));
    document.querySelector('[data-view="preview"]').classList.add('active');
    document.getElementById('preview-view').classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentProject = null;
    
    document.getElementById('project-frame').src = '';
}

// Load project files
async function loadProjectFiles(project) {
    const fileSelector = document.getElementById('file-selector');
    fileSelector.innerHTML = '';
    
    project.files.forEach(file => {
        const btn = document.createElement('button');
        btn.className = 'file-btn';
        btn.textContent = file;
        btn.addEventListener('click', () => loadFile(project.path + file, btn));
        fileSelector.appendChild(btn);
    });
    
    // Load the first file automatically
    if (project.files.length > 0) {
        const firstBtn = fileSelector.querySelector('.file-btn');
        firstBtn.click();
    }
}

async function loadFile(filePath, button) {
    document.querySelectorAll('.file-btn').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    
    const codeDisplay = document.getElementById('code-display');
    const codeElement = codeDisplay.querySelector('code');
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('File not found');
        
        const content = await response.text();
        codeElement.textContent = content;
        
        // Syntax highlighting basato sull'estensione
        highlightCode(codeElement, filePath);
    } catch (error) {
        codeElement.textContent = `Error loading file: ${error.message}`;
    }
}

function highlightCode(element, filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    element.className = `language-${ext}`;
    
    // Add there the integration with a syntax highlighting library here

}

// Iframe error handling
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IFRAME') {
        console.error('Error loading project:', e);
    }
}, true);
