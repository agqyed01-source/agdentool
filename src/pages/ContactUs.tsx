import React from 'react';
import { Seo } from '../components/Seo';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export const ContactUs = () => {
  return (
    <>
      <Seo title="Contact Us | AGDentool" description="Get in touch with AGDentool." />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-8 text-center">Contact Us</h1>
        <p className="text-xl text-slate-600 text-center mb-16">
          We're here to help. Reach out to our expert team for support, product inquiries, or bulk orders.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-brand-primary flex-shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">WhatsApp Support</h3>
                  <p className="text-slate-600 mb-2">Instant messaging with our specialists</p>
                  <a href="https://wa.me/447856364969" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-medium hover:underline">
                    Chat with Dr. Mike (+44 7856 364969)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-brand-primary flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Phone</h3>
                  <p className="text-slate-600 mb-2">Mon-Fri from 9am to 6pm</p>
                  <p className="text-slate-900 font-medium">+44 7856 364969</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-brand-primary flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email</h3>
                  <p className="text-slate-600 mb-2">For general inquiries</p>
                  <a href="mailto:support@agdentool.com" className="text-brand-primary font-medium hover:underline">
                    support@agdentool.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-brand-primary flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Global Headquarters</h3>
                  <p className="text-slate-600">
                    London, United Kingdom
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" placeholder="Dr. John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea rows={4} className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" placeholder="How can we help you?"></textarea>
              </div>
              <button className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
