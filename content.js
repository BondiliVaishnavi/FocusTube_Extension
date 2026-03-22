// // content.js
// console.log('🎯 FocusTube Educational Filter Starting...');

// let enabled = true;
// const PROCESSED_CLASS = 'focustube-processed';
// let allowedCount = 0, blockedCount = 0;

// // ---------- Extract title from video element ----------
// function getTitle(video) {
//   const selectors = [
//     '#video-title',
//     'a#video-title',
//     'yt-formatted-string.ytd-video-renderer',
//     'yt-formatted-string.ytd-rich-grid-media',
//     '#video-title-link',
//     'h3 a'
//   ];
  
//   for (const sel of selectors) {
//     const el = video.querySelector(sel);
//     if (el && el.innerText) {
//       const title = el.innerText.trim();
//       if (title) return title;
//     }
//   }
  
//   const anyLink = video.querySelector('a[title]');
//   if (anyLink) return anyLink.getAttribute('title').trim();
  
//   return null;
// }

// // ---------- Process a single video ----------
// async function processVideo(video) {
//   if (video.classList.contains(PROCESSED_CLASS)) return;

//   const title = getTitle(video);
//   if (!title) {
//     video.classList.add(PROCESSED_CLASS);
//     return;
//   }

//   video.classList.add(PROCESSED_CLASS);

//   if (!enabled) {
//     video.style.setProperty('display', '', 'important');
//     return;
//   }

//   // HIDE by default
//   video.style.setProperty('display', 'none', 'important');

//   // Use ML + Keyword hybrid analysis
//   let decision;
//   if (window.FocusTubeML) {
//     const result = await window.FocusTubeML.analyze(title);
//     decision = result.decision;
    
//     console.log(`${result.method === 'ml' ? '🤖' : '📊'} ${result.decision.toUpperCase()} (${(result.probability * 100).toFixed(1)}%): ${title.substring(0, 40)}...`);
//   } else {
//     // Fallback to pure keyword if ML not loaded
//     const score = scoreTitle(title);
//     decision = score >= 2.5 ? 'allow' : 'block';
//     console.log(`📊 ${decision.toUpperCase()} (score ${score.toFixed(2)}): ${title.substring(0, 40)}...`);
//   }

//   if (decision === 'allow') {
//     allowedCount++;
//     video.style.setProperty('display', '', 'important'); // show
//   } else {
//     blockedCount++;
//   }
  

// // Save counts to storage for dashboard
// chrome.storage.local.set({ 
//   allowedCount, 
//   blockedCount 
// });
// }

// // ---------- Compute weighted score (fallback) ----------
// function scoreTitle(title) {
//   if (!window.WORD_WEIGHTS) return 0;
  
//   const cleaned = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
//   let score = 0;
//   for (const [word, weight] of Object.entries(window.WORD_WEIGHTS)) {
//     if (cleaned.includes(word)) {
//       score += weight;
//     }
//   }
//   return score;
// }

// // ---------- Scan all video containers ----------
// async function scanVideos() {
//   const selectors = [
//     'ytd-rich-item-renderer',
//     'ytd-video-renderer',
//     'ytd-compact-video-renderer',
//     'ytd-grid-video-renderer',
//     'ytd-rich-grid-media',
//     '#dismissible'
//   ];
  
//   const videos = document.querySelectorAll(selectors.join(','));
  
//   // Process in batches to avoid overwhelming
//   const batchSize = 10;
//   for (let i = 0; i < videos.length; i += batchSize) {
//     const batch = Array.from(videos).slice(i, i + batchSize);
//     await Promise.all(batch.map(v => processVideo(v)));
    
//     // Small delay between batches
//     if (i + batchSize < videos.length) {
//       await new Promise(r => setTimeout(r, 100));
//     }
//   }
// }

// // ---------- Observe DOM for new videos ----------
// const observer = new MutationObserver(() => scanVideos());

// function startObserver() {
//   if (document.body) {
//     observer.observe(document.body, { childList: true, subtree: true });
//     scanVideos();
//     console.log('👀 Observer started');
    
//     // Log ML status
//     if (window.FocusTubeML) {
//       console.log(`🤖 ML Status: ${window.FocusTubeML.isReady ? 'Ready' : 'Loading...'}`);
//     }
//   } else {
//     setTimeout(startObserver, 300);
//   }
// }

// // ---------- Listen for toggle changes ----------
// chrome.storage.onChanged.addListener((changes, area) => {
//   if (area === 'sync' && changes.focusTubeEnabled) {
//     enabled = changes.focusTubeEnabled.newValue;
//     console.log('🔄 Toggle:', enabled ? 'ON' : 'OFF');
//     document.querySelectorAll(`.${PROCESSED_CLASS}`).forEach(v => v.classList.remove(PROCESSED_CLASS));
//     scanVideos();
//   }
// });

// // ---------- Initialisation ----------
// chrome.storage.sync.get(['focusTubeEnabled'], (result) => {
//   enabled = result.focusTubeEnabled !== false;
//   console.log('🔄 Initial state:', enabled ? 'ON' : 'OFF');
  
