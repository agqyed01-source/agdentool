import React from 'react';
import { Seo } from '../components/Seo';

export const TermsOfService = () => {
  return (
    <>
      <Seo title="Terms of Service | AGDentool" description="Terms of service and user agreement." />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        <div className="prose prose-lg text-slate-600 max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>Please read these Terms of Service carefully before using the AGDentool website and services.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using our website, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Products and Services</h2>
          <p>We reserve the right to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at our sole discretion.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Accuracy of Billing and Account Information</h2>
          <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. You agree to provide current, complete and accurate purchase and account information for all purchases made at our store.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Governing Law</h2>
          <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of our operating jurisdiction.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Contact Information</h2>
          <p>Questions about the Terms of Service should be sent to us via our contact page.</p>
        </div>
      </div>
    </>
  );
};
