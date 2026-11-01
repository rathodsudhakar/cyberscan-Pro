import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, LogOut, Bell, Settings, Search, Activity, AlertTriangle, CheckCircle, Clock, Download, TrendingUp, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface User {
  id: string;
  name: string;
  email: string;
}

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

interface ScheduledScan {
  id: string;
  target: string;
  protocol: string;
  frequency: string; // Changed from union type to string to match database
  enabled: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TrendData {
  week: string;
  scans: number;
  vulnerabilities: number;
  riskScore: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [scheduledScans, setScheduledScans] = useState<ScheduledScan[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [backendStats, setBackendStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newScheduledScan, setNewScheduledScan] = useState({
    target: '',
    protocol: 'https',
    frequency: 'weekly' as string
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profile) {
        setUser({
          id: profile.user_id,
          name: profile.name || session.user.email?.split('@')[0] || 'User',
          email: profile.email || session.user.email || ''
        });
      }

      // Fetch user's scans from Supabase
      try {
        // Fetch user's scans from Supabase
        const { data: scansData, error: scansError } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (scansError) {
          console.error('Error fetching scans:', scansError);
          throw scansError;
        }

        // Transform Supabase data to frontend format
        const transformedScans = (scansData || []).map((scan: any) => ({
          id: scan.id,
          target: scan.target,
          type: scan.type || 'basic',
          status: scan.status || 'completed',
          risk_score: scan.risk_score || 0,
          findings: scan.findings || [],
          created_at: scan.created_at,
          completed_at: scan.completed_at
        }));

        setScans(transformedScans);

        // Fetch scheduled scans from Supabase
        const { data: scheduledScansData, error: scheduledError } = await supabase
          .from('scheduled_scans')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (scheduledError) {
          console.error('Error fetching scheduled scans:', scheduledError);
        } else {
          const transformedScheduledScans = (scheduledScansData || []).map((scan: any) => ({
            id: scan.id,
            target: scan.target,
            protocol: scan.protocol || 'https',
            frequency: scan.frequency,
            enabled: scan.enabled,
            user_id: session.user.id,
            created_at: scan.created_at,
            updated_at: scan.updated_at
          }));

          setScheduledScans(transformedScheduledScans);
        }

        // Generate trend data from user's actual scans
        generateTrendData(transformedScans);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: "Dashboard Error",
          description: "Failed to load your scan data",
          variant: "destructive"
        });
      }

      setLoading(false);
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const generateTrendData = (scansData: Scan[]) => {
    const weeks = [];
    const now = new Date();
    
    // Generate last 8 weeks of data
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      const weekScans = scansData.filter(scan => {
        const scanDate = new Date(scan.created_at);
        return scanDate >= weekStart && scanDate < weekEnd;
      });

      const totalVulns = weekScans.reduce((acc, scan) => 
        acc + (Array.isArray(scan.findings) ? scan.findings.length : 0), 0
      );
      
      const avgRiskScore = weekScans.length > 0 
        ? weekScans.reduce((acc, scan) => acc + (scan.risk_score || 0), 0) / weekScans.length
        : 0;

      weeks.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        scans: weekScans.length,
        vulnerabilities: totalVulns,
        riskScore: Math.round(avgRiskScore)
      });
    }
    
    setTrendData(weeks);
  };

  const createScheduledScan = async () => {
    if (!newScheduledScan.target) {
      toast({
        title: "Target Required",
        description: "Please enter a target URL for scheduled scanning.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('scheduled_scans')
        .insert({
          target: newScheduledScan.target,
          protocol: newScheduledScan.protocol,
          frequency: newScheduledScan.frequency,
          enabled: true,
          user_id: session.user.id
        });

      if (error) throw error;

      toast({
        title: "Scheduled Scan Created",
        description: `${newScheduledScan.frequency} scans scheduled for ${newScheduledScan.target}`,
      });

      setShowScheduleModal(false);
      setNewScheduledScan({ target: '', protocol: 'https', frequency: 'weekly' });
      
      // Refresh scheduled scans
      const { data: scheduledScansData } = await supabase
        .from('scheduled_scans')
        .select('*')
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id);

      if (scheduledScansData) {
        setScheduledScans(scheduledScansData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleScheduledScan = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .update({ enabled })
        .eq('id', id);

      if (error) throw error;

      setScheduledScans(prev => 
        prev.map(scan => scan.id === id ? { ...scan, enabled } : scan)
      );

      toast({
        title: enabled ? "Scheduled Scan Enabled" : "Scheduled Scan Disabled",
        description: `Automated scanning has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDownloadReport = async (scan: Scan) => {
    try {
      // Transform scan data to backend format
      const vulnerabilities: { [key: string]: { [key: string]: any } } = {};
      
      // Convert findings array to vulnerabilities object structure
      if (scan.findings && Array.isArray(scan.findings)) {
        scan.findings.forEach((finding: any) => {
          const url = scan.target; // Use the scan target as the URL key
          if (!vulnerabilities[url]) {
            vulnerabilities[url] = {};
          }
          vulnerabilities[url][finding.title || 'Unknown'] = {
            severity: finding.severity || 'Unknown',
            description: finding.description || 'No description available',
            recommendation: finding.recommendation || 'No recommendation available'
          };
        });
      }
      
      const scanResults = {
        target_url: scan.target,
        scanned_urls: [scan.target], // Use the actual scan target
        vulnerabilities: vulnerabilities,
        risk_score: scan.risk_score || 0,
        scan_date: scan.completed_at || new Date().toISOString(),
        status: scan.status
      };

      const response = await fetch('http://localhost:5000/api/download-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scan_results: scanResults })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${scan.target.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Report Downloaded",
          description: "Security report has been downloaded successfully.",
        });
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || 'Failed to download security report',
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Use real backend stats if available, otherwise fall back to calculated values
  const totalScans = backendStats?.totalScans || scans.length;
  const completedScans = scans.filter(s => s.status === 'completed').length;
  const totalVulnerabilities = backendStats ? 
    (backendStats.criticalVulns + backendStats.highVulns + backendStats.mediumVulns + backendStats.lowVulns) :
    scans.reduce((acc, scan) => acc + (Array.isArray(scan.findings) ? scan.findings.length : 0), 0);
  const avgRiskScore = backendStats?.avgRiskScore || 
    (completedScans > 0 ? Math.round(scans.filter(s => s.status === 'completed').reduce((acc, s) => acc + (s.risk_score || 0), 0) / completedScans) : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                CyberScan Pro
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{user?.name}</span>
              </span>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
              <p className="text-xs text-muted-foreground">
                {completedScans} completed, {scheduledScans.filter(s => s.enabled).length} scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vulnerabilities Found</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVulnerabilities}</div>
              <p className="text-xs text-muted-foreground">
                Across all scans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Risk Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgRiskScore}
              </div>
              <p className="text-xs text-muted-foreground">
                Risk assessment average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {Math.max(0, 100 - avgRiskScore)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall security rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trends Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Security Trends (Last 8 Weeks)</CardTitle>
            <CardDescription>
              Track your security scanning progress and vulnerability patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {trendData.reduce((acc, week) => acc + week.scans, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vulnerabilities</p>
                  <p className="text-2xl font-bold text-red-600">
                    {trendData.reduce((acc, week) => acc + week.vulnerabilities, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {trendData.length > 0 
                      ? Math.round(trendData.reduce((acc, week) => acc + week.riskScore, 0) / trendData.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
              
              {/* Simple trend visualization */}
              <div className="h-32 flex items-end space-x-2">
                {trendData.map((week, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary/20 rounded-t-sm"
                      style={{ 
                        height: `${Math.max(8, (week.scans / Math.max(...trendData.map(w => w.scans), 1)) * 100)}px` 
                      }}
                    ></div>
                    <div 
                      className="w-full bg-red-500/30 rounded-b-sm"
                      style={{ 
                        height: `${Math.max(4, (week.vulnerabilities / Math.max(...trendData.map(w => w.vulnerabilities), 1)) * 50)}px` 
                      }}
                    ></div>
                    <span className="text-xs text-muted-foreground mt-2">{week.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Scans */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scheduled Scans</CardTitle>
                <CardDescription>
                  Automated security scans that run on your schedule
                </CardDescription>
              </div>
              <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Scan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Automated Scan</DialogTitle>
                    <DialogDescription>
                      Set up automatic security scans for your websites
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="target">Target URL</Label>
                      <Input
                        id="target"
                        placeholder="https://example.com"
                        value={newScheduledScan.target}
                        onChange={(e) => setNewScheduledScan(prev => ({ ...prev, target: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="protocol">Protocol</Label>
                      <Select 
                        value={newScheduledScan.protocol} 
                        onValueChange={(value) => setNewScheduledScan(prev => ({ ...prev, protocol: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="https">HTTPS</SelectItem>
                          <SelectItem value="http">HTTP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select 
                        value={newScheduledScan.frequency} 
                        onValueChange={(value: string) => setNewScheduledScan(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={createScheduledScan} className="w-full">
                      Create Scheduled Scan
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {scheduledScans.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No scheduled scans</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automated scans to continuously monitor your websites
                </p>
                <Button onClick={() => setShowScheduleModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Scan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledScans.map((scheduledScan) => (
                  <div key={scheduledScan.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">{scheduledScan.target}</h4>
                      <p className="text-sm text-muted-foreground">
                        {scheduledScan.frequency} • {scheduledScan.protocol}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={scheduledScan.enabled}
                        onCheckedChange={(enabled) => toggleScheduledScan(scheduledScan.id, enabled)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {scheduledScan.enabled ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>
              View your latest security scans and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scans.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No scans yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by running your first security scan from the landing page.
                </p>
                <Button onClick={() => navigate('/')}>
                  Go to Scanner
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scans.slice(0, 5).map((scan) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(scan.status)}/20`}>
                        <div className={`${getStatusColor(scan.status)} text-white rounded-full p-1`}>
                          {getStatusIcon(scan.status)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{scan.target}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{scan.type} scan</span>
                          <span>•</span>
                          <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                          {scan.completed_at && (
                            <>
                              <span>•</span>
                              <span className={getRiskScoreColor(scan.risk_score || 0)}>
                                Risk: {scan.risk_score || 0}/100
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`${getStatusColor(scan.status)} text-white`}>
                        {scan.status}
                      </Badge>
                      {scan.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadReport(scan)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Threat Intelligence Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Insights</CardTitle>
              <CardDescription>
                Latest cybersecurity trends and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-foreground">CVE-2023-44487</h4>
                <p className="text-sm text-muted-foreground">
                  HTTP/2 Rapid Reset vulnerability affects major web servers
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-foreground">Security Headers</h4>
                <p className="text-sm text-muted-foreground">
                  Implement Content Security Policy to prevent XSS attacks
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-medium text-foreground">TLS 1.3</h4>
                <p className="text-sm text-muted-foreground">
                  Upgrade to TLS 1.3 for improved security and performance
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common security tasks and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/')}>
                <Search className="h-4 w-4 mr-2" />
                Scan New Site
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/reports')}>
                <Download className="h-4 w-4 mr-2" />
                View Past Reports
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                User Profile
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Bell className="h-4 w-4 mr-2" />
                Upgrade Plan (Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;