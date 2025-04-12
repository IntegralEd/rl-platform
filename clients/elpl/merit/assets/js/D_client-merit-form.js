/**
 * Merit form functionality
 * Handles form validation and submission
 */

class MeritForm {
    constructor(config = {}) {
        this.config = {
            formSelector: config.formSelector || '.welcome-form',
            gradeLevelId: config.gradeLevelId || 'grade-level',
            curriculumId: config.curriculumId || 'curriculum',
            nextButtonSelector: config.nextButtonSelector || '.next-button',
            nextIcon: config.nextIcon || '/clients/elpl/assets/images/noun-next-5654311-FFFFFF.svg',
            onSubmit: config.onSubmit || (() => {})
        };

        this.elements = {
            form: document.querySelector(this.config.formSelector),
            gradeLevel: document.getElementById(this.config.gradeLevelId),
            curriculum: document.getElementById(this.config.curriculumId),
            nextButton: document.querySelector(this.config.nextButtonSelector)
        };

        this.setupEventListeners();
        this.validateForm(); // Initial validation
    }

    setupEventListeners() {
        this.elements.form.addEventListener('input', () => this.validateForm());
        this.elements.nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.handleSubmit();
            }
        });
    }

    validateForm() {
        const isValid = this.elements.gradeLevel.value && 
                       this.elements.curriculum.value;
        
        this.elements.nextButton.classList.toggle('enabled', isValid);
        this.elements.nextButton.setAttribute('aria-disabled', !isValid);
        
        return isValid;
    }

    getFormData() {
        return {
            gradeLevel: this.elements.gradeLevel.value,
            curriculum: this.elements.curriculum.value
        };
    }

    handleSubmit() {
        if (typeof this.config.onSubmit === 'function') {
            this.config.onSubmit(this.getFormData());
        }
    }

    reset() {
        this.elements.form.reset();
        this.validateForm();
    }

    hide() {
        this.elements.form.style.display = 'none';
    }

    show() {
        this.elements.form.style.display = '';
    }
}

// Export for use in other files
export default MeritForm; 