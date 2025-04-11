// Merit page logic and form handling

class MeritIntakeForm {
    constructor() {
        this.form = document.querySelector('[data-client-component="merit-intake-form"]');
        this.gradeLevelInput = document.getElementById('grade-level');
        this.curriculumInput = document.getElementById('curriculum');
        this.gradeLevelError = document.getElementById('grade-level-error');
        this.curriculumError = document.getElementById('curriculum-error');
        this.nextButton = document.querySelector('.next-button');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Clear error messages when user starts typing/selecting
        this.gradeLevelInput.addEventListener('change', () => this.clearError('grade-level'));
        this.curriculumInput.addEventListener('input', () => this.clearError('curriculum'));
        
        // Handle form submission
        this.nextButton.addEventListener('click', () => this.handleNextClick());
    }

    clearError(fieldId) {
        document.getElementById(`${fieldId}-error`).textContent = '';
    }

    showError(message) {
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'error-overlay';
        errorOverlay.innerHTML = `
            <div class="error-dialog">
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        document.querySelector('.client-layout').appendChild(errorOverlay);
    }

    validateForm() {
        let isValid = true;
        
        if (!this.gradeLevelInput.value) {
            this.gradeLevelError.textContent = 'Please select a grade level';
            isValid = false;
        }
        
        if (!this.curriculumInput.value) {
            this.curriculumError.textContent = 'Please enter your curriculum';
            isValid = false;
        }

        if (!isValid) {
            this.showError('Please tell us a little about yourself before we get started');
        }
        
        return isValid;
    }

    showLoadingState() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        document.querySelector('.client-layout').appendChild(loadingOverlay);
    }

    async handleNextClick() {
        // Clear any existing errors
        this.clearError('grade-level');
        this.clearError('curriculum');
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        try {
            this.showLoadingState();
            
            // Store form data
            const formData = {
                gradeLevel: this.gradeLevelInput.value,
                curriculum: this.curriculumInput.value
            };
            
            localStorage.setItem('merit_grade_level', formData.gradeLevel);
            localStorage.setItem('merit_curriculum', formData.curriculum);
            
            // Proceed to chat interface
            window.location.href = 'merit-chat.html';
            
        } catch (error) {
            console.error('Error saving form data:', error);
            this.showError('An error occurred while saving your responses. Please try again.');
        }
    }
}

// Initialize the form handler when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const meritForm = new MeritIntakeForm();
}); 