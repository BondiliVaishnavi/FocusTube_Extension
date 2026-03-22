// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById('toggle');
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  const updateTime = document.getElementById('updateTime');

  // Load saved state
  chrome.storage.sync.get(['focusTubeEnabled'], (result) => {
    const enabled = result.focusTubeEnabled !== false;
    toggle.checked = enabled;
    updateUI(enabled);
  });

  // Update time
  function updateTimeDisplay() {
    const now = new Date();
    updateTime.textContent = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 60000);

  // Toggle change
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ focusTubeEnabled: enabled });
    updateUI(enabled);

    chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
      tabs.forEach(tab => {
        try {
          chrome.tabs.sendMessage(tab.id, {
            type: "FOCUSTUBE_STATE_UPDATE",
            enabled: enabled
          }).catch(() => {});
        } catch (error) {}
      });
    });
  });

  // Open dashboard
  document.getElementById('openDashboard')?.addEventListener('click', (e) => {
    e.preventDefault();
    try {
      chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD" }, (response) => {
        if (chrome.runtime.lastError) {
          chrome.tabs.create({ url: 'dashboard.html' });
        }
      });
    } catch (error) {
      chrome.tabs.create({ url: 'dashboard.html' });
    }
  });

  function updateUI(enabled) {
    if (enabled) {
      statusText.textContent = "Filter Active";
      statusDot.className = "dot active";
    } else {
      statusText.textContent = "Filter Disabled";
      statusDot.className = "dot inactive";
    }
  }
});