export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Marketing Landmark Workforce Management API',
    description: 'Comprehensive headless RESTful backend for employee time tracking, shift scheduling, project & task billing, payroll reports, and Telegram alerts.',
    version: '2.0.0-fullstack',
    contact: {
      name: 'Workforce API Support',
      email: 'admin@marketinglandmark.com'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Primary Backend API Server'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'System Health Check',
        description: 'Returns health status of database, background workers, and system uptime.',
        responses: {
          '200': { description: 'System is operational' }
        }
      }
    },
    '/metrics': {
      get: {
        summary: 'System Performance & Resource Metrics',
        description: 'Returns memory consumption, active records count, and request latencies.',
        responses: {
          '200': { description: 'Metrics payload' }
        }
      }
    },
    '/tests/run': {
      get: {
        summary: 'Run Headless Backend Self-Tests',
        description: 'Executes automated server-side verification test suites and returns results.',
        responses: {
          '200': { description: 'Test suite execution report' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate User with Phone and Password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  phone: { type: 'string', example: '+85512888999' },
                  password: { type: 'string', example: 'password123' }
                },
                required: ['phone', 'password']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Authentication token and user object' },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/projects': {
      get: {
        summary: 'List All Projects',
        responses: { '200': { description: 'Array of projects' } }
      },
      post: {
        summary: 'Create a New Project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  client: { type: 'string' },
                  budget: { type: 'number' },
                  billableRate: { type: 'number' },
                  dueDate: { type: 'string' },
                  priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low'] }
                },
                required: ['name', 'client', 'budget']
              }
            }
          }
        },
        responses: { '201': { description: 'Project created' } }
      }
    },
    '/tasks': {
      get: {
        summary: 'List All Tasks',
        responses: { '200': { description: 'Array of tasks' } }
      },
      post: {
        summary: 'Create a New Task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  projectId: { type: 'string' },
                  title: { type: 'string' },
                  assignedTo: { type: 'string' },
                  estimatedHours: { type: 'number' },
                  billable: { type: 'boolean' }
                },
                required: ['projectId', 'title']
              }
            }
          }
        },
        responses: { '201': { description: 'Task created' } }
      }
    },
    '/attendance/clock-in': {
      post: {
        summary: 'Punch Clock In',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  location: { type: 'string' },
                  shiftType: { type: 'string', enum: ['morning', 'evening'] },
                  employeeId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Clock in punch accepted' } }
      }
    },
    '/attendance/clock-out': {
      post: {
        summary: 'Punch Clock Out',
        responses: { '200': { description: 'Clock out recorded' } }
      }
    },
    '/reports/export/{reportType}': {
      get: {
        summary: 'Export Payroll, Overtime, or Timesheet Reports',
        parameters: [
          {
            name: 'reportType',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['attendance', 'payroll', 'overtime', 'late'] }
          },
          {
            name: 'format',
            in: 'query',
            schema: { type: 'string', enum: ['json', 'csv'], default: 'json' }
          }
        ],
        responses: { '200': { description: 'Export report data' } }
      }
    }
  }
};

