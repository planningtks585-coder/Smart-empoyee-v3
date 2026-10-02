import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { SystemMetrics } from './types';

class MonitoringService {
  private startTime = Date.now();
  private totalRequests = 0;
  private requestsByMethod: Record<string, number> = {};
  private statusCodes: Record<string, number> = {};
  private latencies: number[] = [];
  private maxLatenciesRecorded = 200;

  public requestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    this.totalRequests++;
    this.requestsByMethod[req.method] = (this.requestsByMethod[req.method] || 0) + 1;

    res.on('finish', () => {
      const diff = process.hrtime(start);
      const latencyMs = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;

      const codeKey = `${Math.floor(res.statusCode / 100)}xx`;
      this.statusCodes[codeKey] = (this.statusCodes[codeKey] || 0) + 1;
      this.statusCodes[res.statusCode] = (this.statusCodes[res.statusCode] || 0) + 1;

      this.latencies.push(latencyMs);
      if (this.latencies.length > this.maxLatenciesRecorded) {
        this.latencies.shift();
      }
    });

    next();
  };

  public getMetrics(): SystemMetrics {
    const mem = process.memoryUsage();
    const raw = db.getRaw();
    const avgLatency =
      this.latencies.length > 0
        ? Math.round((this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length) * 100) / 100
        : 0;

    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      totalRequests: this.totalRequests,
      activeSessions: raw.userAccounts.length,
      requestsByMethod: { ...this.requestsByMethod },
      statusCodes: { ...this.statusCodes },
      averageLatencyMs: avgLatency,
      memoryUsage: {
        rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
      },
      recordCounts: {
        employees: raw.employees.length,
        attendance: raw.attendanceRecords.length,
        projects: raw.projects.length,
        tasks: raw.tasks.length,
        shifts: raw.shifts.length,
        leaves: raw.leaveRequests.length,
        deals: raw.deals.length,
        accounts: raw.userAccounts.length
      }
    };
  }

  public getHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: string;
    version: string;
    database: {
      status: string;
      lastSaved: string;
      recordCount: number;
    };
    checks: Record<string, { status: string; latencyMs?: number }>;
  } {
    const raw = db.getRaw();
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;

    const totalRecords =
      raw.employees.length +
      raw.attendanceRecords.length +
      raw.projects.length +
      raw.tasks.length +
      raw.shifts.length +
      raw.leaveRequests.length +
      raw.deals.length +
      raw.userAccounts.length;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${hours}h ${minutes}m ${seconds}s`,
      version: raw.metadata.version,
      database: {
        status: 'connected',
        lastSaved: raw.metadata.lastSavedAt,
        recordCount: totalRecords
      },
      checks: {
        databaseFile: { status: 'healthy' },
        authEngine: { status: 'operational' },
        telegramDispatcher: { status: raw.telegramSettings.enabled ? 'enabled' : 'disabled' },
        reportsEngine: { status: 'operational' }
      }
    };
  }
}

export const monitor = new MonitoringService();
