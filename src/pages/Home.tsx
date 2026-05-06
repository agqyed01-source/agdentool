import React from "react";
import { Seo } from "../components/Seo";
import { TrustBar, Hero } from "../components/TrustBarAndHero";
import {
  CategoryBar,
  ProductGrid,
  ShopByCategoryBlock,
} from "../components/ProductSection";
import { Newsletter } from "../components/FooterAndNav";
import { useParams, useSearchParams } from "react-router-dom";

export const Home = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const isHome = !slug && !searchQuery;

  return (
    <>
      <Seo
        title={
          isHome
            ? "Premium Dental Supplies & Equipment"
            : slug
              ? `Products in ${slug}`
              : "Search Results"
        }
        description="Shop 15,000+ premium dental products, instruments, and clinic equipment. Fast dispatch, secured payments, and expert support."
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Dental Depot",
          url: "https://www.yourdentalsite.com/",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://www.yourdentalsite.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      {isHome && <TrustBar />}
      {isHome && <Hero />}
      {isHome && <ShopByCategoryBlock />}
      <CategoryBar />
      {isHome && <ProductGrid title="Best Sellers" />}
      <ProductGrid />
      {isHome && (
        <div className="bg-white py-12 border-t border-slate-100">
          <ProductGrid title="New Arrivals" />
        </div>
      )}
      <Newsletter />
    </>
  );
};
