import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import Team from "./Team";
import CTA from "./CTA";
import Footer from "./Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Team />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
