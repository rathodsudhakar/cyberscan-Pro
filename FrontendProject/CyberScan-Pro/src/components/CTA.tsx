import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Zap } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
      <div className="absolute inset-0 cyber-grid opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-cyber-subtle border border-primary/20 rounded-full px-6 py-2 mb-8">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Ready to Secure Your Website?</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Start Your Free Security Scan
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of developers and businesses who trust CyberScanPro to keep their websites secure. 
            No credit card required for your first scan.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button variant="cyber" size="xl" className="group animate-pulse-glow">
              <Zap className="h-5 w-5 mr-2 group-hover:animate-spin" />
              Scan for Free Now
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" size="xl" className="border-primary/30 text-primary hover:bg-primary/10">
              View Pricing Plans
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-12 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">Websites Scanned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Vulnerability Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
    </section>
  );
};

export default CTA;