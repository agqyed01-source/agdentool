import React from 'react';
import { Seo } from '../components/Seo';

export const PrivacyPolicy = () => {
  return (
    <>
      <Seo title="Privacy Policy | AGDentool" description="Privacy Policy and data protection at AGDentool." />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-slate-600 max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from AGDentool.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Personal Information We Collect</h2>
          <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">How Do We Use Your Personal Information?</h2>
          <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Sharing Your Personal Information</h2>
          <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. We may also share your Personal Information to comply with applicable laws and regulations.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Your Rights</h2>
          <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us.</p>
        </div>
      </div>
    </>
  );
};
