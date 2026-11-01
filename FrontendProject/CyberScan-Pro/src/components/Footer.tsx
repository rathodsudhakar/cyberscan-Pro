import { Shield, Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gradient">CyberScanPro</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Professional vulnerability scanning for modern websites. 
              Secure your digital assets before hackers find your weaknesses.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary transition-colors">Features</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">API</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 CyberScanPro. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-4 md:mt-0">
            <span>Secured by</span>
            <Shield className="h-4 w-4 text-primary mx-1" />
            <span className="text-primary font-medium">Enterprise-grade encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;