import React from 'react';
import { Seo } from '../components/Seo';

export const Compliance = () => {
  return (
    <>
      <Seo title="Compliance | AGDentool" description="Compliance information and regulatory standards." />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Compliance & Certifications</h1>
        <div className="prose prose-lg text-slate-600 max-w-none">
          <p>At AGDentool, we are committed to maintaining the highest standards of safety, quality, and regulatory compliance.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Regulatory Standards</h2>
          <p>Our products are sourced from manufacturers that comply with international medical device regulations, including FDA, CE, and ISO 13485 standards.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Quality Assurance</h2>
          <p>We implement rigorous quality control processes to ensure that all instruments and supplies meet the strict requirements of dental professionals worldwide.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Environmental Responsibility</h2>
          <p>We are dedicated to sustainable practices in our operations and supply chain management, working closely with partners who share our commitment to environmental responsibility.</p>
        </div>
      </div>
    </>
  );
};
