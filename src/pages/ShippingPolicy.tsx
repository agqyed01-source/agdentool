import React from 'react';
import { Seo } from '../components/Seo';

export const ShippingPolicy = () => {
  return (
    <>
      <Seo title="Shipping Policy | AGDentool" description="Shipping information and policies." />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Shipping Policy</h1>
        <div className="prose prose-lg text-slate-600 max-w-none">
          <p>At AGDentool, we strive to deliver your orders quickly and securely.</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Processing Time</h2>
          <p>All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Domestic Shipping Rates and Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">International Shipping</h2>
          <p>We offer international shipping worldwide. Shipping charges and delivery times vary by destination. Your order may be subject to import duties and taxes, which are incurred once a shipment reaches your destination country. AGDentool is not responsible for these charges if they are applied.</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">How do I check the status of my order?</h2>
          <p>When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.</p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Contact Us</h2>
          <p>If you have any further questions, please don't hesitate to contact us.</p>
        </div>
      </div>
    </>
  );
};
