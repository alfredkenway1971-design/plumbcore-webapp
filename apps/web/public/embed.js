/**
 * PlumbCore AI — Embed Script
 * 
 * Add this script to any website to embed a PlumbCore AI quote widget:
 * 
 * <script src="https://plumbcore-ai.vercel.app/embed.js"
 *   data-plumber-id="torres_123"
 *   data-theme="light"
 *   data-primary-color="#3B82F6">
 * </script>
 */
(function () {
  var script = document.currentScript;
  if (!script) return;

  var plumberId = script.getAttribute('data-plumber-id');
  var theme = script.getAttribute('data-theme') || 'light';
  var primaryColor = script.getAttribute('data-primary-color') || '#3B82F6';

  if (!plumberId) {
    console.warn('[PlumbCore AI] Missing data-plumber-id attribute');
    return;
  }

  // Create container
  var container = document.createElement('div');
  container.id = 'plumbcore-quote-widget';
  container.style.cssText = 'width:100%;min-height:600px;max-width:480px;margin:0 auto;';

  // Insert after script
  script.parentNode.insertBefore(container, script.nextSibling);

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = 'https://plumbcore-ai.vercel.app/quote/' + plumberId + '?embed=1&theme=' + theme + '&color=' + encodeURIComponent(primaryColor);
  iframe.style.cssText = 'width:100%;height:100%;min-height:600px;border:none;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);';
  iframe.setAttribute('title', 'PlumbCore AI Quote');
  iframe.setAttribute('loading', 'lazy');

  container.appendChild(iframe);

  // Powered by footer
  var footer = document.createElement('div');
  footer.style.cssText = 'text-align:center;padding:8px 0;font-size:11px;color:#94a3b8;font-family:system-ui,sans-serif;';
  footer.innerHTML = 'Powered by <a href="https://plumbcore-ai.vercel.app" target="_blank" style="color:' + primaryColor + ';text-decoration:none;font-weight:600;">PlumbCore AI</a>';
  container.appendChild(footer);
})();
