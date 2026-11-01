import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">CyberScanPro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <button 
              onClick={() => navigate('/pricing')}
              className="text-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              Pricing
            </button>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button variant="cyber" size="lg" onClick={() => navigate('/auth')}>
              Scan for Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="#features" className="text-foreground hover:text-primary transition-colors">
                Features
              </a>
              <button 
                onClick={() => navigate('/pricing')}
                className="text-foreground hover:text-primary transition-colors bg-transparent border-none cursor-pointer text-left"
              >
                Pricing
              </button>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </a>
              <Button variant="cyber" size="lg" className="w-full" onClick={() => navigate('/auth')}>
                Scan for Free
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;