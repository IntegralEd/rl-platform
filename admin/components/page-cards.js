const template = document.createElement('template');
template.innerHTML = `
  <style>
    .page-cards {
      padding: 20px;
    }

    .page-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      overflow: hidden;
    }

    .page-card-header {
      padding: 16px;
      background: var(--admin-bg, #f8f9fa);
      border-bottom: 1px solid var(--admin-border, #e1e4e8);
      cursor: pointer;
    }

    .page-card-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--admin-text, #2c3e50);
    }

    .page-ingredients {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .ingredient-item {
      padding: 12px 16px;
      border-bottom: 1px solid var(--admin-border, #e1e4e8);
      cursor: pointer;
      transition: background-color 0.2s;
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
    }
  </style>

  <div class="page-cards">
    <!-- Goalsetter -->
    <div class="page-card">
      <div class="page-card-header">
        <h2>Goalsetter</h2>
      </div>
      <ul class="page-ingredients">
        <li class="ingredient-item" data-ingredient="toggle">Toggle</li>
        <li class="ingredient-item" data-ingredient="iframe">Iframe</li>
        <li class="ingredient-item" data-ingredient="comments">Comments</li>
        <li class="ingredient-item" data-ingredient="change-order">Change Orders</li>
        <li class="ingredient-item" data-ingredient="lrs">LRS</li>
        <li class="ingredient-item" data-ingredient="status">Status</li>
      </ul>
    </div>

    <!-- Merit -->
    <div class="page-card">
      <div class="page-card-header">
        <h2>Merit</h2>
      </div>
      <ul class="page-ingredients">
        <li class="ingredient-item" data-ingredient="toggle">Toggle</li>
        <li class="ingredient-item" data-ingredient="iframe">Iframe</li>
        <li class="ingredient-item" data-ingredient="comments">Comments</li>
        <li class="ingredient-item" data-ingredient="change-order">Change Orders</li>
        <li class="ingredient-item" data-ingredient="lrs">LRS</li>
        <li class="ingredient-item" data-ingredient="status">Status</li>
      </ul>
    </div>

    <!-- BHB -->
    <div class="page-card">
      <div class="page-card-header">
        <h2>BHB</h2>
      </div>
      <ul class="page-ingredients">
        <li class="ingredient-item" data-ingredient="toggle">Toggle</li>
        <li class="ingredient-item" data-ingredient="iframe">Iframe</li>
        <li class="ingredient-item" data-ingredient="comments">Comments</li>
        <li class="ingredient-item" data-ingredient="change-order">Change Orders</li>
        <li class="ingredient-item" data-ingredient="lrs">LRS</li>
        <li class="ingredient-item" data-ingredient="status">Status</li>
      </ul>
    </div>
  </div>
`;

export class PageCardsComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.setupEventListeners();
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
        e.target.classList.add('active');
        
        // Dispatch event with selected page and ingredient
        const page = e.target.closest('.page-card')
                            .querySelector('.page-card-header h2')
                            .textContent.toLowerCase();
        const ingredient = e.target.dataset.ingredient;
        
        this.dispatchEvent(new CustomEvent('ingredient-selected', {
          detail: { page, ingredient },
          bubbles: true,
          composed: true
        }));
      });
    });

    // Handle page card expansion
    this.shadowRoot.querySelectorAll('.page-card-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const card = e.target.closest('.page-card');
        const ingredients = card.querySelector('.page-ingredients');
        
        // Toggle visibility of ingredients
        if (ingredients.style.display === 'none') {
          ingredients.style.display = 'block';
        } else {
          ingredients.style.display = 'none';
        }

      });
    });
  }
}

customElements.define('page-cards', PageCardsComponent); 