/**
 * Toggle Component v1.0.0
 * Created: 2024-03-30
 * 
 * Features:
 * - Toggles between different states
 * - Visual preview of options
 * - Animation effects for selection
 * - Confirmation modal for important changes
 */

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      --primary-color: #004080;
      --secondary-color: #E87722;
      --accent-color: #007bff;
      --bg-color: #f4f4f4;
      --surface-color: #ffffff;
      --text-color: #2b2b2b;
      --border-color: #ddd;
      --status-active: #4CAF50;
      --status-warning: #FFC107;
      --status-error: #F44336;
      --shadow: 0 1px 4px rgba(0,0,0,0.1);
      --border-radius: 12px;
      display: block;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--text-color);
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .toggle-slider {
      background-color: var(--accent-color);
    }

    input:checked + .toggle-slider:before {
      transform: translateX(26px);
    }

    .toggle-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .toggle-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toggle-label {
      font-size: 14px;
      font-weight: 500;
    }

    .toggle-description {
      font-size: 13px;
      color: #666;
      margin-left: 72px;
    }

    .modal-warning {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid var(--status-warning);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      z-index: 1000;
      max-width: 400px;
      text-align: center;
      display: none;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      display: none;
    }
  </style>

  <div class="toggle-container">
    <div class="toggle-header">
      <label class="toggle-switch">
        <input type="checkbox">
        <span class="toggle-slider"></span>
      </label>
      <span class="toggle-label"></span>
    </div>
    <div class="toggle-description"></div>
  </div>

  <div class="modal-overlay"></div>
  <div class="modal-warning">
    <h3>Warning</h3>
    <p></p>
    <div class="buttons">
      <button class="cancel">Cancel</button>
      <button class="proceed">Proceed</button>
    </div>
  </div>
`;

export class Toggle extends HTMLElement {
    static get observedAttributes() {
        return ['name', 'label', 'description', 'warning-message', 'value'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._setupElements();
        this._setupEventListeners();
    }

    _setupElements() {
        this.toggle = this.shadowRoot.querySelector('input[type="checkbox"]');
        this.label = this.shadowRoot.querySelector('.toggle-label');
        this.description = this.shadowRoot.querySelector('.toggle-description');
        this.modal = this.shadowRoot.querySelector('.modal-warning');
        this.overlay = this.shadowRoot.querySelector('.modal-overlay');
    }

    _setupEventListeners() {
        this.toggle.addEventListener('change', (e) => this._handleToggle(e));
        
        this.shadowRoot.querySelector('.cancel').addEventListener('click', () => {
            this.modal.style.display = 'none';
            this.overlay.style.display = 'none';
            this.toggle.checked = !this.toggle.checked;
        });

        this.shadowRoot.querySelector('.proceed').addEventListener('click', () => {
            this.modal.style.display = 'none';
            this.overlay.style.display = 'none';
            this._emitChange();
        });
    }

    _handleToggle(e) {
        if (this.hasAttribute('warning-message')) {
            this.modal.querySelector('p').textContent = this.getAttribute('warning-message');
            this.modal.style.display = 'block';
            this.overlay.style.display = 'block';
        } else {
            this._emitChange();
        }
    }

    _emitChange() {
        const event = new CustomEvent('change', {
            detail: {
                name: this.getAttribute('name'),
                value: this.toggle.checked
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'label':
                this.label.textContent = newValue;
                break;
            case 'description':
                this.description.textContent = newValue;
                break;
            case 'value':
                this.toggle.checked = newValue === 'true';
                break;
        }
    }
}

customElements.define('rl-toggle', Toggle); 