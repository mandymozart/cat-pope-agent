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
const markdownContent = document.getElementById('markdown-content');

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

// Load and render markdown content
async function loadMarkdownContent() {
  try {
    markdownContent.innerHTML = '<div class="loading">Loading content...</div>';
    
    const response = await fetch(MARKDOWN_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load markdown: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // Use marked library if available, otherwise display plain text
    if (typeof marked !== 'undefined') {
      markdownContent.innerHTML = marked.parse(text);
    } else {
      markdownContent.innerHTML = `<pre>${text}</pre>`;
    }
  } catch (error) {
    console.error('Error loading markdown:', error);
    markdownContent.innerHTML = `<div class="error">Error loading content: ${error.message}</div>`;
  }
}

// Event Listeners
loginButton.addEventListener('click', handleLogin);
logoutButton.addEventListener('click', handleLogout);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
});

// Load the marked library dynamically
function loadMarkedLibrary() {
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

// Load the marked library
loadMarkedLibrary();
