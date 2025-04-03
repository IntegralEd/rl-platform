// ST-specific auth handling
const STAuth = {
    formState: {
        standardsChoice: null,
        standardsLink: '',
        standardsDetail: '',
        reflectionChoice: null,
        reflectionDetail: ''
    },

    handleStandardsChoice(choice) {
        this.formState.standardsChoice = choice;
        const standardsDetail = document.getElementById('standards-detail');
        
        if (choice === 'yes') {
            standardsDetail.classList.add('visible');
        } else {
            standardsDetail.classList.remove('visible');
        }
        this.checkFormCompletion();
    },

    handleReflectionChoice(choice) {
        this.formState.reflectionChoice = choice;
        const reflectionDetail = document.getElementById('reflection-detail');
        
        if (choice === 'yes') {
            reflectionDetail.classList.add('visible');
        } else {
            reflectionDetail.classList.remove('visible');
        }
        this.checkFormCompletion();
    },

    checkFormCompletion() {
        const nextButton = document.querySelector('.next-button');
        const isComplete = this.formState.standardsChoice || this.formState.reflectionChoice;
        
        nextButton.classList.toggle('enabled', isComplete);
        nextButton.disabled = !isComplete;
        nextButton.style.background = isComplete ? '#E87722' : '#ccc';
        nextButton.style.cursor = isComplete ? 'pointer' : 'not-allowed';
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.STAuth = STAuth;
}); 