/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/FeaturedAndFooter';
import { MobileBottomNav } from './components/FooterAndNav';
import { Analytics } from './components/Analytics';
import { Home } from './pages/Home';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { AccountPage } from './pages/AccountPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { OrderPage } from './pages/OrderPage';
import { AboutUs } from './pages/AboutUs';
import { ShippingPolicy } from './pages/ShippingPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { ContactUs } from './pages/ContactUs';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Compliance } from './pages/Compliance';
import { CookiePolicy } from './pages/CookiePolicy';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ScrollToTop />
      <Analytics />
      {/* Navigation */}
      <Header />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/category/:slug" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/cookies" element={<CookiePolicy />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Mobile-only Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Toast / Chat placeholder */}
      <div className="fixed bottom-20 right-4 z-50 md:bottom-8 md:right-8">
        <a href="https://wa.me/447856364969" target="_blank" rel="noopener noreferrer" className="block bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] hover:scale-110 active:scale-95 transition-all text-center flex items-center justify-center" aria-label="Chat support on WhatsApp">
           <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </a>
      </div>
    </div>
  );
}

