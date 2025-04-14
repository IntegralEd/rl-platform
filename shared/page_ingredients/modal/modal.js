/**
 * @component Modal
 * @description Standardized modal component for the Recursive Learning platform
 * @version 1.0.0
 */
export class Modal {
    constructor(options = {}) {
        this.id = options.id || 'platform-modal';
        this.title = options.title || '';
        this.content = options.content || '';
        this.closeOnOverlay = options.closeOnOverlay !== false;
        this.showCloseButton = options.showCloseButton !== false;
        this.customClass = options.customClass || '';
        this.zIndex = options.zIndex || 200;
        
        this.element = null;
        this.overlay = null;
        this.isOpen = false;
        
        this.#createModal();
    }
    
    #createModal() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.style.zIndex = this.zIndex;
        
        if (this.closeOnOverlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
        }
        
        // Create modal
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = `platform-modal ${this.customClass}`.trim();
        
        // Add header if title or close button
        if (this.title || this.showCloseButton) {
            const header = document.createElement('div');
            header.className = 'modal-header';
            
            if (this.title) {
                const title = document.createElement('h2');
                title.className = 'modal-title';
                title.textContent = this.title;
                header.appendChild(title);
            }
            
            if (this.showCloseButton) {
                const closeButton = document.createElement('button');
                closeButton.className = 'modal-close';
                closeButton.innerHTML = '&times;';
                closeButton.addEventListener('click', () => this.close());
                header.appendChild(closeButton);
            }
            
            this.element.appendChild(header);
        }
        
        // Add content
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.innerHTML = this.content;
        this.element.appendChild(content);
        
        // Add to overlay
        this.overlay.appendChild(this.element);
    }
    
    open() {
        if (this.isOpen) return;
        
        document.body.appendChild(this.overlay);
        document.body.style.overflow = 'hidden';
        
        // Trigger animation
        requestAnimationFrame(() => {
            this.overlay.classList.add('modal-visible');
            this.element.classList.add('modal-visible');
        });
        
        this.isOpen = true;
        
        // Dispatch event
        this.element.dispatchEvent(new CustomEvent('modal:opened'));
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.overlay.classList.remove('modal-visible');
        this.element.classList.remove('modal-visible');
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(this.overlay);
            document.body.style.overflow = '';
        }, 300);
        
        this.isOpen = false;
        
        // Dispatch event
        this.element.dispatchEvent(new CustomEvent('modal:closed'));
    }
    
    setContent(content) {
        const contentElement = this.element.querySelector('.modal-content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
    }
    
    setTitle(title) {
        const titleElement = this.element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    destroy() {
        if (this.isOpen) {
            this.close();
        }
        
        this.element = null;
        this.overlay = null;
    }
}

export default Modal; 