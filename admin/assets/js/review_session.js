/**
 * Review Session Management for Goalsetter Admin
 * 
 * This script handles token validation, reviewer management,
 * and synchronization with the review page.
 */

// Sample review sessions data (would be replaced by API calls in production)
const reviewSessions = [
    {
        sessionId: 'reclsM4lpZVwg7LnC',
        reviewer: 'Cara',
        email: 'cara@integral-ed.com',
        startDate: '2025-04-07',
        endDate: '2025-04-11',
        role: 'client_sme',
        notes: 'Review sprint 3 deliverables'
    },
    {
        sessionId: 'recgL7pIF0tNooOEC',
        reviewer: 'Mike',
        email: 'mike@example.com',
        startDate: '2025-04-01',
        endDate: '2025-04-04',
        role: 'internal',
        notes: 'Technical review before client handoff'
    }
];

// Sample resource data from Airtable
const resourceData = [
    {
        id: 'rec1',
        name: 'Goalsetter',
        logoUrl: '/shared/assets/images/StriveTogether-Logo-Black.jpg',
        statusApi: 'active',
        statusContent: 'warning',
        statusReviewers: 'error',
        modes: ['live', 'temp', 'review', 'lrs']
    },
    {
        id: 'rec2',
        name: 'Continuous Improvement',
        logoUrl: '/shared/assets/images/StriveTogether-Logo-Black.jpg',
        statusApi: 'active',
        statusContent: 'active',
        statusReviewers: 'warning',
        modes: ['live', 'temp', 'review']
    },
    {
        id: 'rec3',
        name: 'Network Leader',
        logoUrl: '/shared/assets/images/StriveTogether-Logo-Black.jpg',
        statusApi: 'active',
        statusContent: 'error',
        statusReviewers: 'warning',
        modes: ['live', 'temp', 'review']
    }
];

// When the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the review sessions form
    initReviewForm();
    
    // Handle form submission
    const form = document.getElementById('new-review-session');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            createReviewSession();
        });
    }
    
    // Initialize resource tree navigation
    initResourceTree();
    
    // Initialize tab switching
    initTabs();
});

/**
 * Initialize the resource tree navigation
 */
function initResourceTree() {
    // Add click handlers to resource headers
    document.querySelectorAll('.resource-header').forEach(header => {
        header.addEventListener('click', function() {
            const item = this.closest('.resource-item');
            const currentlyExpanded = item.classList.contains('expanded');
            
            // Close all resource items
            document.querySelectorAll('.resource-item').forEach(ri => {
                ri.classList.remove('expanded');
                ri.querySelector('.toggle-icon').textContent = '►';
            });
            
            // If the clicked item wasn't expanded, expand it
            if (!currentlyExpanded) {
                item.classList.add('expanded');
                item.querySelector('.toggle-icon').textContent = '▼';
            }
        });
    });
    
    // Add click handlers for resource links
    document.querySelectorAll('.resource-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.resource-link').forEach(l => {
                l.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the mode
            const mode = this.getAttribute('data-mode');
            
            // Switch to the appropriate tab
            if (mode === 'review') {
                switchTab('review');
            } else if (mode === 'live') {
                // Open live view in new tab
                window.open('/clients/st/goalsetter/goalsetter.html', '_blank');
            } else if (mode === 'temp') {
                // Open temp view in new tab
                window.open('/clients/st/goalsetter/goalsetter_temp.html', '_blank');
            } else if (mode === 'lrs') {
                switchTab('reports');
            }
        });
    });
}

/**
 * Initialize tab switching functionality
 */
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

/**
 * Switch to the specified tab
 */
function switchTab(tabId) {
    // Update tab highlighting
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    
    // Show the selected tab content, hide others
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = content.id === tabId ? 'block' : 'none';
    });
}

/**
 * Initialize the new review session form with defaults
 */
function initReviewForm() {
    // Set today as default start date
    const today = new Date();
    const startDateInput = document.getElementById('start-date');
    if (startDateInput) {
        startDateInput.valueAsDate = today;
    }
    
    // Set default end date as 7 days from now
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7);
    const endDateInput = document.getElementById('end-date');
    if (endDateInput) {
        endDateInput.valueAsDate = endDate;
    }
}

/**
 * Clear the review session form
 */
function clearForm() {
    document.getElementById('reviewer-name').value = '';
    document.getElementById('reviewer-email').value = '';
    initReviewForm(); // Reset dates to default
    document.getElementById('reviewer-role').value = 'client_sme';
    document.getElementById('review-notes').value = '';
}

/**
 * Create a new review session
 */
