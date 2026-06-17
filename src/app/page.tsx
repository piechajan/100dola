import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import MalagaPromo from "@/components/MalagaPromo";
import EventsSection from "@/components/EventsSection";
import WhySection from "@/components/WhySection";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { aggregateRatingSchema } from "@/lib/schema-org";
import { GOOGLE_REVIEWS, GOOGLE_REVIEW_AGGREGATE } from "@/data/google-reviews";

export default function Home() {
  const ratingSchema = aggregateRatingSchema({
    ratingValue: GOOGLE_REVIEW_AGGREGATE.ratingValue,
    reviewCount: GOOGLE_REVIEW_AGGREGATE.reviewCount,
    bestRating: GOOGLE_REVIEW_AGGREGATE.bestRating,
    worstRating: GOOGLE_REVIEW_AGGREGATE.worstRating,
    reviews: GOOGLE_REVIEWS.map((r) => ({
      author: r.author,
      rating: r.rating,
      body: r.body,
      isoDate: r.isoDate,
    })),
  });
  return (
    <>
      <JsonLd data={ratingSchema} />
      <Navbar />
      <main>
        <Hero />
        <FeaturedProducts />
        <MalagaPromo />
        <EventsSection />
        <WhySection />
        <ReviewsCarousel />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
