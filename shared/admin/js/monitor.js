// Page state monitoring and health checks
const PageMonitor = {
    // Configuration
    config: {
        checkInterval: 60000, // Check every minute
        endpoints: {
            goalsetter: '/clients/st/goalsetter_live.html',
            admin: '/shared/admin/pages/goalsetter.html'
        },
        expectedStates: {
            temp: {
                selectors: {
                    iframe: 'iframe[src*="chatbase.co"]',
                    container: '.iframe-container'
                }
            },
            prod: {
                selectors: {
                    chat: '.chat-container',
                    input: '#chat-input'
                }
            }
        }
    },

    // Health check methods
    async checkPageHealth(endpoint) {
        try {
            const response = await fetch(endpoint);
            return {
                status: response.status,
                ok: response.ok,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 0,
                ok: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    },

    // State validation
    async validatePageState(endpoint) {
        try {
            // Use a headless browser or similar to check actual page content
            const state = localStorage.getItem('adminPanelState');
            const config = state ? JSON.parse(state).pages.goalsetter : { status: 'temp' };
            
            // Create report
            const report = {
                endpoint,
                expectedState: config.status,
                actualState: null,
                matches: false,
                timestamp: new Date().toISOString()
            };

            // Send to Qipu
            await this.sendQipuReport(report);
            return report;
        } catch (error) {
            console.error('State validation failed:', error);
            return {
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    },

    // Qipu integration
    async sendQipuReport(report) {
        try {
            const ticket = {
                type: 'monitor',
                data: {
                    ...report,
                    screenshot: await this.captureScreenshot()
                }
            };

            const response = await fetch('/api/qipu/ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticket)
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to send Qipu report:', error);
            return false;
        }
    },

    // Screenshot capture
    async captureScreenshot() {
        // Placeholder for actual screenshot capture logic
        // Could use html2canvas or similar
        return null;
    },

    // Start monitoring
    startMonitoring() {
        this.checkAll();
        setInterval(() => this.checkAll(), this.config.checkInterval);
    },

    // Check all endpoints
    async checkAll() {
        const results = {};
        for (const [name, endpoint] of Object.entries(this.config.endpoints)) {
            results[name] = {
                health: await this.checkPageHealth(endpoint),
                state: await this.validatePageState(endpoint)
            };
        }
        this.updateDashboard(results);
    },

    // Update dashboard
    updateDashboard(results) {
        const dashboard = document.getElementById('monitor-dashboard');
        if (!dashboard) return;

        dashboard.innerHTML = Object.entries(results).map(([name, result]) => `
            <div class="monitor-item ${result.health.ok ? 'healthy' : 'unhealthy'}">
                <h3>${name}</h3>
                <div>Status: ${result.health.status}</div>
                <div>State: ${result.state.expectedState}</div>
                <div>Last Check: ${result.health.timestamp}</div>
            </div>
        `).join('');
    }
};

// Export for use in admin pages
export default PageMonitor; 