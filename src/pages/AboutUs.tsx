import React from 'react';
import { Seo } from '../components/Seo';
import { ShieldCheck, Globe, Medal, HeadphonesIcon, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutUs = () => {
  return (
    <>
      <Seo title="About Us | AGDentool" description="Learn more about AGDentool's mission, history, and commitment to quality." />
      
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=2000" 
             alt="Dental equipment" 
             className="w-full h-full object-cover opacity-20"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">Precision in Every Detail</h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
              Empowering professionals worldwide with cutting-edge tools, uncompromising quality, and dedicated support since 1998.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Story Section */}
      <div className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1000" 
                  alt="Professional setup" 
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-brand-primary p-6 rounded-xl shadow-xl hidden md:block">
                  <p className="text-white font-bold text-3xl">25+</p>
                  <p className="text-white/80 text-sm font-medium">Years of Excellence</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                Welcome to AGDentool, your trusted partner in precision-engineered equipment and reliable medical supplies. We started with a simple belief: that better tools lead to better care.
              </p>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Over the decades, we have been the industry choice for modern operations, providing professionals with the tools they need for high-performance outcomes. We partner directly with top manufacturers to ensure exceptional precision in every instrument we supply.
              </p>
              <ul className="space-y-4">
                {[
                  "Premium Quality Instruments",
                  "Global Shipping & Logistics",
                  "Dedicated Concierge Support",
                  "Industry-Leading Warranties"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="text-brand-primary" size={24} />
                    <span className="text-slate-800 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Values/Features Section */}
      <div className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose AGDentool</h2>
            <p className="text-slate-600 text-lg">We are committed to delivering excellence across every touchpoint of your practice.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Medal size={32} />,
                title: "Expertise",
                description: "Over two decades of experience navigating the complexities of the supply industry."
              },
              {
                icon: <ShieldCheck size={32} />,
                title: "Quality Assured",
                description: "Partnering with top global manufacturers to bring you unmatched precision and reliability."
              },
              {
                icon: <Globe size={32} />,
                title: "Global Reach",
                description: "A robust logistics network ensuring products are in stock and ready for immediate global dispatch."
              },
              {
                icon: <HeadphonesIcon size={32} />,
                title: "Expert Support",
                description: "Dedicated customer service and technical support to assist you every step of the way."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-brand-primary/10 pointer-events-none"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to upgrade your equipment?</h2>
              <p className="text-slate-300 text-lg mb-10">
                Explore our catalog of over 15,000 premium products, or reach out to our concierge for bulk pricing and specialized requests.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/shop" className="bg-brand-primary text-white font-bold py-4 px-8 rounded-full hover:bg-blue-700 transition-colors">
                  Shop Products
                </Link>
                <a href="https://wa.me/447856364969" target="_blank" rel="noopener noreferrer" className="bg-white/10 text-white border border-white/20 font-bold py-4 px-8 rounded-full hover:bg-white/20 transition-colors">
                  Contact Concierge
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
