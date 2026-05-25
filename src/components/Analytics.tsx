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
    console.log("Analytics Init -> GTM ID:", gtmId);
    if (gtmId && gtmId !== 'GTM-XXXXXXX') {
      console.log("Analytics Init -> Initializing GTM...");
      const script = document.createElement('script');
      script.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(script);

      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    // Initialize Google Analytics (GA4)
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    console.log("Analytics Init -> GA ID:", gaId);
    if (gaId && gaId !== 'G-XXXXXXXXXX') {
      console.log("Analytics Init -> Initializing GA4...");
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);
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
