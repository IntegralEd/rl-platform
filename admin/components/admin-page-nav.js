const template = document.createElement('template');
template.innerHTML = `
  <style>
    .admin-page-nav {
      padding: 20px;
      height: 100%;
      background: var(--client-bg, #ffffff);
      border-right: 1px solid var(--client-border, #e1e4e8);
    }

    .page-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .page-card.active {
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }

    .page-header {
      padding: 16px;
      background: var(--admin-bg, #f8f9fa);
      border-bottom: 1px solid var(--admin-border, #e1e4e8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .page-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--admin-text, #2c3e50);
    }

    .page-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .gem-dot {
      width: var(--gem-size, 8px);
      height: var(--gem-size, 8px);
      border-radius: 50%;
      position: relative;
    }

    .gem-dot::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: calc(var(--gem-size, 8px) + var(--gem-glow, 4px));
      height: calc(var(--gem-size, 8px) + var(--gem-glow, 4px));
      border-radius: 50%;
      opacity: 0.4;
      transition: all 0.2s ease;
    }

    .gem-ready {
      background-color: var(--gem-ready, #22c55e);
    }
    .gem-ready::after {
      background-color: var(--gem-ready, #22c55e);
    }

    .gem-progress {
      background-color: var(--gem-progress, #eab308);
    }
    .gem-progress::after {
      background-color: var(--gem-progress, #eab308);
    }

    .gem-attention {
      background-color: var(--gem-attention, #ef4444);
    }
    .gem-attention::after {
      background-color: var(--gem-attention, #ef4444);
    }

    .ingredient-list {
      padding: 0;
      margin: 0;
      list-style: none;
      display: none;
    }

    .page-card.active .ingredient-list {
      display: block;
    }

    .ingredient-item {
      padding: 12px 16px;
      border-bottom: 1px solid var(--admin-border, #e1e4e8);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ingredient-item:last-child {
      border-bottom: none;
    }

    .ingredient-item:hover {
      background-color: var(--admin-bg, #f8f9fa);
    }

    .ingredient-item.active {
      background-color: var(--admin-bg, #f8f9fa);
      font-weight: 500;
      color: var(--brand-color, #004080);
    }

    .ingredient-icon {
      width: 20px;
      height: 20px;
      opacity: 0.7;
    }

    .ingredient-item.active .ingredient-icon {
      opacity: 1;
    }

    .version-tag {
      font-size: 12px;
      padding: 2px 6px;
      background: rgba(0,0,0,0.05);
      border-radius: 4px;
      margin-left: auto;
    }
  </style>

  <div class="admin-page-nav">
    <!-- Merit (Active) -->
    <div class="page-card active" data-page="merit">
      <div class="page-header">
        <h2>Merit</h2>
        <div class="page-status">
          <div class="gem-dot gem-ready" title="Ready"></div>
        </div>
      </div>
      <ul class="ingredient-list">
        <li class="ingredient-item active" data-ingredient="dashboard">
          <img src="/shared/platform/images/platform-dashboard-icon.svg" alt="" class="ingredient-icon">
          Dashboard
          <span class="version-tag">v1.0.17</span>
        </li>
        <li class="ingredient-item" data-ingredient="content">
          <img src="/shared/platform/images/platform-content-icon.svg" alt="" class="ingredient-icon">
          Content
        </li>
        <li class="ingredient-item" data-ingredient="settings">
          <img src="/shared/platform/images/platform-settings-icon.svg" alt="" class="ingredient-icon">
          Settings
        </li>
        <li class="ingredient-item" data-ingredient="analytics">
          <img src="/shared/platform/images/platform-analytics-icon.svg" alt="" class="ingredient-icon">
          Analytics
        </li>
      </ul>
    </div>

    <!-- Goalsetter (Inactive) -->
    <div class="page-card" data-page="goalsetter">
      <div class="page-header">
        <h2>Goalsetter</h2>
        <div class="page-status">
          <div class="gem-dot gem-progress" title="In Progress"></div>
        </div>
      </div>
      <ul class="ingredient-list">
        <li class="ingredient-item" data-ingredient="dashboard">
          <img src="/shared/platform/images/platform-dashboard-icon.svg" alt="" class="ingredient-icon">
          Dashboard
        </li>
        <li class="ingredient-item" data-ingredient="content">
          <img src="/shared/platform/images/platform-content-icon.svg" alt="" class="ingredient-icon">
          Content
        </li>
        <li class="ingredient-item" data-ingredient="settings">
          <img src="/shared/platform/images/platform-settings-icon.svg" alt="" class="ingredient-icon">
          Settings
        </li>
        <li class="ingredient-item" data-ingredient="analytics">
          <img src="/shared/platform/images/platform-analytics-icon.svg" alt="" class="ingredient-icon">
          Analytics
        </li>
      </ul>
    </div>

    <!-- BHB (Inactive) -->
    <div class="page-card" data-page="bhb">
      <div class="page-header">
        <h2>BHB</h2>
        <div class="page-status">
          <div class="gem-dot gem-attention" title="Needs Attention"></div>
        </div>
      </div>
      <ul class="ingredient-list">
        <li class="ingredient-item" data-ingredient="dashboard">
          <img src="/shared/platform/images/platform-dashboard-icon.svg" alt="" class="ingredient-icon">
          Dashboard
        </li>
        <li class="ingredient-item" data-ingredient="content">
          <img src="/shared/platform/images/platform-content-icon.svg" alt="" class="ingredient-icon">
          Content
        </li>
        <li class="ingredient-item" data-ingredient="settings">
          <img src="/shared/platform/images/platform-settings-icon.svg" alt="" class="ingredient-icon">
          Settings
        </li>
        <li class="ingredient-item" data-ingredient="analytics">
          <img src="/shared/platform/images/platform-analytics-icon.svg" alt="" class="ingredient-icon">
          Analytics
        </li>
      </ul>
    </div>
  </div>
`;