export function renderApiDocsHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Marketing Landmark - Headless Backend API Explorer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card: #111827;
      --card-border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #3b82f6;
      --accent-glow: rgba(59, 130, 246, 0.25);
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 2rem 1rem;
      min-height: 100vh;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 2rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); display: inline-block; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 1rem;
      padding: 1.25rem;
    }
    .card h3 { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .card .val { font-size: 1.5rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
    .btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 0.75rem;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .endpoints { display: flex; flex-direction: column; gap: 0.75rem; }
    .endpoint {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 0.85rem;
      overflow: hidden;
    }
    .endpoint-header {
      padding: 0.85rem 1.2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .method {
      padding: 0.2rem 0.5rem;
      border-radius: 0.4rem;
      font-weight: 800;
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
    }
    .method.GET { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .method.POST { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .method.PUT { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .method.DELETE { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .path { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #e5e7eb; }
    .desc { color: var(--text-muted); font-size: 0.8rem; }
    .test-box {
      margin-top: 1.5rem;
      background: #0d1322;
      border: 1px solid var(--card-border);
      border-radius: 1rem;
      padding: 1.25rem;
    }
    pre {
      background: #050811;
      padding: 1rem;
      border-radius: 0.6rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #93c5fd;
      overflow-x: auto;
      margin-top: 0.75rem;
      max-height: 300px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
          <span class="status-dot"></span>
          <span class="badge">Headless Backend Architecture</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">v2.0.0-fullstack</span>
        </div>
        <h1 style="font-size:1.6rem; font-weight:800;">Marketing Landmark RESTful API</h1>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">
          Server-authoritative workforce backend for time tracking, punch ledgers, projects, and reporting.
        </p>
      </div>

      <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
        <button class="btn" onclick="runTests()">Run Automated Self-Tests</button>
        <a href="/api/openapi.json" target="_blank" class="btn" style="background:#1e293b; color:#94a3b8; text-decoration:none;">OpenAPI JSON</a>
        <a href="/" class="btn" style="background:#1e293b; color:#94a3b8; text-decoration:none;">Open UI App</a>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Server Status</h3>
        <div class="val" id="srv-status" style="color:var(--success);">ONLINE</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;" id="srv-uptime">Loading uptime...</div>
      </div>
      <div class="card">
        <h3>Total Requests Handled</h3>
        <div class="val" id="srv-requests">0</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">All endpoints combined</div>
      </div>
      <div class="card">
        <h3>Database Records</h3>
        <div class="val" id="srv-records">0</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">Persistent JSON Store</div>
      </div>
      <div class="card">
        <h3>Memory Consumption</h3>
        <div class="val" id="srv-memory">0 MB</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">Node.js Heap Used</div>
      </div>
    </div>

    <!-- Live Test Results Box -->
    <div class="test-box" id="test-runner-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="font-size:1rem; font-weight:700;">Backend Self-Test Suite Runner</h2>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
            Executes 6 backend verification suites (Database, Auth, Attendance, Projects/Tasks, Leave, Shifts).
          </p>
        </div>
        <button class="btn" style="padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="runTests()">Execute Tests</button>
      </div>
      <div id="test-output">
        <pre id="test-pre">// Click "Execute Tests" or "Run Automated Self-Tests" to run server-side verification.</pre>
      </div>
    </div>

    <div style="margin-top: 2rem;">
      <h2 style="font-size:1.1rem; font-weight:800; margin-bottom:1rem;">API Endpoints Directory</h2>
      <div class="endpoints">
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method GET">GET</span> <span class="path">/api/health</span></div>
            <div class="desc">System health, background jobs, database connection</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method GET">GET</span> <span class="path">/api/metrics</span></div>
            <div class="desc">Performance latencies, request throughput, memory usage</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method GET">GET</span> <span class="path">/api/tests/run</span></div>
            <div class="desc">Execute automated backend test suite headlessly</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method POST">POST</span> <span class="path">/api/auth/login</span></div>
            <div class="desc">Authenticate with phone & password, obtain Bearer token</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method GET">GET</span> <span class="path">/api/state</span></div>
            <div class="desc">Complete workspace state snapshot (All collections)</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method POST">POST</span> <span class="path">/api/attendance/clock-in</span></div>
            <div class="desc">Record live punch in with location & shift type</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method POST">POST</span> <span class="path">/api/attendance/clock-out</span></div>
            <div class="desc">Record punch out, compute elapsed duration & overtime</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method POST">POST</span> <span class="path">/api/projects</span></div>
            <div class="desc">Create new client project with budget & owner</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method POST">POST</span> <span class="path">/api/tasks</span></div>
            <div class="desc">Create new task under project with estimated hours</div>
          </div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <div><span class="method GET">GET</span> <span class="path">/api/reports/export/:reportType?format=csv</span></div>
            <div class="desc">Export payroll, attendance, or overtime as CSV/JSON</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function loadStats() {
      try {
        const [healthRes, metricsRes] = await Promise.all([
          fetch('/api/health').then(r => r.json()),
          fetch('/api/metrics').then(r => r.json())
        ]);

        document.getElementById('srv-uptime').innerText = 'Uptime: ' + healthRes.uptime;
        document.getElementById('srv-requests').innerText = metricsRes.totalRequests;
        document.getElementById('srv-records').innerText = healthRes.database.recordCount;
        document.getElementById('srv-memory').innerText = metricsRes.memoryUsage.heapUsedMb + ' MB';
      } catch (err) {
        console.error('Stats load error:', err);
      }
    }

    async function runTests() {
      const pre = document.getElementById('test-pre');
      pre.innerText = 'Executing server-side test suites... please wait...';
      try {
        const res = await fetch('/api/tests/run');
        const data = await res.json();
        pre.innerText = JSON.stringify(data, null, 2);
        loadStats();
      } catch (err) {
        pre.innerText = 'Test run failed: ' + err.message;
      }
    }

    loadStats();
    setInterval(loadStats, 5000);
  </script>
</body>
</html>`;
}
