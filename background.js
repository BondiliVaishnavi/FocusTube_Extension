// background.js
console.log('🔧 FocusTube Background Service Worker Started');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('✅ FocusTube ML installed successfully');
  
  // Set default settings
  chrome.storage.sync.get(['focusTubeEnabled'], (result) => {
    if (result.focusTubeEnabled === undefined) {
      chrome.storage.sync.set({ focusTubeEnabled: true });
    }
  });
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.type);
  
  if (request.type === "OPEN_DASHBOARD") {
    chrome.tabs.create({ url: 'dashboard.html' });
    sendResponse({ success: true });
  }
  
  if (request.type === "GET_STATS_FROM_ALL_TABS") {
    // Get stats from all YouTube tabs
    chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
      let totalAllowed = 0;
      let totalBlocked = 0;
      let tabsProcessed = 0;
      
      if (tabs.length === 0) {
        sendResponse({
          allowedCount: 0,
          blockedCount: 0,
          tabCount: 0
        });
        return;
      }
      
      tabs.forEach(tab => {
        try {
          chrome.tabs.sendMessage(tab.id, { type: "GET_STATS" }, (response) => {
            // Check for runtime error
            if (chrome.runtime.lastError) {
              console.log('Tab not ready:', tab.id);
            } else if (response) {
              totalAllowed += response.allowedCount || 0;
              totalBlocked += response.blockedCount || 0;
            }
            
            tabsProcessed++;
            if (tabsProcessed === tabs.length) {
              sendResponse({
                allowedCount: totalAllowed,
                blockedCount: totalBlocked,
                tabCount: tabs.length
              });
            }
          });
        } catch (error) {
          console.log('Error sending message to tab:', tab.id);
          tabsProcessed++;
          if (tabsProcessed === tabs.length) {
            sendResponse({
              allowedCount: totalAllowed,
              blockedCount: totalBlocked,
              tabCount: tabs.length
            });
          }
        }
      });
    });
    return true; // Required for async response
  }
});

console.log('✅ Background service worker ready');