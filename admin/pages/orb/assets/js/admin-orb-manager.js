// ORB Manager Component
class OrbManager {
    constructor() {
        this.version = 'orb-admin.html/04132025.0339am.v.1.0.0';
        this.components = new Map();
        this.activeSection = 'dashboard';
    }

    async initialize() {
        console.log(`[ORB Manager] Initializing ${this.version}`);
        
        // Register components
        this.registerComponents();
        
        // Setup navigation
        this.setupNavigation();
        
        // Load initial data
        await this.loadDashboardData();
        
        console.log('[ORB Manager] Initialization complete');
    }

    registerComponents() {
        // Register all ORB components
        const components = document.querySelectorAll('[data-admin-component^="orb-"]');
        components.forEach(component => {
            const type = component.dataset.adminComponent;
            this.components.set(type, component);
            console.log(`[ORB Manager] Registered component: ${type}`);
        });
    }

    setupNavigation() {
        // Setup navigation handlers
        const navLinks = document.querySelectorAll('.nav-card');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.navigateToSection(section);
            });
        });

        // Handle browser navigation
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.navigateToSection(e.state.section, false);
            }
        });
    }

    async navigateToSection(section, updateHistory = true) {
        // Update active section
        const oldSection = document.querySelector(`.content-section.active`);
        const newSection = document.querySelector(`#${section}`);
        
        if (oldSection) oldSection.classList.remove('active');
        if (newSection) newSection.classList.add('active');
        
        // Update navigation
        const oldNav = document.querySelector('.nav-card.active');
        const newNav = document.querySelector(`[href="#${section}"]`);
        
        if (oldNav) oldNav.classList.remove('active');
        if (newNav) newNav.classList.add('active');
        
        // Update history if needed
        if (updateHistory) {
            history.pushState({ section }, '', `#${section}`);
        }
        
        // Load section data
        await this.loadSectionData(section);
        
        this.activeSection = section;
    }

    async loadDashboardData() {
        const statusCards = this.components.get('orb-status-cards');
        const activityFeed = this.components.get('orb-activity-feed');
        const metricsSummary = this.components.get('orb-metrics-summary');

        if (statusCards) {
            // Load status cards data
            const statusData = await this.fetchStatusData();
            this.renderStatusCards(statusCards, statusData);
        }

        if (activityFeed) {
            // Load activity feed
            const activityData = await this.fetchActivityData();
            this.renderActivityFeed(activityFeed, activityData);
        }

        if (metricsSummary) {
            // Load metrics data
            const metricsData = await this.fetchMetricsData();
            this.renderMetricsSummary(metricsSummary, metricsData);
        }
    }

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'frontend':
                await this.loadRulesetData('frontend');
                break;
            case 'standup':
                await this.loadStandupData();
                break;
            case 'burndown':
                await this.loadBurndownData();
                break;
            case 'metrics':
                await this.loadCloudWatchData();
                break;
        }
    }

    async fetchStatusData() {
        // Fetch status data from API
        return [
            { title: 'Frontend Rules', status: 'active', count: 15 },
            { title: 'Admin Rules', status: 'active', count: 12 },
            { title: 'Redis Rules', status: 'active', count: 8 }
        ];
    }

    async fetchActivityData() {
        // Fetch activity data from API
        return [
            { type: 'update', message: 'Frontend ruleset updated', time: '5m ago' },
            { type: 'merge', message: 'Merged admin layout changes', time: '15m ago' },
            { type: 'deploy', message: 'Deployed v1.15 to production', time: '1h ago' }
        ];
    }

    async fetchMetricsData() {
        // Fetch metrics data from CloudWatch
        return {
            apiCalls: { current: 1250, previous: 1100 },
            errorRate: { current: 0.5, previous: 0.8 },
            responseTime: { current: 250, previous: 280 }
        };
    }

    renderStatusCards(container, data) {
        container.innerHTML = data.map(item => `
            <div class="orb-card">
                <h3>${item.title}</h3>
                <div class="status ${item.status}">${item.count} rules</div>
            </div>
        `).join('');
    }

    renderActivityFeed(container, data) {
        container.innerHTML = data.map(item => `
            <div class="activity-item">
                <div class="activity-icon ${item.type}"></div>
                <div class="activity-message">${item.message}</div>
                <div class="activity-time">${item.time}</div>
            </div>
        `).join('');
    }

    renderMetricsSummary(container, data) {
        container.innerHTML = `
            <div class="metric-chart">
                <h3>API Calls</h3>
                <div class="chart-container" data-metric="apiCalls">
                    ${this.formatMetric(data.apiCalls)}
                </div>
            </div>
            <div class="metric-chart">
                <h3>Error Rate</h3>
                <div class="chart-container" data-metric="errorRate">
                    ${this.formatMetric(data.errorRate)}
                </div>
            </div>
        `;
    }

    formatMetric(data) {
        const change = ((data.current - data.previous) / data.previous) * 100;
        const trend = change >= 0 ? 'up' : 'down';
        return `
            <div class="metric-value">${data.current}</div>
            <div class="metric-change ${trend}">${change.toFixed(1)}%</div>
        `;
    }
}

// Initialize ORB Manager
document.addEventListener('DOMContentLoaded', () => {
    const orbManager = new OrbManager();
    orbManager.initialize().catch(err => {
        console.error('[ORB Manager] Initialization failed:', err);
    });
}); 