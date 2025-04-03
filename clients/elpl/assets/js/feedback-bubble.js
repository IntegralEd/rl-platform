(function() {
    // Styles
    const styles = `
        .feedback-bubble {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background-color: var(--primary-color, #C6123F);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }
        
        .feedback-bubble:hover {
            transform: scale(1.1);
        }
        
        .feedback-bubble svg {
            width: 24px;
            height: 24px;
            fill: white;
        }
        
        .feedback-modal {
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
        }
        
        .feedback-modal.active {
            display: block;
        }
        
        .feedback-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
        }
        
        .feedback-overlay.active {
            display: block;
        }
        
        .feedback-close {
            position: absolute;
            top: -40px;
            right: 0;
            color: white;
            font-size: 30px;
            cursor: pointer;
            padding: 5px;
        }
        
        .feedback-iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 12px;
        }
    `;

    // Create and inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create bubble
    const bubble = document.createElement('div');
    bubble.className = 'feedback-bubble';
    bubble.setAttribute('aria-label', 'Open feedback form');
    bubble.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'feedback-modal';
    modal.innerHTML = `
        <span class="feedback-close">&times;</span>
        <iframe class="feedback-iframe"></iframe>
    `;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';

    // Add to DOM
    document.body.appendChild(bubble);
    document.body.appendChild(modal);
    document.body.appendChild(overlay);

    // Load iframe resizer
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.2.11/iframeResizer.min.js';
    script.onload = function() {
        iFrameResize({ 
            checkOrigin: false,
            log: false,
            heightCalculationMethod: 'lowestElement'
        }, '.feedback-iframe');
    };
    document.head.appendChild(script);

    function openFeedback() {
        const iframe = modal.querySelector('.feedback-iframe');
        const baseFormUrl = 'https://integral-mothership.softr.app/embed/pages/c6b8b431-e9eb-4736-94e4-83e3c4895c27/blocks/form1';
        
        // Get context
        const context = {
            source_url: window.location.href,
            client_id: window.CHAT_CONFIG?.clientId || 'elpl',
            thread_id: window.threadId || 'new_chat',
            page_title: document.title,
            timestamp: new Date().toISOString()
        };
        
        // Set iframe src with context
        iframe.src = `${baseFormUrl}#${encodeURIComponent(JSON.stringify(context))}`;
        
        // Show modal
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    function closeFeedback() {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        modal.querySelector('.feedback-iframe').src = '';
    }

    // Event listeners
    bubble.addEventListener('click', openFeedback);
    modal.querySelector('.feedback-close').addEventListener('click', closeFeedback);
    overlay.addEventListener('click', closeFeedback);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeFeedback();
    });
})(); 