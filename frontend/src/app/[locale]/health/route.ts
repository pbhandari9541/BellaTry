import { NextResponse } from 'next/server';
import os from 'os';

const startTime = Date.now();

interface SystemError extends Error {
  code?: string;
  syscall?: string;
}

export async function GET() {
  try {
    // Basic system metrics
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
    const cpuUsage = os.loadavg()[0]; // 1 minute load average

    // Check if we can reach the backend
    let backendStatus = 'UNKNOWN';
    try {
      const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      backendStatus = backendRes.ok ? 'UP' : 'DOWN';
    } catch (error) {
      backendStatus = 'DOWN';
    }

    return NextResponse.json({
      status: 'UP',
      uptime,
      memory_usage: memoryUsage.toFixed(2),
      cpu_load: cpuUsage.toFixed(2),
      backend_status: backendStatus,
    });
  } catch (error: unknown) {
    const err = error as SystemError;
    return NextResponse.json(
      { status: 'DOWN', error: err?.message || 'Unknown error' },
      { status: 503 }
    );
  }
} 