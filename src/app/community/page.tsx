import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommunityHero from "@/components/community/CommunityHero";
import EventListing from "@/components/community/EventListing";
import WhyJoin from "@/components/community/WhyJoin";
import GalleryRecap from "@/components/community/GalleryRecap";
import CommunityNewsletter from "@/components/community/CommunityNewsletter";

export const metadata = {
  title: "Jedeme spolu — Open Miles Clinic | 100dola",
  description: "Lokální komunitní akce, social rides, skialpy a skupinový pohyb. Přidej se k nám.",
};

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <main>
        <CommunityHero />
        <EventListing />
        <WhyJoin />
        <GalleryRecap />
        <CommunityNewsletter />
      </main>
      <Footer />
    </>
  );
}
