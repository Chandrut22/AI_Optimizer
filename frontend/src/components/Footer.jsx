import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#ffffff] dark:bg-[#000000] border-t border-border/40">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-[1280px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Column 1: Brand */}
          <div className="text-center md:text-left">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 group mb-3"
            >
              <img className="w-8 h-8" src="/favicon/favicon.svg" alt="Logo" />
              <span className="font-bold text-xl font-inter text-foreground group-hover:text-primary transition-colors duration-200">
                AI Optimizer
              </span>
            </Link>
            <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              AI-driven content visibility for modern search engines and
              generative platforms.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-[#6B7280] dark:text-[#94A3B8] text-sm hover:text-[#38BDF8] transition-colors duration-200 inline-block"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-[#6B7280] dark:text-[#94A3B8] text-sm hover:text-[#38BDF8] transition-colors duration-200 inline-block"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-[#6B7280] dark:text-[#94A3B8] text-sm hover:text-[#38BDF8] transition-colors duration-200 inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-[#6B7280] dark:text-[#94A3B8] text-sm hover:text-[#38BDF8] transition-colors duration-200 inline-block"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Icons */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex justify-center md:justify-end space-x-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8] hover:text-[#38BDF8] hover:border-[#38BDF8] hover:bg-[#38BDF8]/5 transition-all duration-200 group"
              >
                <Twitter className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8] hover:text-[#38BDF8] hover:border-[#38BDF8] hover:bg-[#38BDF8]/5 transition-all duration-200 group"
              >
                <Linkedin className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-[#6B7280] dark:text-[#94A3B8] hover:text-[#38BDF8] hover:border-[#38BDF8] hover:bg-[#38BDF8]/5 transition-all duration-200 group"
              >
                <Github className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </a>
            </div>
            <p className="text-[#6B7280] dark:text-[#94A3B8] text-xs mt-4">
              Follow us for updates
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-border/40 mt-8 pt-6 text-center">
          <p className="text-[#6B7280] dark:text-[#94A3B8] text-sm">
            © 2024 AI Optimizer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
