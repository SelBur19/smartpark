import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Smart Parking{" "}
            <span className="text-yellow-400">Solutions</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Revolutionary parking management system that makes{" "}
            <span className="text-yellow-500 font-semibold">finding</span> and{" "}
            <span className="text-yellow-500 font-semibold">managing</span> parking
            spaces effortless
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="border border-border hover:bg-card-hover bg-transparent text-primary-foreground">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
