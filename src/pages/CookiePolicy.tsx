import React from 'react';
import { Seo } from '../components/Seo';

export const CookiePolicy = () => {
  return (
    <>
      <Seo title="Cookie Policy | AGDentool" description="Information regarding the use of cookies on our website." />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Cookie Policy</h1>
        <div className="prose prose-lg text-slate-600 max-w-none">
          <p>This Cookie policy explains how we use cookies and similar technologies to recognize you when you visit our website.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">What are cookies?</h2>
          <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Why do we use cookies?</h2>
          <p>We use first and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our online properties.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">How can I control cookies?</h2>
          <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. You can also set or amend your web browser controls to accept or refuse cookies.</p>
        </div>
      </div>
    </>
  );
};
