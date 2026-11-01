import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Search } from "lucide-react";
import ScanModal from "./ScanModal";

const Hero = () => {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center cyber-grid">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/50"></div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-cyber-subtle border border-primary/20 rounded-full px-6 py-2 mb-8">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Professional Vulnerability Scanner</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient leading-tight">
            Secure Your Website
            <br />
            <span className="text-foreground">Before Hackers Do</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Enter any website URL and get instant security vulnerability reports. 
            Protect your digital assets with professional-grade scanning technology.
          </p>

          {/* URL Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-card border border-border rounded-xl glow">
              <div className="flex-1 flex items-center space-x-3 px-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                  readOnly
                />
              </div>
              <Button 
                variant="cyber" 
                size="lg" 
                className="animate-pulse-glow"
                onClick={() => setIsScanModalOpen(true)}
              >
                <Zap className="h-5 w-5 mr-2" />
                Scan Now
              </Button>
            </div>
          </div>

          {/* Features preview */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Instant Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>No Registration Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Professional Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Free Basic Scan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-pulse delay-500"></div>

      <ScanModal 
        isOpen={isScanModalOpen} 
        onClose={() => setIsScanModalOpen(false)} 
      />
    </section>
  );
};

export default Hero;