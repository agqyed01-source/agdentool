import React from "react";
import { Seo } from "../components/Seo";
import { TrustBar, Hero } from "../components/TrustBarAndHero";
import { ProductGrid, ShopByCategoryBlock } from "../components/ProductSection";
import { Newsletter, WhatsAppAgents } from "../components/FooterAndNav";

export const Home = () => {
  return (
    <>
      <Seo
        title="Premium Dental Supplies & Equipment"
        description="Shop 15,000+ premium dental products, instruments, and equipment. Fast dispatch, secured payments, and expert support."
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AGDentool",
          url: "https://www.yourdentalsite.com/",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://www.yourdentalsite.com/shop?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <TrustBar />
      <Hero />
      <ShopByCategoryBlock />
      <ProductGrid title="Best Sellers" />
      <div className="bg-white py-12 border-t border-slate-100">
        <ProductGrid title="New Arrivals" />
      </div>
      <WhatsAppAgents />
      <Newsletter />
    </>
  );
};
