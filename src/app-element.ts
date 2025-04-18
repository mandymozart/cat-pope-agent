import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './components/auth-form';
import './components/markdown-viewer';

@customElement('app-element')
export class AppElement extends LitElement {
  @state()
  isAuthenticated = false;

  @state()
  accessToken = 'cat-pope-2025'; // Default token, will be overridden if env var is available

  connectedCallback() {
    super.connectedCallback();
    
    // Check if user is already authenticated
    const storedToken = localStorage.getItem('auth-token');
    if (storedToken && storedToken === this.accessToken) {
      this.isAuthenticated = true;
    }
  }

  handleAuthenticated() {
    this.isAuthenticated = true;
  }

  handleLogout() {
    localStorage.removeItem('auth-token');
    this.isAuthenticated = false;
  }

  render() {
    return html`
      <div class="container">
        <header>
          <h1>Cat Pope Agent</h1>
          ${this.isAuthenticated ? 
            html`<button @click=${this.handleLogout} class="logout-btn">Logout</button>` : 
            ''
          }
        </header>
        
        ${this.isAuthenticated ? 
          html`
            <div class="content">
              <markdown-viewer markdownPath="/data/combined-markdown.md"></markdown-viewer>
            </div>
          ` : 
          html`
            <auth-form 
              .accessToken=${this.accessToken}
              .onAuthenticated=${this.handleAuthenticated.bind(this)}
            ></auth-form>
          `
        }
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #333;
      line-height: 1.5;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    h1 {
      margin: 0;
      font-size: 2rem;
      color: #646cff;
    }
    
    .logout-btn {
      background-color: transparent;
      border: 1px solid #d32f2f;
      color: #d32f2f;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    
    .logout-btn:hover {
      background-color: #d32f2f;
      color: white;
    }
    
    .content {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 1rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'app-element': AppElement;
  }
}
