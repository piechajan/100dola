import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import MalagaPromo from "@/components/MalagaPromo";
import EventsSection from "@/components/EventsSection";
import WhySection from "@/components/WhySection";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedProducts />
        <MalagaPromo />
        <EventsSection />
        <WhySection />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
