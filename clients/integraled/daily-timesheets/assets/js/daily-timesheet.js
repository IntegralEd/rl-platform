// Add console logging to track function calls and data
console.log('Daily Timesheet script loaded');

const DAY_MAX = 480;
const COLOR_MAP = {
  'KIPP_FY25_TTT_design': '#7e97ac',
  'EL_2025_Curriculum': '#a09382',
  'ST_2025_DCI_0702': '#8c6e63'
};

function refreshTopBar() {
  console.log('Refreshing top bar');
  const topBar = document.getElementById('topBarChart');
  const totalTimeEl = document.getElementById('totalTime');
  const submitBtn = document.getElementById('submitEntriesBtn');
  topBar.innerHTML = '';
  let totalMinutes = 0;
  document.querySelectorAll('.timesheet-row').forEach(row => {
    const cb = row.querySelector('.row-done');
    if (cb.checked) {
      const minutes = Number(row.querySelector('.minutes-input').value) || 0;
      totalMinutes += minutes;
      const pct = (minutes / DAY_MAX) * 100;
      const billingVal = row.querySelector('.billing-code').value;
      const color = COLOR_MAP[billingVal] || '#7e97ac';
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const segLabel = `${h}h ${m}m`;
      const seg = document.createElement('div');
      seg.style.flex = `0 0 ${pct}%`;
      seg.style.background = color;
      seg.style.display = 'flex';
      seg.style.alignItems = 'center';
      seg.style.justifyContent = 'center';
      seg.style.color = '#fff';
      seg.textContent = segLabel;
      topBar.appendChild(seg);
    }
  });
  const hTotal = Math.floor(totalMinutes / 60);
  const mTotal = totalMinutes % 60;
  totalTimeEl.textContent = `${hTotal}h ${mTotal}m`;
  submitBtn.disabled = totalMinutes === 0;
}

function addRow() {
  console.log('Adding a new row');
  const rowContainer = document.getElementById('rowContainer');
  const rowTemplate = document.getElementById('rowTemplate');
  const clone = rowTemplate.content.cloneNode(true);
  const slider = clone.querySelector('.time-slider');
  const minutesInput = clone.querySelector('.minutes-input');
  const display = clone.querySelector('.time-display');
  const notesField = clone.querySelector('.notes');
  const doneCheckbox = clone.querySelector('.row-done');
  const billingSelect = clone.querySelector('.billing-code');
  const swatch = clone.querySelector('.color-swatch');

  doneCheckbox.disabled = true;
  function validateRow() {
    const hasCode = billingSelect.value && billingSelect.value !== 'add-new';
    const minutes = Number(minutesInput.value) || 0;
    const hasNotes = notesField.value.trim() !== '';
    doneCheckbox.disabled = !(hasCode && minutes > 0 && hasNotes);
  }

  function updateDisplay(value) {
    const h = Math.floor(value / 60);
    const m = value % 60;
    display.textContent = `${h}h ${m}m`;
  }

  billingSelect.addEventListener('change', () => {
    const color = COLOR_MAP[billingSelect.value] || '#ccc';
    swatch.style.background = color;
    validateRow();
  });
  notesField.addEventListener('input', validateRow);
  slider.addEventListener('input', () => {
    const val = Number(slider.value);
    minutesInput.value = val;
    updateDisplay(val);
    validateRow();
  });
  minutesInput.addEventListener('input', () => {
    const val = Number(minutesInput.value) || 0;
    slider.value = val;
    updateDisplay(val);
    validateRow();
  });

  doneCheckbox.addEventListener('change', () => refreshTopBar());

  rowContainer.appendChild(clone);
}

function setupEventListeners() {
  console.log('Setting up event listeners');
  const addRowBtn = document.getElementById('addRowBtn');
  const submitBtn = document.getElementById('submitEntriesBtn');
  const submitModal = document.getElementById('submitModal');
  const affirmCheckbox = document.getElementById('affirmCheckbox');
  const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
  const cancelSubmitBtn = document.getElementById('cancelSubmitBtn');

  addRowBtn.addEventListener('click', addRow);
  submitBtn.addEventListener('click', () => submitModal.style.display = 'flex');
  affirmCheckbox.addEventListener('change', () => confirmSubmitBtn.disabled = !affirmCheckbox.checked);
  cancelSubmitBtn.addEventListener('click', () => {
    affirmCheckbox.checked = false;
    confirmSubmitBtn.disabled = true;
    submitModal.style.display = 'none';
  });
  confirmSubmitBtn.addEventListener('click', () => {
    submitModal.style.display = 'none';
    alert('Entries submitted!');
  });
}

// Get user identity from auth session
const session = JSON.parse(localStorage.getItem('auth_session') || '{}');
const userEmail = session.email || '';
const userId = session.userId || '';

function collectTimesheetData() {
  const timesheetData = [];
  document.querySelectorAll('.timesheet-row').forEach(row => {
    const billingCode = row.querySelector('.billing-code').value;
    const notes = row.querySelector('.notes').value;
    const minutes = row.querySelector('.minutes-input').value;
    const done = row.querySelector('.row-done').checked;
      timesheetData.push({ billingCode, notes, minutes, done });
  });
  // Attach user identity to the payload
  return {
    userEmail,
    userId,
    entries: timesheetData
  };
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Document loaded');
  setupEventListeners();
  refreshTopBar();
});

fetch('/api/store-timesheet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(collectTimesheetData())
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch((error) => console.error('Error:', error));