//   // Wait for ML to initialize
//   setTimeout(startObserver, 1500);
// });
// // ---------- Add this at the bottom of your content.js ----------
// // Handle messages from popup
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === "GET_STATS") {
//     sendResponse({
//       allowedCount: allowedCount,
//       blockedCount: blockedCount
//     });
//   }
// });

// // Save counts to storage periodically
// setInterval(() => {
//   chrome.storage.local.set({ allowedCount, blockedCount });
// }, 5000);
// // Add at the bottom of your content.js (optional)

// // Add this to your content.js to handle toggle from background
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === "TOGGLE_FILTER") {
//     enabled = !enabled;
//     chrome.storage.sync.set({ focusTubeEnabled: enabled });
//     console.log('🔄 Toggled from background:', enabled ? 'ON' : 'OFF');
//     document.querySelectorAll(`.${PROCESSED_CLASS}`).forEach(v => v.classList.remove(PROCESSED_CLASS));
//     scanVideos();
//     sendResponse({ enabled });
//   }
  
//   if (request.type === "GET_STATS") {
//     sendResponse({
//       allowedCount: allowedCount,
//       blockedCount: blockedCount
//     });
//   }
// });
console.log('🎯 FocusTube Educational Filter Starting...');

let enabled = true;
const PROCESSED_CLASS = 'focustube-processed';
let allowedCount = 0, blockedCount = 0;
let isExtensionAlive = true;

// ---------- CHECK EXTENSION ----------
function isAlive() {
  try {
    return !!(chrome && chrome.runtime && chrome.runtime.id);
  } catch {
    return false;
  }
}

// ---------- SAFE CALL ----------
function safeChromeCall(fn) {
  if (!isAlive()) {
    isExtensionAlive = false;
    return;
  }

  try {
    fn();
  } catch (e) {
    console.warn('⚠️ Extension context invalidated');
    isExtensionAlive = false;
  }
}

// ---------- Extract title ----------
function getTitle(video) {
  const selectors = [
    '#video-title',
    'a#video-title',
    'yt-formatted-string.ytd-video-renderer',
    'yt-formatted-string.ytd-rich-grid-media',
    '#video-title-link',
    'h3 a'
  ];

  for (const sel of selectors) {
    const el = video.querySelector(sel);
    if (el && el.innerText) {
      const title = el.innerText.trim();
      if (title) return title;
    }
  }

  const anyLink = video.querySelector('a[title]');
  if (anyLink) return anyLink.getAttribute('title').trim();

  return null;
}

// ---------- Process video ----------
async function processVideo(video) {
  if (video.classList.contains(PROCESSED_CLASS)) return;

  const title = getTitle(video);
  if (!title) {
    video.classList.add(PROCESSED_CLASS);
    return;
  }

  video.classList.add(PROCESSED_CLASS);

  if (!enabled) {
    video.style.display = '';
    return;
  }

  video.style.display = 'none';

  let decision;

  if (window.FocusTubeML) {
    try {
      const result = await window.FocusTubeML.analyze(title);
      decision = result.decision;
    } catch {
      decision = 'block';
    }
  } else {
    const score = scoreTitle(title);
    decision = score >= 2.5 ? 'allow' : 'block';
  }

  if (decision === 'allow') {
    allowedCount++;
    video.style.display = '';
  } else {
    blockedCount++;
  }
   const todayKey = `stats_${new Date().getFullYear()}_${new Date().getMonth()}_${new Date().getDate()}`;

chrome.storage.local.get([todayKey], (res) => {
  const stats = res[todayKey] || { allowed: 0, blocked: 0 };

  if (decision === 'allow') stats.allowed++;
  else stats.blocked++;

  chrome.storage.local.set({ [todayKey]: stats });
});
  safeChromeCall(() => {
    chrome.storage.local.set({ allowedCount, blockedCount });
  });

}

// ---------- Score ----------
function scoreTitle(title) {
  if (!window.WORD_WEIGHTS) return 0;

  const cleaned = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let score = 0;

  for (const [word, weight] of Object.entries(window.WORD_WEIGHTS)) {
    if (cleaned.includes(word)) {
      score += weight;
    }
  }

  return score;
}

// ---------- Scan ----------
let scanning = false;

async function scanVideos() {
  if (scanning) return;
  scanning = true;

  const selectors = [
    'ytd-rich-item-renderer',
    'ytd-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-rich-grid-media'
  ];

  const videos = document.querySelectorAll(selectors.join(','));

  for (const video of videos) {
    await processVideo(video);
  }

  scanning = false;
}

// ---------- Observer ----------
const observer = new MutationObserver(() => {
  scanVideos();
});

function startObserver() {
  if (!isAlive()) return;

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    scanVideos();
    console.log('👀 Observer started');
  } else {
    setTimeout(startObserver, 300);
  }
}

// ---------- Storage listener ----------
safeChromeCall(() => {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (!isExtensionAlive) return;

    if (area === 'sync' && changes.focusTubeEnabled) {
      enabled = changes.focusTubeEnabled.newValue;

      document.querySelectorAll(`.${PROCESSED_CLASS}`)
        .forEach(v => v.classList.remove(PROCESSED_CLASS));

      scanVideos();
    }
  });
});

// ---------- Init ----------
safeChromeCall(() => {
  chrome.storage.sync.get(['focusTubeEnabled'], (result) => {
    if (!isExtensionAlive) return;

    enabled = result.focusTubeEnabled !== false;
    setTimeout(startObserver, 1000);
  });
});

// ---------- Message listener ----------
safeChromeCall(() => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!isExtensionAlive) return;

    if (request.type === "GET_STATS") {
      sendResponse({ allowedCount, blockedCount });
    }

    if (request.type === "TOGGLE_FILTER") {
      enabled = !enabled;

      safeChromeCall(() => {
        chrome.storage.sync.set({ focusTubeEnabled: enabled });
      });

      document.querySelectorAll(`.${PROCESSED_CLASS}`)
        .forEach(v => v.classList.remove(PROCESSED_CLASS));

      scanVideos();
      sendResponse({ enabled });
    }
  });
});

// ---------- Periodic save (SAFE) ----------
const intervalId = setInterval(() => {
  if (!isAlive()) {
    console.warn("❌ Extension disconnected. Stopping interval.");
    clearInterval(intervalId);
    return;
  }

  safeChromeCall(() => {
    chrome.storage.local.set({ allowedCount, blockedCount });
  });
}, 5000);