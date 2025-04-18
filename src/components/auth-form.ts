import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('auth-form')
export class AuthForm extends LitElement {
  @property({ type: String })
  accessToken = '';

  @state()
  inputValue = '';

  @state()
  error = '';

  @property({ type: Boolean, reflect: true })
  authenticated = false;
  
  @property()
  onAuthenticated = () => {};

  handleSubmit(e: Event) {
    e.preventDefault();
    
    if (this.inputValue === this.accessToken) {
      this.authenticated = true;
      this.error = '';
      localStorage.setItem('auth-token', this.inputValue);
      this.onAuthenticated();
    } else {
      this.error = 'Invalid access token. Please try again.';
    }
  }

  handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.inputValue = target.value;
  }

  render() {
    return html`
      <div class="auth-form-container">
        <form @submit=${this.handleSubmit}>
          <h2>Protected Content</h2>
          <p>Please enter the access token to view the content.</p>
          
          ${this.error ? html`<div class="error">${this.error}</div>` : ''}
          
          <div class="form-group">
            <label for="token">Access Token:</label>
            <input 
              type="password" 
              id="token" 
              name="token"
              .value=${this.inputValue}
              @input=${this.handleInput}
              placeholder="Enter your access token"
              required
            />
          </div>
          
          <button type="submit">Access Content</button>
        </form>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    
    .auth-form-container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      margin-top: 0;
      color: #333;
      text-align: center;
    }
    
    p {
      color: #666;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    input:focus {
      outline: none;
      border-color: #646cff;
    }
    
    button {
      display: block;
      width: 100%;
      padding: 0.75rem;
      background-color: #646cff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: #535bf2;
    }
    
    .error {
      background-color: #ffebee;
      color: #d32f2f;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'auth-form': AuthForm;
  }
}
