"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get In{" "}
              <span className="text-yellow-500" style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.1)" }}>
                Touch
              </span>
            </h1>
            <p className="text-xl text-foreground">
              Have questions? We'd{" "}
              <span className="text-yellow-500 font-semibold">love</span> to hear
              from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
              <h2 className="text-2xl font-semibold mb-6">
                Send us a{" "}
                <span className="text-yellow-500" style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.1)" }}>
                  message
                </span>
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <Input
                    placeholder="Your name"
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    placeholder="How can we help you?"
                    rows={5}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <Button className="w-full bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30 transition-all">
                  Send Message
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 bg-card border-border hover:bg-card-hover hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Mail className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-500 mb-1">
                      Email
                    </h3>
                    <p className="text-foreground">info@parkmaster.com</p>
                    <p className="text-foreground">support@parkmaster.com</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border hover:bg-card-hover hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Phone className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-500 mb-1">
                      Phone
                    </h3>
                    <p className="text-foreground">+1 (555) 123-4567</p>
                    <p className="text-foreground">Mon-Fri 9am-6pm EST</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border hover:bg-card-hover hover:shadow-lg hover:shadow-yellow-500/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <MapPin className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-500 mb-1">
                      Office
                    </h3>
                    <p className="text-foreground">123 Parking Street</p>
                    <p className="text-foreground">New York, NY 10001</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
