"use client";

import "../globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Team from "../components/Team";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const Index = () => {
  const router = useRouter();

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
