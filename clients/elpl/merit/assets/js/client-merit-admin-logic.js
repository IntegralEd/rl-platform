/**
 * Merit Admin Page Logic
 * Handles configuration and management of Merit chat settings
 */

class MeritAdmin {
    constructor() {
        this.initializeActions();
        this.updateVersionTime();
    }

    initializeActions() {
        // Save button
        document.querySelector('[title="Save Changes"]')
            ?.addEventListener('click', () => this.saveChanges());

        // Preview button
        document.querySelector('[title="Preview Changes"]')
            ?.addEventListener('click', () => this.previewChanges());
    }

    updateVersionTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.querySelector('.version-info').textContent = `v1.0.0 (${hours}:${minutes})`;

        // Update every minute
        setTimeout(() => this.updateVersionTime(), 60000);
    }

    async saveChanges() {
        console.log('Saving changes...');
        // TODO: Implement save functionality
    }

    async previewChanges() {
        console.log('Previewing changes...');
        // TODO: Implement preview functionality
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MeritAdmin();
}); 