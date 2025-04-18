/**
 * Media Extractor
 * Identifies YouTube and Instagram video links from markdown content
 * and generates a report without downloading (to avoid legal issues)
 */

class MediaExtractor {
  constructor() {
    this.mediaItems = [];
    this.youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/g;
    this.instagramRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/g;
    this.twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/([0-9]+)/g;
    this.vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)/g;
  }

  /**
   * Process markdown text to find media links
   * @param {string} markdownText - The markdown content to analyze
   * @returns {Array} - Array of media items found
   */
  processMarkdown(markdownText) {
    if (!markdownText) return [];
    
    this.mediaItems = [];
    
    // Find YouTube videos
    this.findMatches(markdownText, this.youtubeRegex, 'youtube');
    
    // Find Instagram posts
    this.findMatches(markdownText, this.instagramRegex, 'instagram');
    
    // Find Twitter posts
    this.findMatches(markdownText, this.twitterRegex, 'twitter');
    
    // Find Vimeo videos
    this.findMatches(markdownText, this.vimeoRegex, 'vimeo');
    
    // Remove duplicates
    this.mediaItems = this.removeDuplicates(this.mediaItems);
    
    return this.mediaItems;
  }

  /**
   * Find matches using a regex pattern
   * @param {string} text - Text to search in
   * @param {RegExp} regex - Regular expression pattern
   * @param {string} type - Type of media (youtube, instagram, etc.)
   */
  findMatches(text, regex, type) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      this.mediaItems.push({
        type: type,
        url: match[0],
        id: match[1],
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Remove duplicate media items
   * @param {Array} items - Array of media items
   * @returns {Array} - Deduplicated array
   */
  removeDuplicates(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = `${item.type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate HTML for the media report
   * @returns {string} - HTML content
   */
  generateReportHTML() {
    if (this.mediaItems.length === 0) {
      return '<div class="media-report empty">No media links found in content.</div>';
    }

    let html = `
      <div class="media-report">
        <h2>Media Links Report</h2>
        <p>Found ${this.mediaItems.length} media links in content.</p>
        <table class="media-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Preview</th>
              <th>URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.mediaItems.forEach(item => {
      html += `
        <tr>
          <td>${this.getTypeIcon(item.type)} ${item.type}</td>
          <td>${this.getPreviewHTML(item)}</td>
          <td><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.url}</a></td>
          <td>
            <button class="copy-btn" data-url="${item.url}">Copy URL</button>
            ${this.getAdditionalActions(item)}
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div class="export-options">
          <button id="export-json-btn">Export as JSON</button>
          <button id="export-csv-btn">Export as CSV</button>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Get icon for media type
   * @param {string} type - Media type
   * @returns {string} - HTML for icon
   */
  getTypeIcon(type) {
    const icons = {
      youtube: '▶️',
      instagram: '📸',
      twitter: '🐦',
      vimeo: '🎬'
    };
    return icons[type] || '🔗';
  }

  /**
   * Get preview HTML for media item
   * @param {Object} item - Media item
   * @returns {string} - HTML for preview
   */
  getPreviewHTML(item) {
    if (item.type === 'youtube') {
      return `<div class="preview-container"><img src="https://img.youtube.com/vi/${item.id}/mqdefault.jpg" alt="YouTube Thumbnail" class="preview-img"></div>`;
    } else if (item.type === 'instagram') {
      return `<div class="preview-container instagram-preview">${item.id}</div>`;
    } else if (item.type === 'twitter') {
      return `<div class="preview-container twitter-preview">Tweet ID: ${item.id}</div>`;
    } else if (item.type === 'vimeo') {
      return `<div class="preview-container vimeo-preview">Vimeo ID: ${item.id}</div>`;
    }
    return '';
  }

  /**
   * Get additional action buttons for media item
   * @param {Object} item - Media item
   * @returns {string} - HTML for action buttons
   */
  getAdditionalActions(item) {
    if (item.type === 'youtube') {
      return `<a href="https://www.y2mate.com/youtube/${item.id}" target="_blank" rel="noopener noreferrer" class="external-link">View on Y2Mate</a>`;
    } else if (item.type === 'instagram') {
      return `<a href="https://www.instagram.com/p/${item.id}/" target="_blank" rel="noopener noreferrer" class="external-link">View on Instagram</a>`;
    }
    return '';
  }

  /**
   * Export media items as JSON
   * @returns {string} - JSON string
   */
  exportAsJSON() {
    return JSON.stringify(this.mediaItems, null, 2);
  }

  /**
   * Export media items as CSV
   * @returns {string} - CSV string
   */
  exportAsCSV() {
    if (this.mediaItems.length === 0) return '';
    
    const headers = ['Type', 'URL', 'ID', 'Timestamp'];
    const rows = this.mediaItems.map(item => [
      item.type,
      item.url,
      item.id,
      item.timestamp
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }

  /**
   * Initialize event listeners for the media report
   */
  initEventListeners() {
    // Copy URL buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', () => {
        const url = button.getAttribute('data-url');
        navigator.clipboard.writeText(url)
          .then(() => {
            button.textContent = 'Copied!';
            setTimeout(() => {
              button.textContent = 'Copy URL';
            }, 2000);
          })
          .catch(err => {
            console.error('Failed to copy:', err);
            button.textContent = 'Failed';
          });
      });
    });

    // Export buttons
    const exportJSONBtn = document.getElementById('export-json-btn');
    if (exportJSONBtn) {
      exportJSONBtn.addEventListener('click', () => {
        this.downloadFile('media-links.json', this.exportAsJSON(), 'application/json');
      });
    }

    const exportCSVBtn = document.getElementById('export-csv-btn');
    if (exportCSVBtn) {
      exportCSVBtn.addEventListener('click', () => {
        this.downloadFile('media-links.csv', this.exportAsCSV(), 'text/csv');
      });
    }
  }

  /**
   * Download file with content
   * @param {string} filename - File name
   * @param {string} content - File content
   * @param {string} contentType - Content type
   */
  downloadFile(filename, content, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Export the MediaExtractor class
window.MediaExtractor = MediaExtractor;
