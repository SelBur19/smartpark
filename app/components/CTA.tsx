import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-yellow-50/30 to-secondary/50 dark:from-yellow-950/10 dark:to-secondary/50">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to{" "}
            <span className="text-yellow-500">Transform</span> Your Parking
            Experience?
          </h2>
          <p className="text-xl text-foreground">
            Join{" "}
            <span className="text-yellow-500 font-semibold">thousands</span> of
            satisfied customers who have already made the switch to smart parking
          </p>
          <Link href="/signup">
            <Button className="bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 group">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
