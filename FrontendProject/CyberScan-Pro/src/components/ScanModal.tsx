import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Search, Shield, AlertTriangle, CheckCircle, Download, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VulnerabilityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Web Application' | 'Client Security' | 'Server Security' | 'Dependencies' | 'Authentication' | 'Network';
  evidence: string;
  remediation: string;
  cve?: string;
  cvss?: number;
}

interface ScanResult {
  id: string;
  target: string;
  riskScore: number;
  findings: VulnerabilityFinding[];
  scanType: 'basic' | 'advanced';
  completedAt: string;
  scanDuration: number;
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const ScanModal = ({ isOpen, onClose }: ScanModalProps) => {
  const [protocol, setProtocol] = useState("https");
  const [domain, setDomain] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset modal state when it's opened
  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setScanProgress(0);
      setScanStage("");
      setDomain("");
      setProtocol("https");
    }
  }, [isOpen]);

  const handleScan = async () => {
    if (!domain.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain to scan.",
        variant: "destructive",
      });
      return;
    }

    // Clear previous scan results
    setScanResult(null);
    setIsScanning(true);
    setScanProgress(0);
    setScanStage("Initializing scan...");
    
    try {
      const target = `${protocol}://${domain.trim()}`;
      
      // Simulate progress updates during scan - faster to match actual scan time
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev < 30) {
            setScanStage("Initializing scan...");
            return Math.min(prev + 15, 30);
          } else if (prev < 60) {
            setScanStage("Analyzing security headers...");
            return Math.min(prev + 15, 60);
          } else if (prev < 90) {
            setScanStage("Scanning for vulnerabilities...");
            return Math.min(prev + 15, 90);
          } else {
            setScanStage("Waiting for results...");
            return 90; // Stay at 90% until API completes
          }
        });
      }, 200);
      
      // Call backend API
      console.log('Calling backend API for:', target);
      setScanStage("Connecting to scanning service...");
      const response = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: target })
      });
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStage("Processing results...");
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const scanData = await response.json();
      
      // Debug: Log the actual backend response
      console.log('Raw backend response:', scanData);
      console.log('Response type:', typeof scanData);
      console.log('Has vulnerabilities:', !!scanData.vulnerabilities);
      console.log('Vulnerabilities data:', scanData.vulnerabilities);
      
      // Validate that we have real data from backend
      if (!scanData || !scanData.target_url || typeof scanData.risk_score !== 'number') {
        throw new Error('Invalid response from backend - missing required fields');
      }
      
      // Transform backend response to frontend format
      const transformedResult: ScanResult = {
        id: Math.random().toString(36).substr(2, 9),
        target: scanData.target_url,
        riskScore: scanData.risk_score,
        findings: Object.entries(scanData.vulnerabilities || {}).flatMap(([url, vulns]) => 
          Object.entries(vulns as any).map(([vulnName, vulnData]: [string, any]) => ({
            id: `${url}-${vulnName}`,
            title: vulnName,
            description: vulnData.description,
            severity: vulnData.severity === 'High' ? 'High' as const : 
                     vulnData.severity === 'Medium' ? 'Medium' as const : 'Low' as const,
            category: 'Web Application' as const,
            evidence: `Detected on: ${url}`,
            remediation: vulnData.recommendation
          }))
        ),
        scanType: 'basic',
        completedAt: scanData.scan_date,
        scanDuration: 30, // Approximate duration
        stats: {
          critical: 0,
          high: Object.values(scanData.vulnerabilities || {}).flatMap((vulns: any) => 
            Object.values(vulns).filter((v: any) => v.severity === 'High')
          ).length,
          medium: Object.values(scanData.vulnerabilities || {}).flatMap((vulns: any) => 
            Object.values(vulns).filter((v: any) => v.severity === 'Medium')
          ).length,
          low: Object.values(scanData.vulnerabilities || {}).flatMap((vulns: any) => 
            Object.values(vulns).filter((v: any) => v.severity === 'Low')
          ).length
        }
      };

      console.log('Transformed result:', transformedResult);
      console.log('Number of findings:', transformedResult.findings.length);

      // Save to Supabase for persistence
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: savedScan, error: saveError } = await supabase
            .from('scans')
            .insert({
              target: scanData.target_url,
              protocol,
              type: 'basic',
              status: 'completed',
              risk_score: scanData.risk_score,
              findings: transformedResult.findings as any,
              user_id: session.user.id,
              completed_at: new Date().toISOString(),
              meta: {
                scanType: 'basic',
                duration: transformedResult.scanDuration,
                stats: transformedResult.stats,
                scanned_urls: scanData.scanned_urls
              } as any
            })
            .select()
            .single();

          if (saveError) {
            console.error('Failed to save scan to database:', saveError);
            toast({
              title: "Save Error",
              description: "Scan completed but failed to save results",
              variant: "destructive"
            });
          } else {
            console.log('Scan saved successfully:', savedScan);
          }
        }
      } catch (dbError) {
        console.error('Database save error:', dbError);
        toast({
          title: "Database Error",
          description: "Failed to save scan results",
          variant: "destructive"
        });
      }

      setScanResult(transformedResult);
      setScanStage("Scan complete!");
      
      toast({
        title: "Scan Complete",
        description: `Found ${transformedResult.findings.length} potential issues.`,
      });
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || 'Failed to connect to scanning service',
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanStage("");
    }
  };

  const generatePDFReport = (scanResult: ScanResult) => {
    const reportData = {
      title: `Security Scan Report - ${scanResult.target}`,
      target: scanResult.target,
      scanDate: new Date(scanResult.completedAt).toLocaleString(),
      scanType: scanResult.scanType.toUpperCase(),
      riskScore: scanResult.riskScore,
      duration: `${Math.round(scanResult.scanDuration)} seconds`,
      summary: {
        totalFindings: scanResult.findings.length,
        critical: scanResult.stats.critical,
        high: scanResult.stats.high,
        medium: scanResult.stats.medium,
        low: scanResult.stats.low
      },
      findings: scanResult.findings.map(finding => ({
        title: finding.title,
        severity: finding.severity,
        category: finding.category,
        description: finding.description,
        evidence: finding.evidence,
        remediation: finding.remediation,
        cve: finding.cve || 'N/A',
        cvss: finding.cvss || 'N/A'
      })),
      recommendations: [
        'Prioritize fixing Critical and High severity vulnerabilities',
        'Implement a regular security scanning schedule',
        'Update all dependencies to their latest secure versions',
        'Establish proper input validation and output encoding',
        'Configure security headers and HTTPS redirects',
        'Implement proper authentication and session management'
      ]
    };

    // Create detailed HTML report content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .finding { border: 1px solid #ddd; margin: 15px 0; padding: 15px; border-radius: 5px; page-break-inside: avoid; }
          .critical { border-left: 5px solid #dc2626; }
          .high { border-left: 5px solid #ea580c; }
          .medium { border-left: 5px solid #ca8a04; }
          .low { border-left: 5px solid #16a34a; }
          .severity { font-weight: bold; padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
          .severity.critical { background: #dc2626; }
          .severity.high { background: #ea580c; }
          .severity.medium { background: #ca8a04; }
          .severity.low { background: #16a34a; }
          .evidence { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; word-break: break-all; }
          .recommendations { background: #e0f2fe; padding: 20px; border-radius: 8px; }
          .finding-title { font-size: 16px; margin-bottom: 8px; }
          .finding-meta { font-size: 12px; color: #666; margin-bottom: 8px; }
          .finding-description { margin-bottom: 10px; }
          .finding-remediation { font-style: italic; color: #333; }
          @media print {
            .finding { page-break-inside: avoid; }
            body { margin: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportData.title}</h1>
          <p><strong>Target:</strong> ${reportData.target}</p>
          <p><strong>Scan Date:</strong> ${reportData.scanDate}</p>
          <p><strong>Scan Type:</strong> ${reportData.scanType}</p>
          <p><strong>Duration:</strong> ${reportData.duration}</p>
          <p><strong>Risk Score:</strong> ${reportData.riskScore}/100</p>
        </div>
        
        <div class="summary">
          <h2>Executive Summary</h2>
          <p>Total Vulnerabilities Found: <strong>${reportData.summary.totalFindings}</strong></p>
          <ul>
            <li>Critical: ${reportData.summary.critical}</li>
            <li>High: ${reportData.summary.high}</li>
            <li>Medium: ${reportData.summary.medium}</li>
            <li>Low: ${reportData.summary.low}</li>
          </ul>
        </div>

        <h2>All Vulnerability Findings (${reportData.summary.totalFindings})</h2>
        ${reportData.findings.map((finding, index) => `
          <div class="finding ${finding.severity.toLowerCase()}">
            <div class="finding-title">
              <strong>#${index + 1}. ${finding.title}</strong> 
              <span class="severity ${finding.severity.toLowerCase()}">${finding.severity}</span>
            </div>
            <div class="finding-meta">
              <strong>Category:</strong> ${finding.category} | 
              <strong>CVSS:</strong> ${finding.cvss || 'N/A'} | 
              <strong>CVE:</strong> ${finding.cve || 'N/A'}
            </div>
            <div class="finding-description">
              <strong>Description:</strong> ${finding.description}
            </div>
            ${finding.evidence ? `
              <div class="evidence">
                <strong>Evidence:</strong><br>
                ${finding.evidence}
              </div>
            ` : ''}
            <div class="finding-remediation">
              <strong>Remediation:</strong> ${finding.remediation}
            </div>
          </div>
        `).join('')}

        ${reportData.summary.totalFindings > 0 ? `
          <div class="recommendations">
            <h2>General Recommendations</h2>
            <ul>
              ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            <p><strong>Priority Actions:</strong></p>
            <ol>
              <li>Address all Critical and High severity vulnerabilities immediately</li>
              <li>Implement missing security headers to improve overall security posture</li>
              <li>Regularly update dependencies and scan for new vulnerabilities</li>
              <li>Establish a security testing schedule for ongoing monitoring</li>
            </ol>
          </div>
        ` : `
          <div class="summary">
            <h2>Security Assessment</h2>
            <p><strong>No vulnerabilities were detected.</strong> However, security is an ongoing process:</p>
            <ul>
              <li>Continue regular security scanning</li>
              <li>Keep all software and dependencies updated</li>
              <li>Monitor for newly discovered vulnerabilities</li>
              <li>Implement security best practices in development</li>
            </ul>
          </div>
        `}
      </body>
      </html>
    `;

    return htmlContent;
  };

  const handleDownloadReport = async () => {
    if (!scanResult) {
      toast({
        title: "No Scan Data",
        description: "Please run a scan first.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Generating PDF Report",
        description: "Creating comprehensive security report...",
      });

      // Prepare scan data for backend
      const vulnerabilities: { [key: string]: { [key: string]: any } } = {};
      
      // Convert findings array to vulnerabilities object structure
      if (scanResult.findings && Array.isArray(scanResult.findings)) {
        scanResult.findings.forEach((finding: any) => {
          const url = scanResult.target; // Use the scan target as the URL key
          if (!vulnerabilities[url]) {
            vulnerabilities[url] = {};
          }
          vulnerabilities[url][finding.title || 'Unknown'] = {
            severity: finding.severity || 'Unknown',
            description: finding.description || 'No description available',
            recommendation: finding.remediation || finding.recommendation || 'No recommendation available'
          };
        });
      }
      
      const scanDataForPdf = {
        target_url: scanResult.target,
        scanned_urls: [scanResult.target], // Basic scan includes main target
        vulnerabilities: vulnerabilities,
        risk_score: scanResult.riskScore,
        scan_date: scanResult.completedAt,
        status: 'completed'
      };

      // Call backend API to generate PDF
      const response = await fetch('http://localhost:5000/api/download-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scan_results: scanDataForPdf,
          target_url: scanResult.target
        })
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${scanResult.target.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded",
        description: "PDF security report has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Download error:', error);
      // Fallback to HTML report if PDF fails
      try {
        const htmlContent = generatePDFReport(scanResult);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${scanResult.target.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().getTime()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "HTML Report Downloaded",
          description: "PDF generation failed, downloaded HTML report instead.",
        });
      } catch (fallbackError) {
        toast({
          title: "Download Failed",
          description: error.message || 'Failed to generate report',
          variant: "destructive",
        });
      }
    }
  };

  const handleAdvancedScan = async () => {
    if (!domain.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain to scan.",
        variant: "destructive",
      });
      return;
    }

    // Clear previous scan results
    setScanResult(null);
    setIsScanning(true);
    setScanProgress(0);
    setScanStage("Initializing advanced scan...");
    
    try {
      const target = `${protocol}://${domain.trim()}`;
      
      // Simulate progress updates during advanced scan - longer duration for comprehensive testing
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev < 15) {
            setScanStage("Discovering URLs and endpoints...");
            return Math.min(prev + 8, 15);
          } else if (prev < 30) {
            setScanStage("Scanning for XSS vulnerabilities...");
            return Math.min(prev + 8, 30);
          } else if (prev < 45) {
            setScanStage("Testing for SQL injection...");
            return Math.min(prev + 8, 45);
          } else if (prev < 60) {
            setScanStage("Analyzing security headers (CORS/Clickjacking)...");
            return Math.min(prev + 8, 60);
          } else if (prev < 75) {
            setScanStage("Testing for SSRF and Command Injection...");
            return Math.min(prev + 8, 75);
          } else if (prev < 85) {
            setScanStage("Checking authentication bypass...");
            return Math.min(prev + 8, 85);
          } else if (prev < 95) {
            setScanStage("Analyzing dependencies...");
            return Math.min(prev + 8, 95);
          } else {
            setScanStage("Generating comprehensive report...");
            return 95; // Stay at 95% until API completes
          }
        });
      }, 300);
      
      // Call advanced scan backend API
      console.log('Calling advanced scan API for:', target);
      setScanStage("Connecting to advanced scanning service...");
      const response = await fetch('http://localhost:5000/api/advanced-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: target })
      });
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStage("Processing advanced results...");
      
      console.log('Advanced API Response status:', response.status);
      console.log('Advanced API Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`Advanced scan failed: ${response.statusText}`);
      }

      const scanData = await response.json();
      
      // Debug: Log the actual backend response
      console.log('Raw advanced backend response:', scanData);
      console.log('Advanced response type:', typeof scanData);
      console.log('Advanced scan vulnerabilities:', scanData.vulnerabilities);
      console.log('Advanced scan statistics:', scanData.statistics);
      
      // Validate that we have real data from backend
      if (!scanData || !scanData.target_url || typeof scanData.risk_score !== 'number') {
        throw new Error('Invalid response from advanced scan backend - missing required fields');
      }
      
      // Transform advanced backend response to frontend format
      const transformedResult: ScanResult = {
        id: Math.random().toString(36).substr(2, 9),
        target: scanData.target_url,
        riskScore: scanData.risk_score,
        findings: Object.entries(scanData.vulnerabilities || {}).flatMap(([url, vulnCategories]) => 
          Object.entries(vulnCategories as any).flatMap(([category, vulns]) => 
            (Array.isArray(vulns) ? vulns : [vulns]).map((vuln: any) => ({
              id: `${url}-${category}-${vuln.type || 'unknown'}`,
              title: vuln.type || `${category} Vulnerability`,
              description: vuln.description || `${category} security issue detected`,
              severity: vuln.severity === 'Critical' ? 'Critical' as const : 
                       vuln.severity === 'High' ? 'High' as const :
                       vuln.severity === 'Medium' ? 'Medium' as const : 'Low' as const,
              category: category === 'XSS' ? 'Web Application' as const :
                       category === 'SQL Injection' ? 'Web Application' as const :
                       category === 'Security Headers' ? 'Server Security' as const :
                       category === 'SSRF/Command Injection' ? 'Server Security' as const :
                       category === 'Authentication' ? 'Authentication' as const :
                       category === 'Dependencies' ? 'Dependencies' as const : 'Web Application' as const,
              evidence: vuln.payload ? `Payload used: ${vuln.payload}` : `Detected on: ${url}`,
              remediation: vuln.recommendation || 'Address the identified security vulnerability'
            }))
          )
        ),
        scanType: 'advanced',
        completedAt: scanData.scan_date,
        scanDuration: 120, // Advanced scans take longer
        stats: {
          critical: scanData.statistics?.critical || 0,
          high: scanData.statistics?.high || 0,
          medium: scanData.statistics?.medium || 0,
          low: scanData.statistics?.low || 0
        }
      };

      console.log('Transformed advanced result:', transformedResult);
      console.log('Number of advanced findings:', transformedResult.findings.length);

      // Save advanced scan to Supabase for persistence
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: savedScan, error: saveError } = await supabase
            .from('scans')
            .insert({
              target: scanData.target_url,
              protocol,
              type: 'advanced',
              status: 'completed',
              risk_score: scanData.risk_score,
              findings: transformedResult.findings as any,
              user_id: session.user.id,
              completed_at: new Date().toISOString(),
              meta: {
                scanType: 'advanced',
                duration: transformedResult.scanDuration,
                stats: transformedResult.stats,
                scanned_urls: scanData.scanned_urls,
                statistics: scanData.statistics
              } as any
            })
            .select()
            .single();

          if (saveError) {
            console.error('Failed to save advanced scan to database:', saveError);
            toast({
              title: "Save Error",
              description: "Advanced scan completed but failed to save results",
              variant: "destructive"
            });
          } else {
            console.log('Advanced scan saved successfully:', savedScan);
          }
        }
      } catch (dbError) {
        console.error('Database save error for advanced scan:', dbError);
        toast({
          title: "Database Error",
          description: "Failed to save advanced scan results",
          variant: "destructive"
        });
      }

      setScanResult(transformedResult);
      setScanStage("Advanced scan complete!");
      
      toast({
        title: "Advanced Scan Complete",
        description: `Found ${transformedResult.findings.length} potential security issues.`,
      });
    } catch (error: any) {
      console.error('Advanced scan error:', error);
      toast({
        title: "Advanced Scan Failed",
        description: error.message || 'Failed to connect to advanced scanning service',
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanStage("");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-500';
      case 'High': return 'text-orange-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  {scanResult ? 'Scan Results' : 'Security Scan'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!scanResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protocol">Protocol</Label>
                    <Select value={protocol} onValueChange={setProtocol}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="https">https://</SelectItem>
                        <SelectItem value="http">http://</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="domain"
                        type="text"
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="pl-10"
                        disabled={isScanning}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-2">Basic Scan Includes:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Security headers analysis</li>
                      <li>• SSL/TLS configuration check</li>
                      <li>• Server fingerprinting</li>
                      <li>• JavaScript library vulnerability detection</li>
                      <li>• Basic HTML analysis</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-primary" />
                      Advanced Scan Includes:
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• XSS & SQL Injection detection</li>
                      <li>• CORS & Clickjacking analysis</li>
                      <li>• SSRF & Command Injection tests</li>
                      <li>• Authentication bypass checks</li>
                      <li>• Dependency vulnerability analysis</li>
                      <li>• Comprehensive penetration testing</li>
                    </ul>
                    <Button
                      onClick={handleAdvancedScan}
                      disabled={isScanning || !domain.trim()}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-primary/20 hover:bg-primary/10"
                    >
                      {isScanning ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                          <span>Advanced Scanning...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Zap className="h-3 w-3" />
                          <span>Run Advanced Scan</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleScan}
                  disabled={isScanning || !domain.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isScanning ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <Search className="h-4 w-4" />
                      <span>Scanning...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4" />
                      <span>Run Basic Scan</span>
                    </div>
                  )}
                </Button>
                {isScanning && (
                  <div className="mt-4 space-y-2">
                    <div className="bg-muted/20 border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm font-medium text-foreground">{scanStage}</span>
                        </div>
                        <span className="text-sm text-muted-foreground font-mono">{scanProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center">
                      Scan Summary
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${scanResult.scanType === 'advanced' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-white'}`}>
                        {scanResult.scanType.toUpperCase()}
                      </span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Risk Score:</span>
                      <span className={`font-bold text-lg ${getRiskScoreColor(scanResult.riskScore)}`}>
                        {scanResult.riskScore}/100
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Target: <span className="font-mono text-foreground">{scanResult.target}</span>
                  </p>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Duration: {Math.round(scanResult.scanDuration)}s</span>
                    <span>Found {scanResult.findings.length} security issues</span>
                  </div>
                  <div className="flex space-x-4 text-xs">
                    <span className="text-red-500">Critical: {scanResult.stats.critical}</span>
                    <span className="text-orange-500">High: {scanResult.stats.high}</span>
                    <span className="text-yellow-500">Medium: {scanResult.stats.medium}</span>
                    <span className="text-green-500">Low: {scanResult.stats.low}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">All Findings ({scanResult.findings.length}):</h4>
                  {scanResult.findings.map((finding) => (
                    <div key={finding.id} className="bg-muted/20 border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-foreground">{finding.title}</h5>
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            {finding.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {finding.cvss && (
                            <span className="text-xs text-muted-foreground">
                              CVSS: {finding.cvss}
                            </span>
                          )}
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                      {finding.evidence && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded font-mono">
                          {finding.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleDownloadReport} variant="default" className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download Full Report</span>
                  </Button>
                  <Button onClick={handleAdvancedScan} variant="outline" className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Run Advanced Scan</span>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanModal;