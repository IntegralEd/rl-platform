const ReviewSession = {
    formData: null,

    init() {
        this.attachEventListeners();
    },

    attachEventListeners() {
        document.querySelectorAll('#reviewSessionTab input, #reviewSessionTab textarea')
            .forEach(input => {
                input.addEventListener('change', () => this.markUnsaved());
            });
    },

    markUnsaved() {
        const section = document.querySelector('#reviewSessionTab')
            .closest('.collapsible-section');
        section.querySelector('.section-header').classList.add('unsaved');
    },

    collectFormData() {
        this.formData = {
            title: document.getElementById('reviewTitle').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            reviewerEmails: document.getElementById('reviewerEmails').value.split('\n'),
            reviewerRole: document.getElementById('reviewerRole').value,
            instructions: document.getElementById('reviewInstructions').value,
            requireAuth: document.getElementById('requireAuth').checked,
            trackChanges: document.getElementById('trackChanges').checked,
            clientId: window.clientId, // Set by main admin.js
            projectId: window.projectId
        };
        return this.formData;
    },

    async preview() {
        const data = this.collectFormData();
        // Generate preview URL with tokenized access
        const previewUrl = await this.generatePreviewUrl(data);
        window.open(previewUrl, '_blank');
    },

    async launch() {
        const data = this.collectFormData();
        try {
            // Create review session in Airtable
            const sessionId = await this.createAirtableSession(data);
            // Generate review URLs
            const reviewUrls = await this.generateReviewUrls(sessionId, data);
            // Send email notifications
            await this.notifyReviewers(reviewUrls, data);
            
            this.showSuccess('Review session launched successfully!');
        } catch (error) {
            console.error('Failed to launch review session:', error);
            this.showError('Failed to launch review session. Please try again.');
        }
    },

    async generatePreviewUrl(data) {
        // TODO: Implement preview URL generation
        return `/clients/${data.clientId}/${data.projectId}/_review.html?preview=true`;
    },

    async createAirtableSession(data) {
        // TODO: Implement Airtable integration
        console.log('Creating Airtable session:', data);
        return 'temp_session_id';
    },

    async generateReviewUrls(sessionId, data) {
        // TODO: Implement review URL generation
        return data.reviewerEmails.map(email => ({
            email,
            url: `/clients/${data.clientId}/${data.projectId}/_review.html?session=${sessionId}`
        }));
    },

    async notifyReviewers(reviewUrls, data) {
        // TODO: Implement email notification
        console.log('Notifying reviewers:', reviewUrls);
    },

    showSuccess(message) {
        // TODO: Implement success notification
        console.log('Success:', message);
    },

    showError(message) {
        // TODO: Implement error notification
        console.error('Error:', message);
    }
};

// Initialize when loaded
document.addEventListener('DOMContentLoaded', () => ReviewSession.init()); 