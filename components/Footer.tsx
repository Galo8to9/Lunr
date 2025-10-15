import React from "react";
import Link from "next/link";
import Container from "./Container";
import { Moon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-white/10">
      <Container>
        <div className="mx-auto max-w-screen-xl px-6 flex-col flex gap-32 pt-6">
          <div className="grid gap-12 sm:grid-cols-2 items-start justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-1">
                <Moon
                  className="h-5 w-5 text-foreground/90"
                  aria-hidden="true"
                />
                <span className="text-foreground text-xl">Lunr</span>
              </Link>
              <p className="mt-2 text-sm text-foreground/70 max-w-xs">
                Generate verifiable proofs of solvency
              </p>
            </div>

            <div className="sm:justify-self-end">
              <div className="text-sm text-foreground/70 mb-3">Follow us</div>
              <div className="flex items-center gap-4">
                <Link
                  href="https://linkedin.com/company/humanos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  LinkedIn
                </Link>
                <Link
                  href="https://twitter.com/humanos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  Twitter
                </Link>
                <Link
                  href="https://github.com/humanos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-foreground/60">
            <div>© {new Date().getFullYear()} Lunr. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link
                href="#privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
