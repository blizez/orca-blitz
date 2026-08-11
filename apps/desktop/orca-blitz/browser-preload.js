
Object.defineProperty(navigator, 'userAgentData', {
  get: () => ({
    brands: [
      { brand: 'Google Chrome', version: '134' },
      { brand: 'Chromium', version: '134' },
      { brand: 'Not/A)Brand', version: '99' }
    ],
    mobile: false,
    platform: 'Windows'
  })
});


(function() {
  var SELECTORS = [
    /* WhatsApp download banner */
    '[data-testid="whatsapp-download-banner"]',
    '[data-testid="whatsapp-web-login-footer"]',
    /* Generic: any div whose only child is a link to download the app */
    'div:has(> div > a[href*="download"])',
    'div:has(> div > a[href*="get.whatsapp"])',
    'div:has(> span:only-child) > a[href*="get.whatsapp"]',
    /* Footer-like sections */
    'footer',
    'div[class*="footer"]',
  ];

  function hideMatches(root) {
    for (var i = 0; i < SELECTORS.length; i++) {
      try {
        var els = root.querySelectorAll(SELECTORS[i]);
        for (var j = 0; j < els.length; j++) {
          els[j].style.setProperty('display', 'none', 'important');
        }
      } catch(e) { /* :has() not supported in older Chromium */ }
    }
  }

  /* Initial pass */
  hideMatches(document);

  /* Watch for dynamic elements */
  new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        if (nodes[j].nodeType === 1) hideMatches(nodes[j]);
      }
    }
  }).observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
