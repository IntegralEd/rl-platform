const Auth = {
    checkAffirmations: function() {
        const checkboxes = document.querySelectorAll('.affirmation-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        const nextButton = document.getElementById('next-button');
        const accountButton = document.getElementById('account-button');
        
        if (nextButton) nextButton.disabled = !allChecked;
        if (accountButton) accountButton.disabled = !allChecked;

        if (allChecked) {
            document.dispatchEvent(new Event('auth:affirmationsChecked'));
        }
    },

    init: function() {
        document.querySelectorAll('.affirmation-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.checkAffirmations());
        });

        // Add click handler for next button
        const nextButton = document.getElementById('next-button');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                Navigation.showSection(1); // Move to chat section
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
}); 