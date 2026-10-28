import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const uptime = typeof process !== 'undefined' && typeof process.uptime === 'function' ? process.uptime() : 0;
  const memoryUsage = typeof process !== 'undefined' && typeof process.memoryUsage === 'function' ? process.memoryUsage().rss : 0;

  return NextResponse.json({
    status: 'healthy',
    app: 'V5 Apollo Poster',
    timestamp: new Date().toISOString(),
    uptime,
    memoryUsage
  });
}
