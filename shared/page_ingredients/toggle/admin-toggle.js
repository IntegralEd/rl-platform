/**
 * Admin Toggle Ingredient
 * Extends the base toggle component with admin-specific functionality
 */
import './toggle.js';

export class AdminToggleIngredient extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: 20px;
                }

                .admin-toggles {
                    display: grid;
                    gap: 16px;
                }

                .toggle-group {
                    background: var(--surface-color, #fff);
                    border-radius: var(--border-radius, 8px);
                    padding: 16px;
                    box-shadow: var(--shadow, 0 1px 3px rgba(0,0,0,0.1));
                }

                h3 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    color: var(--primary-color, #004080);
                }
            </style>

            <div class="admin-toggles">
                <div class="toggle-group">
                    <h3>System Controls</h3>
                    <rl-toggle 
                        name="live-mode"
                        label="Live Mode"
                        description="Toggle to enable/disable live mode"
                        warning-message="Changing live mode will affect all users">
                    </rl-toggle>
                    <rl-toggle
                        name="debug-mode"
                        label="Debug Mode"
                        description="Enable debug logging and testing features">
                    </rl-toggle>
                    <rl-toggle
                        name="maintenance-mode"
                        label="Maintenance Mode"
                        description="Put the system into maintenance mode"
                        warning-message="Enabling maintenance mode will prevent user access">
                    </rl-toggle>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.querySelectorAll('rl-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const { name, value } = e.detail;
                console.log(`Admin toggle changed: ${name} = ${value}`);
                // Here you would typically make an API call to update the toggle state
            });
        });
    }
}

customElements.define('admin-toggle', AdminToggleIngredient); 