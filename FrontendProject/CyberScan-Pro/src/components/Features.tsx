import { Shield, Zap, BarChart3, Lock, Radar, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Scans",
      description: "Get comprehensive vulnerability reports in seconds, not hours. Our advanced scanning engine processes websites instantly.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Shield,
      title: "Advanced Security Detection",
      description: "Detect SQL injection, XSS, CSRF, and 50+ other security vulnerabilities with enterprise-grade accuracy.",
      gradient: "from-accent to-primary"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics Dashboard",
      description: "Beautiful, interactive dashboards that make security data easy to understand and act upon.",
      gradient: "from-primary to-blue-500"
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Your data is encrypted with industry-standard protocols. We never store your sensitive information.",
      gradient: "from-blue-500 to-accent"
    },
    {
      icon: Radar,
      title: "Real-time Monitoring",
      description: "Continuous monitoring alerts you to new vulnerabilities as they emerge on your website.",
      gradient: "from-accent to-primary"
    },
    {
      icon: FileText,
      title: "Professional Reports",
      description: "Generate detailed PDF reports perfect for compliance audits and team presentations.",
      gradient: "from-primary to-purple-500"
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-cyber-subtle border border-primary/20 rounded-full px-6 py-2 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Powerful Features</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional-grade security scanning tools designed for developers, security teams, and businesses who take cybersecurity seriously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"
                   style={{ 
                     background: `linear-gradient(135deg, hsl(195 100% 50% / 0.2), hsl(240 100% 60% / 0.2))` 
                   }}>
              </div>
              
              <CardHeader className="relative">
                <div className={`inline-flex w-12 h-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-gradient transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;