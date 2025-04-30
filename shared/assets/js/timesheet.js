document.addEventListener('DOMContentLoaded', function() {
  const affirmCheckbox = document.getElementById('affirm');
  const submitBtn = document.getElementById('submitBtn');

  if (affirmCheckbox && submitBtn) {
    affirmCheckbox.addEventListener('change', function(e) {
      submitBtn.disabled = !e.target.checked;
    });

    submitBtn.addEventListener('click', async function() {
      try {
        const response = await fetch('/api/v1/timesheet/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY
          },
          body: JSON.stringify({
            day_total: "4h36m",
            allocations: [
              {
                client: "ELPL",
                total: "2h26m",
                entries: [{
                  project: "Recursive Learning",
                  billing_code: "DEV-001",
                  hours: "2h26m",
                  notes: "Frontend development"
                }]
              },
              {
                client: "ST",
                total: "1h10m",
                entries: [{
                  project: "Policy 101",
                  billing_code: "GD-001",
                  hours: "1h10m",
                  notes: "Graphic Design"
                }]
              },
              {
                client: "KIPP",
                total: "0h43m",
                entries: [{
                  project: "NCI_2025",
                  billing_code: "PM-001",
                  hours: "0h43m",
                  notes: "Project Management"
                }]
              }
            ]
          })
        });
        
        if (response.ok) {
          alert('Time entries submitted successfully!');
        } else {
          throw new Error('Failed to submit time entries');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to submit time entries. Please try again.');
      }
    });
  }
}); 