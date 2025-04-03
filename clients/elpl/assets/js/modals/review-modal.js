// Review Modal Configuration
const REVIEW_CONFIG = {
    mode: 'client_review', // or 'user_feedback' or 'support'
    forms: {
        client_review: 'https://integral-mothership.softr.app/embed/pages/c6b8b431-e9eb-4736-94e4-83e3c4895c27/blocks/form1',
        user_feedback: 'https://integral-mothership.softr.app/embed/pages/feedback',
        support: 'https://integral-mothership.softr.app/embed/pages/support'
    },
    bubbleStyles: {
        client_review: {
            color: '#C6123F',
            icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z'
        },
        user_feedback: {
            color: '#007AFF',
            icon: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
        },
        support: {
            color: '#34C759',
            icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z'
        }
    }
};

class ReviewModal {
    constructor(config = {}) {
        this.config = {
            ...REVIEW_CONFIG,
            ...config
        };
        this.mode = this.config.mode;
        this.initialized = false;
    }

    getContextData() {
        const baseContext = {
            source_url: window.location.href,
            client_id: window.CHAT_CONFIG?.clientId || 'elpl',
            thread_id: window.threadId || 'new_chat',
            page_title: document.title,
            timestamp: new Date().toISOString(),
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            referrer: document.referrer,
            user_agent: navigator.userAgent
        };

        // Add Softr context if available
        if (window.Softr?.user?.get) {
            try {
                const softrData = window.Softr.user.get();
                baseContext.softr_user = softrData;
            } catch (e) {
                console.log('No Softr user data available');
            }
        }

        // Add chat context if available
        if (window.chatCore?.getGrade) {
            baseContext.grade = window.chatCore.getGrade();
        }

        return baseContext;
    }

    createStyles() {
        const bubbleStyle = this.config.bubbleStyles[this.mode];
        return `
            .review-bubble {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background-color: ${bubbleStyle.color};
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease;
            }
            
            .review-bubble:hover {
                transform: scale(1.1);
            }
            
            .review-bubble svg {
                width: 24px;
                height: 24px;
                fill: white;
            }
            
            .review-modal {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 900px;
                height: 600px;
                max-width: 95vw;
                max-height: 95vh;
                background: white;
                border-radius: 12px;
                box-shadow: 0 5px 30px rgba(0,0,0,0.3);
                z-index: 10001;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .review-modal.active {
                display: block;
                opacity: 1;
            }
            
            .review-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .review-overlay.active {
                display: block;
                opacity: 1;
            }
            
            .review-close {
                position: absolute;
                top: -40px;
                right: 0;
                color: white;
                font-size: 30px;
                cursor: pointer;
                padding: 5px;
            }
            
            .review-iframe {
                width: 100%;
                height: 100%;
                border: none;
                border-radius: 12px;
            }

            .review-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: #666;
            }
        `;
    }

    init() {
        if (this.initialized) return;

        // Inject styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = this.createStyles();
        document.head.appendChild(styleSheet);

        // Create bubble
        const bubble = document.createElement('div');
        bubble.className = 'review-bubble';
        bubble.setAttribute('aria-label', `Open ${this.mode.replace('_', ' ')}`);
        bubble.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="${this.config.bubbleStyles[this.mode].icon}"/>
            </svg>
        `;

        // Create modal structure
        const modal = document.createElement('div');
        modal.className = 'review-modal';
        modal.innerHTML = `
            <span class="review-close">&times;</span>
            <div class="review-loading">Loading form...</div>
            <iframe class="review-iframe" style="opacity: 0;"></iframe>
        `;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'review-overlay';

        // Add to DOM
        document.body.appendChild(bubble);
        document.body.appendChild(modal);
        document.body.appendChild(overlay);

        // Load iframe resizer
        if (!window.iFrameResize) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.2.11/iframeResizer.min.js';
            script.onload = () => this.setupIframeResizer();
            document.head.appendChild(script);
        } else {
            this.setupIframeResizer();
        }

        // Event listeners
        bubble.addEventListener('click', () => this.open());
        modal.querySelector('.review-close').addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.close();
        });

        this.elements = { bubble, modal, overlay };
        this.initialized = true;
    }

    setupIframeResizer() {
        iFrameResize({ 
            checkOrigin: false,
            log: false,
            heightCalculationMethod: 'lowestElement',
            onMessage: (messageData) => {
                console.log(`${this.mode} message:`, messageData);
            }
        }, '.review-iframe');
    }

    open() {
        const iframe = this.elements.modal.querySelector('.review-iframe');
        const formUrl = this.config.forms[this.mode];
        const context = this.getContextData();
        
        // Show loading state
        iframe.style.opacity = '0';
        this.elements.modal.querySelector('.review-loading').style.display = 'block';
        
        // Set iframe src with context
        iframe.src = `${formUrl}#${encodeURIComponent(JSON.stringify(context))}`;
        
        // Show modal
        this.elements.modal.classList.add('active');
        this.elements.overlay.classList.add('active');

        // Handle iframe load
        iframe.onload = () => {
            iframe.style.opacity = '1';
            this.elements.modal.querySelector('.review-loading').style.display = 'none';
        };
    }

    close() {
        this.elements.modal.classList.remove('active');
        this.elements.overlay.classList.remove('active');
        // Clear iframe
        setTimeout(() => {
            this.elements.modal.querySelector('.review-iframe').src = '';
        }, 300);
    }

    setMode(mode) {
        if (this.config.forms[mode]) {
            this.mode = mode;
            // Update bubble style
            const bubbleStyle = this.config.bubbleStyles[mode];
            const bubble = this.elements.bubble;
            bubble.style.backgroundColor = bubbleStyle.color;
            bubble.querySelector('path').setAttribute('d', bubbleStyle.icon);
            bubble.setAttribute('aria-label', `Open ${mode.replace('_', ' ')}`);
        }
    }
}

// Export for use
window.ReviewModal = ReviewModal; 