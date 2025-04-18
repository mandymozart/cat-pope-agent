// Constants
const ACCESS_TOKEN = 'cat-pope-2025'; // Default token
const MARKDOWN_PATH = '/data/combined-markdown.txt';

// DOM Elements
const loginForm = document.getElementById('login-form');
const contentContainer = document.getElementById('content-container');
const tokenInput = document.getElementById('token-input');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const errorMessage = document.getElementById('error-message');
let markdownContent = document.getElementById('markdown-content'); // Changed to let instead of const

// Media extractor instance
let mediaExtractor = null;
let rawMarkdownContent = '';

// Check if the user is already authenticated
function checkAuthentication() {
  const storedToken = localStorage.getItem('auth-token');
  if (storedToken === ACCESS_TOKEN) {
    showContent();
    loadMarkdownContent();
  } else {
    showLoginForm();
  }
}

// Show the login form
function showLoginForm() {
  loginForm.style.display = 'block';
  contentContainer.style.display = 'none';
}

// Show the content area
function showContent() {
  loginForm.style.display = 'none';
  contentContainer.style.display = 'block';
}

// Handle login attempt
function handleLogin() {
  const inputValue = tokenInput.value.trim();
  
  if (inputValue === ACCESS_TOKEN) {
    localStorage.setItem('auth-token', inputValue);
    errorMessage.style.display = 'none';
    showContent();
    loadMarkdownContent();
  } else {
    errorMessage.textContent = 'Invalid access token. Please try again.';
    errorMessage.style.display = 'block';
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('auth-token');
  showLoginForm();
  tokenInput.value = '';
}

// Add tab interface to the content container
function setupTabInterface() {
  const tabsHtml = `
    <div class="tabs">
      <div class="tab active" data-tab="content">Content</div>
      <div class="tab" data-tab="media">Media Links</div>
    </div>
    <div id="content-tab" class="tab-content active">
      <div id="markdown-viewer" class="markdown-content">
        <div class="loading">Loading content...</div>
      </div>
    </div>
    <div id="media-tab" class="tab-content">
      <div id="media-report">
        <div class="loading">Analyzing media links...</div>
      </div>
    </div>
  `;
  
  // Replace the markdown-content div with our tabbed interface
  markdownContent.outerHTML = tabsHtml;
  
  // Update references to new elements
  markdownContent = document.getElementById('markdown-viewer');
  
  // Add event listeners for tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and content
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
  });
}

// Load and render markdown content
async function loadMarkdownContent() {
  try {
    if (!document.getElementById('markdown-viewer')) {
      setupTabInterface();
    }
    
    const markdownViewer = document.getElementById('markdown-viewer');
    if (!markdownViewer) {
      console.error('Markdown viewer element not found');
      return;
    }
    
    markdownViewer.innerHTML = '<div class="loading">Loading content...</div>';
    
    const response = await fetch(MARKDOWN_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load markdown: ${response.status} ${response.statusText}`);
    }
    
    rawMarkdownContent = await response.text();
    
    // Use marked library if available, otherwise display plain text
    if (typeof marked !== 'undefined') {
      markdownViewer.innerHTML = marked.parse(rawMarkdownContent);
    } else {
      markdownViewer.innerHTML = `<pre>${rawMarkdownContent}</pre>`;
    }
    
    // Extract media links after content is loaded
    extractMediaLinks();
    
  } catch (error) {
    console.error('Error loading markdown:', error);
    const markdownViewer = document.getElementById('markdown-viewer');
    if (markdownViewer) {
      markdownViewer.innerHTML = `<div class="error">Error loading content: ${error.message}</div>`;
    }
  }
}

// Extract and display media links
function extractMediaLinks() {
  const mediaReportElement = document.getElementById('media-report');
  if (!mediaReportElement) return;
  
  // Load the media extractor script if not already loaded
  if (!window.MediaExtractor) {
    const script = document.createElement('script');
    script.src = '/media-extractor.js';
    script.onload = processMediaLinks;
    document.head.appendChild(script);
  } else {
    processMediaLinks();
  }
  
  function processMediaLinks() {
    mediaExtractor = new MediaExtractor();
    const mediaItems = mediaExtractor.processMarkdown(rawMarkdownContent);
    
    mediaReportElement.innerHTML = mediaExtractor.generateReportHTML();
    mediaExtractor.initEventListeners();
    
    // Update tab to show count of media items
    const mediaTab = document.querySelector('.tab[data-tab="media"]');
    if (mediaTab && mediaItems.length > 0) {
      mediaTab.textContent = `Media Links (${mediaItems.length})`;
    }
  }
}

// Load the marked library dynamically if not already loaded
function loadMarkedLibrary() {
  if (typeof marked !== 'undefined') {
    console.log('Marked library already loaded');
    return;
  }
  
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
  script.onload = () => {
    console.log('Marked library loaded');
    // Reload content if already showing
    if (contentContainer.style.display === 'block') {
      loadMarkdownContent();
    }
  };
  document.head.appendChild(script);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loginButton.addEventListener('click', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  
  // Handle Enter key on token input
  tokenInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });
  
  // Initialize the app
  checkAuthentication();
  loadMarkedLibrary();
});
