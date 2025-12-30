import { ParkingSquare } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border bg-gradient-to-b from-background to-yellow-50/20 dark:to-yellow-950/10">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ParkingSquare className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-foreground">
                Park<span className="text-yellow-500">Master</span>
              </span>
            </div>
            <p className="text-foreground">
              Making parking{" "}
              <span className="text-yellow-500 font-semibold">effortless</span> with
              smart technology and innovative solutions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-500 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-foreground hover:text-yellow-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-foreground hover:text-yellow-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-foreground hover:text-yellow-500 transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-500 mb-4">
              Contact Info
            </h3>
            <ul className="space-y-2 text-foreground">
              <li>Email: info@parkmaster.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Parking St, City, State</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border text-center text-foreground">
          <p>
            &copy; 2024{" "}
            <span className="text-yellow-500 font-semibold">ParkMaster</span>. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
