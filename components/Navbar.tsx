// components/Navbar.tsx
import React from "react";
import Link from "next/link";
import { Moon } from "lucide-react";
import { Button } from "./ui/button";
import Container from "./Container";

const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="mx-auto px-6">
          <div className="grid grid-cols-2 items-center py-4">
            {/* Left: Icon + Brand */}
            <div className="justify-self-start">
              <Link href="/" className="inline-flex items-center gap-1">
                <Moon
                  className="h-6 w-6 text-foreground/90"
                  aria-hidden="true"
                />
                <span className="text-foreground text-2xl">Lunr</span>
              </Link>
            </div>

            {/* Right: Dashboard CTA */}
            <div className="justify-self-end flex gap-2">
              <Button variant="ghost">
                <Link href="https://www.linkedin.com/in/rafael-galo-372258276?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app">
                  Contact Us
                </Link>
              </Button>
              <Button variant="outline">
                <Link href="/auth">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Navbar;
