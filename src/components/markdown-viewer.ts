import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { marked } from 'marked';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement('markdown-viewer')
export class MarkdownViewer extends LitElement {
  @property({ type: String })
  markdownPath = '';

  @state()
  markdownContent = '';

  @state()
  isLoading = false;

  @state()
  error = '';

  connectedCallback() {
    super.connectedCallback();
    this.loadMarkdownContent();
  }

  async loadMarkdownContent() {
    if (!this.markdownPath) return;
    
    try {
      this.isLoading = true;
      this.error = '';
      
      const response = await fetch(this.markdownPath);
      if (!response.ok) {
        throw new Error(`Failed to load markdown: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      // Fix the type issue by ensuring we get a string from marked.parse
      const parsedContent = await Promise.resolve(marked.parse(text));
      this.markdownContent = parsedContent;
    } catch (err) {
      console.error('Error loading markdown:', err);
      this.error = err instanceof Error ? err.message : String(err);
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    if (this.isLoading) {
      return html`<div class="loading">Loading markdown content...</div>`;
    }

    if (this.error) {
      return html`<div class="error">Error: ${this.error}</div>`;
    }

    if (!this.markdownContent) {
      return html`<div class="no-content">No content available</div>`;
    }

    return html`
      <div class="markdown-content">
        ${unsafeHTML(this.markdownContent)}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .markdown-content {
      width: 100%;
      max-width: 100%;
      overflow-x: auto;
      padding: 1rem;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      line-height: 1.6;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .markdown-content h1 {
      border-bottom: 2px solid #eee;
      padding-bottom: 0.5rem;
    }

    .markdown-content h2 {
      border-bottom: 1px solid #eee;
      padding-bottom: 0.3rem;
    }

    .markdown-content pre {
      background-color: #f6f8fa;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }

    .markdown-content code {
      background-color: #f6f8fa;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
    }

    .loading, .error, .no-content {
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }

    .loading {
      background-color: #f0f7ff;
    }

    .error {
      background-color: #fff0f0;
      color: #d32f2f;
    }

    .no-content {
      background-color: #f0f0f0;
      color: #666;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'markdown-viewer': MarkdownViewer;
  }
}
