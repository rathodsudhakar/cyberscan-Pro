import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock, Radar, Check, X, ChevronDown, ChevronUp, Star, Zap, Crown, Building, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string;
}

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: "Starter",
      icon: Shield,
      price: isYearly ? 0 : 0,
      originalPrice: null,
      description: "Perfect for individuals and small projects",
      badge: null,
      features: [
        "5 scans per month",
        "Basic vulnerability detection",
        "Limited reports",
        "Email support",
        "Community access"
      ],
      cta: "Get Started",
      ctaAction: () => navigate('/auth'),
      highlighted: false
    },
    {
      name: "Pro",
      icon: Zap,
      price: isYearly ? 399 : 499,
      originalPrice: isYearly ? null : 499,
      description: "Most popular for professionals and growing teams",
      badge: "Most Popular",
      features: [
        "100 scans per month",
        "Advanced AI detection",
        "Downloadable PDF reports",
        "Email alerts & notifications",
        "Priority support",
        "Advanced analytics",
        "API access (basic)"
      ],
      cta: "Upgrade Now",
      ctaAction: () => navigate('/auth'),
      highlighted: true
    },
    {
      name: "Enterprise",
      icon: Building,
      price: null,
      originalPrice: null,
      description: "Custom solutions for large organizations",
      badge: "Custom",
      features: [
        "Unlimited scans",
        "Full API access",
        "Priority 24/7 support",
        "Custom integrations",
        "White-label options",
        "Dedicated account manager",
        "Custom reporting",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      ctaAction: () => navigate('/contact'),
      highlighted: false
    }
  ];

  const comparisonFeatures = [
    { name: "Monthly Scans", starter: "5", pro: "100", enterprise: "Unlimited" },
    { name: "AI Detection", starter: "Basic", pro: "Advanced", enterprise: "Full Suite" },
    { name: "PDF Reports", starter: "Limited", pro: "Unlimited", enterprise: "Custom" },
    { name: "API Access", starter: "None", pro: "Basic", enterprise: "Full" },
    { name: "Support", starter: "Email", pro: "Priority", enterprise: "24/7 Dedicated" },
    { name: "Custom Integrations", starter: "No", pro: "No", enterprise: "Yes" }
  ];

  const faqs: FAQItem[] = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and UPI payments. Enterprise customers can also pay via invoice."
    },
    {
      question: "Is there a free trial for paid plans?",
      answer: "Yes! We offer a 14-day free trial for Pro plan. No credit card required to start your trial."
    },
    {
      question: "What happens if I exceed my scan limit?",
      answer: "You'll be notified when you're approaching your limit. You can upgrade your plan or purchase additional scans as needed."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans if you're not satisfied with our service."
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Home Button */}
            <div className="flex justify-start mb-8">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>
            
            <div className="inline-flex items-center space-x-2 bg-gradient-cyber-subtle border border-primary/20 rounded-full px-6 py-2 mb-8">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Pricing Plans</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient leading-tight">
              Simple, Transparent
              <br />
              <span className="text-foreground">Pricing</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose the perfect plan for your security needs
            </p>
            
            {/* Monthly/Yearly Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-lg font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Yearly
                </span>
                {isYearly && (
                  <Badge className="bg-green-500 text-white">
                    Save 20%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name}
                  className={`relative ${
                    plan.highlighted 
                      ? 'border-primary shadow-2xl shadow-primary/20 scale-105 hover:scale-105' 
                      : 'border-border hover:border-primary/50 hover:shadow-lg'
                  } transition-all duration-300 bg-card`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className={`${plan.highlighted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} px-4 py-1`}>
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pt-8">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${plan.highlighted ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Icon className={`h-8 w-8 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <div className="mb-6">
                      {plan.price !== null ? (
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold">¥{plan.price}</span>
                          {plan.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through ml-2">
                              ¥{plan.originalPrice}
                            </span>
                          )}
                          <span className="text-muted-foreground ml-2">/month</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">Custom Pricing</div>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-left">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full ${
                        plan.highlighted 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={plan.ctaAction}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Feature Comparison</h2>
            <p className="text-muted-foreground text-lg">Compare all plans at a glance</p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-4 border-b border-border">
                <div className="p-4 font-semibold text-left">Features</div>
                <div className="p-4 font-semibold text-center">Starter</div>
                <div className="p-4 font-semibold text-center">Pro</div>
                <div className="p-4 font-semibold text-center">Enterprise</div>
              </div>
              
              {comparisonFeatures.map((feature, index) => (
                <div key={index} className="grid grid-cols-4 border-b border-border last:border-b-0">
                  <div className="p-4 text-left font-medium">{feature.name}</div>
                  <div className="p-4 text-center">{feature.starter}</div>
                  <div className="p-4 text-center">{feature.pro}</div>
                  <div className="p-4 text-center">{feature.enterprise}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about our pricing</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-border">
                <div 
                  className="p-6 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  {expandedFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Radar className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Still confused? Contact us</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our security experts are here to help you choose the perfect plan for your needs
            </p>
            <Button variant="cyber" size="lg" onClick={() => navigate('/contact')}>
              Talk to Expert
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
