document.addEventListener('DOMContentLoaded', () => {
  // State management
  const state = {
    entries: {
      ELPL: {
        name: 'ELPL',
        totalTime: '2h 26m',
        projects: {
          'Recursive Learning': {
            name: 'Recursive Learning',
            totalTime: '2h 26m',
            billingCodes: {
              'DEV-001': {
                code: 'DEV-001',
                description: 'Frontend Development',
                time: '2h 26m',
                tasks: []
              }
            }
          }
        }
      },
      ST: {
        name: 'ST',
        totalTime: '1h 10m',
        projects: {
          'Policy 101': {
            name: 'Policy 101',
            totalTime: '1h 10m',
            billingCodes: {
              'GD-001': {
                code: 'GD-001',
                description: 'Graphic Design',
                time: '1h 10m',
                tasks: []
              }
            }
          }
        }
      },
      KIPP: {
        name: 'KIPP',
        totalTime: '0h 43m',
        projects: {
          'NCI_2025': {
            name: 'NCI_2025',
            totalTime: '0h 43m',
            billingCodes: {
              'PM-001': {
                code: 'PM-001',
                description: 'Project Management',
                time: '0h 43m',
                tasks: []
              }
            }
          }
        }
      }
    },
    currentView: 'client', // client, project, or billing
    selectedClient: null,
    selectedProject: null,
    selectedBillingCode: null
  };

  // DOM Elements
  const summaryChart = document.getElementById('summaryChart');
  const timesheet = document.querySelector('.timesheet-tree');
  const modal = document.getElementById('entryModal');
  const affirm = document.getElementById('affirm');
  const submitBtn = document.getElementById('submitBtn');

  // Event Listeners
  affirm.addEventListener('change', (e) => {
    submitBtn.disabled = !e.target.checked;
  });

  // Tree Navigation
  document.querySelectorAll('.tree-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const item = header.closest('.tree-item');
      const level = item.parentElement.dataset.level;
      const nextLevel = item.querySelector(`.tree-level[data-level="${getNextLevel(level)}"]`);
      
      if (nextLevel) {
        nextLevel.style.display = nextLevel.style.display === 'none' ? 'block' : 'none';
        updateChart(level, item.dataset[level]);
      }
    });
  });

  // Add Entry Buttons
  document.querySelectorAll('.add-entry').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = button.closest('.tree-item');
      const level = item.parentElement.dataset.level;
      openAddEntryModal(level, item);
    });
  });

  // Edit Entry Buttons
  document.querySelectorAll('.edit-entry').forEach(button => {
    button.addEventListener('click', (e) => {
      const item = button.closest('.tree-item');
      const billingCode = item.dataset.billing;
      const projectItem = item.closest('[data-project]');
      const clientItem = projectItem.closest('[data-client]');
      
      openEditModal({
        client: clientItem.dataset.client,
        project: projectItem.dataset.project,
        billingCode: billingCode
      });
    });
  });

  // Modal Controls
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.querySelector('.cancel-entry').addEventListener('click', closeModal);
  document.querySelector('.save-entry').addEventListener('click', saveEntry);

  // Chart Interaction
  summaryChart.querySelectorAll('.bar-segment').forEach(segment => {
    segment.addEventListener('click', (e) => {
      const client = segment.dataset.client;
      updateChart('client', client);
    });
  });

  // Utility Functions
  function getNextLevel(currentLevel) {
    const levels = ['client', 'project', 'billing'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[currentIndex + 1];
  }

  function updateChart(level, id) {
    let data;
    
    switch(level) {
      case 'client':
        data = state.entries[id].projects;
        break;
      case 'project':
        const client = state.selectedClient;
        data = state.entries[client].projects[id].billingCodes;
        break;
      default:
        return;
    }

    // Update chart segments
    summaryChart.innerHTML = '';
    Object.entries(data).forEach(([key, value]) => {
      const segment = document.createElement('div');
      segment.className = 'bar-segment';
      segment.style.width = calculateWidth(value.totalTime);
      segment.style.backgroundColor = getColor(key);
      
      const tooltip = document.createElement('div');
      tooltip.className = 'bar-tooltip';
      tooltip.textContent = `${key}: ${value.totalTime}`;
      
      segment.appendChild(tooltip);
      summaryChart.appendChild(segment);
    });

    state.currentView = level;
    state.selectedClient = level === 'client' ? id : state.selectedClient;
  }

  function calculateWidth(time) {
    // Convert time string to minutes
    const [hours, minutes] = time.split('h ');
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    return `${(totalMinutes / 480) * 100}%`; // 480 minutes = 8 hours
  }

  function getColor(key) {
    const colors = {
      ELPL: '#457b9d',
      ST: '#2a9d8f',
      KIPP: '#f4a261'
    };
    return colors[key] || '#6c757d';
  }

  function openAddEntryModal(level, item) {
    modal.classList.add('active');
    // Implement add entry logic
  }

  function openEditModal(entry) {
    const entryData = state.entries[entry.client]
      .projects[entry.project]
      .billingCodes[entry.billingCode];

    document.querySelector('.modal-time-input').value = entryData.time;
    document.querySelector('.modal-description').value = entryData.description;
    
    // Setup tasks container
    const tasksContainer = document.getElementById('tasksDragContainer');
    tasksContainer.innerHTML = '';
    entryData.tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      tasksContainer.appendChild(taskElement);
    });

    modal.classList.add('active');
  }

  function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.textContent = task;
    div.draggable = true;
    return div;
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  function saveEntry() {
    // Implement save entry logic
    closeModal();
  }

  // Initialize
  updateChart('client', null);
}); 