/**
 * AdminPageNav Component
 * Handles navigation between admin pages and their ingredients
 * Used in the admin panel to manage different project pages
 * 
 * @version 1.0.17
 * @implements {HTMLElement}
 */
export class AdminPageNav extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.setupEventListeners();
    this.initializeState();
  }

  initializeState() {
    // Set initial active states
    const activePage = this.shadowRoot.querySelector('.page-card.active');
    if (activePage) {
      const activeIngredient = activePage.querySelector('.ingredient-item.active');
      if (activeIngredient) {
        this.dispatchEvent(new CustomEvent('ingredient-selected', {
          detail: {
            page: activePage.dataset.page,
            ingredient: activeIngredient.dataset.ingredient
          },
          bubbles: true,
          composed: true
        }));
      }
    }
  }

  setupEventListeners() {
    // Handle ingredient selection
    this.shadowRoot.querySelectorAll('.ingredient-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Remove active class from all items
        this.shadowRoot.querySelectorAll('.ingredient-item').forEach(i => 
          i.classList.remove('active')
        );
        
        // Add active class to clicked item
        e.target.closest('.ingredient-item').classList.add('active');
        
        // Get page and ingredient info
        const pageCard = e.target.closest('.page-card');
        const page = pageCard.dataset.page;
        const ingredient = e.target.closest('.ingredient-item').dataset.ingredient;
        
        // Update active states
        this.shadowRoot.querySelectorAll('.page-card').forEach(card => 
          card.classList.toggle('active', card === pageCard)
        );
        
        // Dispatch event
        this.dispatchEvent(new CustomEvent('ingredient-selected', {
          detail: { page, ingredient },
          bubbles: true,
          composed: true
        }));

        // Log state change
        console.log(`[Admin Navigation] Selected ${page}/${ingredient}`);
      });
    });

    // Handle page card expansion
    this.shadowRoot.querySelectorAll('.page-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const card = e.target.closest('.page-card');
        
        // Toggle active state
        this.shadowRoot.querySelectorAll('.page-card').forEach(c => {
          c.classList.toggle('active', c === card);
        });

        // Log state change
        console.log(`[Admin Navigation] Toggled ${card.dataset.page} card`);
      });
    });
  }
}

customElements.define('admin-page-nav', AdminPageNav); 