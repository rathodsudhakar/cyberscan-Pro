import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, 
  Download, 
  Filter, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ChevronDown,
  ArrowLeft,
  FileText,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Scan {
  id: string;
  target: string;
  type: string;
  status: string;
  risk_score: number;
  findings: any;
  created_at: string;
  completed_at?: string;
}

interface Vulnerability {
  severity: string;
  title: string;
  description: string;
  recommendation: string;
}

const Reports = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [filteredScans, setFilteredScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndFetchScans = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: scansData } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (scansData) {
        setScans(scansData);
        setFilteredScans(scansData);
      }

      setLoading(false);
    };

    checkAuthAndFetchScans();
  }, [navigate]);

  useEffect(() => {
    let filtered = scans;

    if (searchTerm) {
      filtered = filtered.filter(scan => 
        scan.target.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(scan => scan.status === statusFilter);
    }

    setFilteredScans(filtered);
  }, [scans, searchTerm, statusFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const downloadReport = async (scan: Scan) => {
    // Mock PDF generation
    const reportData = {
      target: scan.target,
      scanDate: new Date(scan.created_at).toLocaleDateString(),
      riskScore: scan.risk_score || 0,
      vulnerabilities: Array.isArray(scan.findings) ? scan.findings : [],
      status: scan.status
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${scan.target}-${scan.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: `Security report for ${scan.target} has been downloaded.`,
    });
  };

  const mockVulnerabilities: Vulnerability[] = [
    {
      severity: "High",
      title: "Missing Security Headers",
      description: "Critical security headers are not implemented, leaving the site vulnerable to XSS and clickjacking attacks.",
      recommendation: "Implement Content-Security-Policy, X-Frame-Options, and X-XSS-Protection headers."
    },
    {
      severity: "Medium", 
      title: "Outdated TLS Version",
      description: "The server supports TLS 1.1 which has known vulnerabilities.",
      recommendation: "Upgrade to TLS 1.3 and disable support for older versions."
    },
    {
      severity: "Low",
      title: "Information Disclosure",
      description: "Server headers reveal software versions that could aid attackers.",
      recommendation: "Configure the server to hide version information in HTTP headers."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-foreground">Loading reports...</span>
        </div>
      </div>
    );
  }

  if (selectedScan) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => setSelectedScan(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Button>
                <div className="h-6 w-px bg-border"></div>
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-semibold">Scan Report: {selectedScan.target}</h1>
              </div>
              <Button onClick={() => downloadReport(selectedScan)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Scan Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Scan Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Target</label>
                  <p className="text-lg font-semibold">{selectedScan.target}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Scan Date</label>
                  <p className="text-lg">{new Date(selectedScan.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Risk Score</label>
                  <p className={`text-lg font-bold ${getRiskScoreColor(selectedScan.risk_score || 0)}`}>
                    {selectedScan.risk_score || 0}/100
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(selectedScan.status)}>
                    {selectedScan.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Vulnerabilities Found</CardTitle>
              <CardDescription>
                {mockVulnerabilities.length} security issues identified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockVulnerabilities.map((vuln, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-border rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={getSeverityColor(vuln.severity)}>
                          {vuln.severity}
                        </Badge>
                        <h3 className="text-lg font-semibold">{vuln.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{vuln.description}</p>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Recommendation:</h4>
                      <p className="text-sm">{vuln.recommendation}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">Security Reports</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by target domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Reports</CardTitle>
            <CardDescription>
              View and download detailed security reports for your scans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredScans.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No reports found</h3>
                <p className="text-muted-foreground mb-4">
                  No scans match your current filters or you haven't run any scans yet.
                </p>
                <Button onClick={() => navigate('/')}>
                  Run Your First Scan
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Vulnerabilities</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell className="font-medium">{scan.target}</TableCell>
                      <TableCell>{scan.type}</TableCell>
                      <TableCell>{new Date(scan.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(scan.status)}>
                          {scan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={getRiskScoreColor(scan.risk_score || 0)}>
                          {scan.risk_score || 0}/100
                        </span>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(scan.findings) ? scan.findings.length : (scan.findings ? Object.keys(scan.findings).length : 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedScan(scan)}
                          >
                            View Details
                          </Button>
                          {scan.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadReport(scan)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;