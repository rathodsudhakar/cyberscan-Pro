import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledScanConfig {
  user_id: string;
  target: string; 
  protocol: string;
  frequency: 'daily' | 'weekly';
  enabled: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Scheduled scan function started');

    // Get all active scheduled scan configurations
    const { data: scheduledScans, error: fetchError } = await supabase
      .from('scheduled_scans')
      .select('*')
      .eq('enabled', true);

    if (fetchError) {
      console.error('Error fetching scheduled scans:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${scheduledScans?.length || 0} scheduled scans`);

    const results = [];

    // Process each scheduled scan
    for (const config of scheduledScans || []) {
      try {
        console.log(`Processing scheduled scan for ${config.target}`);

        // Check if we should run this scan based on frequency
        const shouldRun = await shouldRunScan(supabase, config);
        
        if (!shouldRun) {
          console.log(`Skipping scan for ${config.target} - not due yet`);
          continue;
        }

        // Create new scan record
        const { data: scanData, error: scanError } = await supabase
          .from('scans')
          .insert({
            user_id: config.user_id,
            target: config.target,
            protocol: config.protocol,
            type: 'scheduled',
            status: 'running'
          })
          .select()
          .single();

        if (scanError) {
          console.error(`Error creating scan for ${config.target}:`, scanError);
          continue;
        }

        // Simulate scan execution with mock results
        const scanResult = await performMockScan(config.target);

        // Update scan with results
        const { error: updateError } = await supabase
          .from('scans')
          .update({
            status: 'completed',
            risk_score: scanResult.riskScore,
            findings: scanResult.findings,
            completed_at: new Date().toISOString(),
            meta: {
              scanType: 'scheduled',
              duration: scanResult.duration,
              stats: scanResult.stats,
              automated: true
            }
          })
          .eq('id', scanData.id);

        if (updateError) {
          console.error(`Error updating scan results for ${config.target}:`, updateError);
          continue;
        }

        console.log(`Completed scheduled scan for ${config.target}`);
        results.push({
          target: config.target,
          scanId: scanData.id,
          status: 'completed',
          riskScore: scanResult.riskScore
        });

      } catch (error) {
        console.error(`Error processing scan for ${config.target}:`, error);
        results.push({
          target: config.target,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log(`Processed ${results.length} scheduled scans`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Scheduled scan function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function shouldRunScan(supabase: any, config: ScheduledScanConfig): Promise<boolean> {
  // Get the last scan for this target and user
  const { data: lastScan } = await supabase
    .from('scans')
    .select('created_at')
    .eq('user_id', config.user_id)
    .eq('target', config.target)
    .eq('type', 'scheduled')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!lastScan) {
    return true; // No previous scan, run it
  }

  const lastScanDate = new Date(lastScan.created_at);
  const now = new Date();
  const timeDiff = now.getTime() - lastScanDate.getTime();
  const hoursDiff = timeDiff / (1000 * 3600);

  // Check frequency
  if (config.frequency === 'daily' && hoursDiff >= 24) {
    return true;
  } else if (config.frequency === 'weekly' && hoursDiff >= 168) { // 24 * 7
    return true;
  }

  return false;
}

async function performMockScan(target: string) {
  // Simulate scan duration
  const duration = Math.random() * 60 + 30; // 30-90 seconds

  // Generate mock findings based on common vulnerabilities
  const findings = [
    {
      id: "header-1",
      title: "Missing Security Headers",
      description: "Important security headers are not configured",
      severity: "Medium",
      category: "Client Security",
      evidence: "X-Frame-Options, X-Content-Type-Options headers missing",
      remediation: "Configure proper security headers"
    },
    {
      id: "tls-1", 
      title: "TLS Configuration",
      description: "SSL/TLS configuration analysis",
      severity: Math.random() > 0.5 ? "Low" : "Medium",
      category: "Server Security",
      evidence: "TLS version and cipher suite analysis completed",
      remediation: "Ensure latest TLS version is used"
    }
  ];

  // Add random critical/high severity findings occasionally
  if (Math.random() > 0.7) {
    findings.push({
      id: "vuln-critical",
      title: "Critical Vulnerability Detected",
      description: "A critical security vulnerability has been identified",
      severity: "Critical",
      category: "Web Application",
      evidence: "Automated scanner detected potential code execution vulnerability",
      remediation: "Immediate patching required"
    });
  }

  const stats = findings.reduce((acc, finding) => {
    const severity = finding.severity.toLowerCase();
    if (severity === 'critical') acc.critical++;
    else if (severity === 'high') acc.high++;
    else if (severity === 'medium') acc.medium++;
    else if (severity === 'low') acc.low++;
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });

  const riskScore = Math.min(100, 
    stats.critical * 25 + 
    stats.high * 15 + 
    stats.medium * 8 + 
    stats.low * 3
  );

  return {
    findings,
    riskScore,
    duration,
    stats
  };
}