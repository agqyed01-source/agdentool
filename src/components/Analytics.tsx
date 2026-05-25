import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // Initialize Google Tag Manager (GTM)
    const gtmId = import.meta.env.VITE_GTM_ID;
    console.log('[Analytics] Initialization check - GTM ID:', gtmId);
    
    if (gtmId && gtmId !== 'GTM-XXXXXXX' && gtmId !== 'undefined') {
      (function(w: any, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0] as HTMLElement,
            j = d.createElement(s) as HTMLScriptElement,
            dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        if (f && f.parentNode) {
            f.parentNode.insertBefore(j, f);
        } else {
            document.head.appendChild(j);
        }
      })(window, document, 'script', 'dataLayer', gtmId);

      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
      console.log('[Analytics] GTM Initialized successfully with ID:', gtmId);
    } else {
      console.warn('[Analytics] GTM missing or invalid. Check your .env setup or GitHub Secrets.');
    }

    // Initialize Google Analytics (GA4)
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    console.log('[Analytics] Initialization check - GA ID:', gaId);
    
    if (gaId && gaId !== 'G-XXXXXXXXXX' && gaId !== 'undefined') {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(){window.dataLayer.push(arguments);}
      window.gtag('js', new Date());
      window.gtag('config', gaId);
      console.log('[Analytics] GA4 Initialized successfully with ID:', gaId);
    } else {
      console.warn('[Analytics] GA missing or invalid. Check your .env setup or GitHub Secrets.');
    }
  }, []);

  // Track page views on route change (for Single Page Application)
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && gaId !== 'G-XXXXXXXXXX' && window.gtag) {
      window.gtag('config', gaId, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}
