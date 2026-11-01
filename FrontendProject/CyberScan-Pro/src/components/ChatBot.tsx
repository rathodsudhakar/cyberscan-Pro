import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hi! I\'m your security assistant. I can help you understand security scans, vulnerability reports, and how to improve your website\'s security. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const faqResponses: { [key: string]: string } = {
    'scan': 'To run a security scan, go to the main page and click "Scan for Free". Enter your website URL and select the scan type. The scan will check for common vulnerabilities like missing security headers, SSL issues, and more.',
    'vulnerability': 'Vulnerability levels indicate the severity of security issues:\n• High: Critical issues that need immediate attention\n• Medium: Important issues that should be addressed soon\n• Low: Minor issues that can be fixed when convenient',
    'report': 'Security reports show vulnerabilities found, their severity levels, descriptions of the issues, and specific recommendations for fixing them. You can download PDF reports from the Reports page.',
    'high': 'High severity vulnerabilities are critical security issues that could allow attackers to compromise your website. These should be fixed immediately as they pose significant risks.',
    'medium': 'Medium severity vulnerabilities are important security issues that could be exploited under certain conditions. While not as critical as high severity issues, they should be addressed promptly.',
    'low': 'Low severity vulnerabilities are minor security issues that don\'t pose immediate threats but should still be addressed to improve overall security posture.',
    'ssl': 'SSL/TLS issues involve problems with your website\'s encryption. Common issues include outdated TLS versions, weak cipher suites, or improper certificate configuration.',
    'headers': 'Security headers are HTTP response headers that help protect against common attacks. Important headers include Content-Security-Policy, X-Frame-Options, and Strict-Transport-Security.',
    'help': 'I can help you with:\n• How to run security scans\n• Understanding vulnerability reports\n• Interpreting security scores\n• Fixing common security issues\n• Best practices for website security'
  };

  const getResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(faqResponses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    // Default responses for common patterns
    if (message.includes('how') || message.includes('what') || message.includes('?')) {
      return 'I can help you with security-related questions. Try asking about "how to run a scan", "what are vulnerability levels", or "how to interpret reports".';
    }

    return 'I understand you\'re asking about security. Could you be more specific? I can help with scans, vulnerabilities, reports, and security best practices.';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Call Gemini API through edge function
      const response = await fetch('https://kqxiamjrsgkgbzfvwyfe.supabase.co/functions/v1/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.reply || 'I apologize, but I could not generate a response at this time.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback to local responses if API fails
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getResponse(messageToSend),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Security Assistant</CardTitle>
                    <p className="text-xs text-muted-foreground">Always here to help</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Messages */}
                <ScrollArea className="h-80 px-4">
                  <div className="space-y-4 py-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user' 
                              ? 'bg-primary' 
                              : 'bg-muted'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="h-3 w-3 text-primary-foreground" />
                            ) : (
                              <Bot className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className={`rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start space-x-2">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="bg-muted rounded-lg px-3 py-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-border p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about security scans..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['How to scan?', 'Vulnerability levels?', 'Read reports?'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setInputValue(suggestion)}
                        disabled={isTyping}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;