function createReviewSession() {
    // Get form values
    const name = document.getElementById('reviewer-name').value;
    const email = document.getElementById('reviewer-email').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const role = document.getElementById('reviewer-role').value;
    const notes = document.getElementById('review-notes').value;
    
    // Generate a new session ID (would be handled by the backend in production)
    const sessionId = 'rec' + Math.random().toString(36).substring(2, 10);
    
    // Create new session object
    const newSession = {
        sessionId,
        reviewer: name,
        email,
        startDate,
        endDate,
        role,
        notes
    };
    
    // Add to sessions array (in production, this would be an API call)
    reviewSessions.push(newSession);
    
    // Add to the table
    addSessionToTable(newSession);
    
    // Show success message
    alert(`Review session created for ${name}. Session ID: ${sessionId}`);
    
    // Clear the form
    clearForm();
    
    // Update status lights to indicate a new reviewer
    updateStatusLights('Goalsetter', 'reviewers', 'active');
}

/**
 * Add a session to the table
 */
function addSessionToTable(session) {
    const table = document.getElementById('review-sessions-table');
    if (!table) return;
    
    // Create row
    const row = document.createElement('tr');
    
    // Check if session is active or expired
    const today = new Date();
    const endDate = new Date(session.endDate);
    const isActive = today <= endDate;
    
    // Add cells
    row.innerHTML = `
        <td>${session.sessionId}</td>
        <td>${session.reviewer}</td>
        <td>${session.startDate}</td>
        <td>${session.endDate}</td>
        <td><span class="badge badge-${isActive ? 'success' : 'error'}">${isActive ? 'Active' : 'Expired'}</span></td>
        <td>
            <button class="action-button" onclick="copyReviewLink('${session.sessionId}')">Copy Link</button>
            <button class="action-button" onclick="extendSession('${session.sessionId}')">Extend</button>
        </td>
    `;
    
    // Add to table
    table.appendChild(row);
}

/**
 * Copy a review link to clipboard
 */
function copyReviewLink(sessionId) {
    // Get the base URL
    const baseUrl = window.location.origin;
    
    // Construct review URL
    const reviewUrl = `${baseUrl}/clients/st/goalsetter/goalsetter_review.html?qcid=${sessionId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(reviewUrl)
        .then(() => {
            alert('Review link copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy review link: ', err);
            alert('Failed to copy link. Please copy this URL manually: ' + reviewUrl);
        });
}

/**
 * Extend a review session
 */
function extendSession(sessionId) {
    // Find the session
    const session = reviewSessions.find(s => s.sessionId === sessionId);
    if (!session) return;
    
    // Calculate new end date (add 7 days from today)
    const today = new Date();
    const newEndDate = new Date();
    newEndDate.setDate(today.getDate() + 7);
    
    // Format date for display (YYYY-MM-DD)
    const formattedEndDate = newEndDate.toISOString().split('T')[0];
    
    // Update session
    session.endDate = formattedEndDate;
    
    // Update UI
    const sessionRow = Array.from(document.querySelectorAll('#review-sessions-table tr'))
        .find(row => row.firstElementChild.textContent === sessionId);
    
    if (sessionRow) {
        // Update end date cell
        sessionRow.children[3].textContent = formattedEndDate;
        
        // Update status cell
        sessionRow.children[4].innerHTML = '<span class="badge badge-success">Active</span>';
    }
    
    // Update status lights for reviewers (since now there's an active reviewer)
    updateStatusLights('Goalsetter', 'reviewers', 'active');
    
    alert(`Session for ${session.reviewer} extended to ${formattedEndDate}`);
}

/**
 * Update the review page with current token data
 */
function updateReviewPage() {
    const activeTokens = reviewSessions.filter(session => {
        const today = new Date();
        const endDate = new Date(session.endDate);
        return today <= endDate;
    });
    
    alert(`Review page will be updated with ${activeTokens.length} active tokens.
In a production environment, this would update the token validation table in goalsetter_review.html.`);
    
    console.log('Tokens to update:', activeTokens);
    
    // In production, this would make an API call to update the review page
    
    // Update status lights for content (since content was updated)
    updateStatusLights('Goalsetter', 'content', 'active');
}

/**
 * Update status lights for a resource
 */
function updateStatusLights(resourceName, lightType, status) {
    // Find the resource item
    const resourceItems = document.querySelectorAll('.resource-item');
    for (const item of resourceItems) {
        if (item.querySelector('.resource-name').textContent === resourceName) {
            // Find the appropriate light
            let light;
            if (lightType === 'api') {
                light = item.querySelector('.status-light:nth-child(1)');
            } else if (lightType === 'content') {
                light = item.querySelector('.status-light:nth-child(2)');
            } else if (lightType === 'reviewers') {
                light = item.querySelector('.status-light:nth-child(3)');
            }
            
            if (light) {
                // Remove all status classes
                light.classList.remove('active', 'warning', 'error');
                // Add the new status class
                light.classList.add(status);
            }
            
            break;
        }
    }
} 