export default class ToggleIngredient extends HTMLElement {
    constructor(page) {
        super();
        this.page = page;
        this.render();
    }

    async render() {
        this.innerHTML = `
            <style>
                .toggle-ingredient {
                    padding: 20px;
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
                    background-color: #2196F3;
                }

                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }

                .toggle-label {
                    margin-left: 12px;
                    font-size: 16px;
                    vertical-align: middle;
                }

                .toggle-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .toggle-description {
                    margin-top: 4px;
                    color: #666;
                    font-size: 14px;
                }
            </style>
            <div class="toggle-ingredient">
                <h2>${this.page} Toggles</h2>
                <div class="toggle-row">
                    <label class="toggle-switch">
                        <input type="checkbox" id="liveToggle">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">Live Mode</span>
                </div>
                <p class="toggle-description">Toggle to enable/disable live mode for ${this.page}</p>
                
                <div class="toggle-row">
                    <label class="toggle-switch">
                        <input type="checkbox" id="debugToggle">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">Debug Mode</span>
                </div>
                <p class="toggle-description">Enable debug logging and testing features</p>
                
                <div class="toggle-row">
                    <label class="toggle-switch">
                        <input type="checkbox" id="maintenanceToggle">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">Maintenance Mode</span>
                </div>
                <p class="toggle-description">Put ${this.page} into maintenance mode</p>
            </div>
        `;

        // Add event listeners
        this.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const toggleId = e.target.id;
                const isChecked = e.target.checked;
                console.log(`${this.page} - ${toggleId}: ${isChecked}`);
                // Here you would typically make an API call to update the toggle state
            });
        });
    }
}

customElements.define('toggle-ingredient', ToggleIngredient); 