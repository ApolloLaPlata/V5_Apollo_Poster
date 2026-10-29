import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  const uptime = typeof process !== 'undefined' && typeof process.uptime === 'function' ? Math.round(process.uptime()) : 0;
  const memoryUsage = typeof process !== 'undefined' && typeof process.memoryUsage === 'function' ? process.memoryUsage().rss : 0;

  return NextResponse.json(
    {
      status: 'healthy',
      app: 'V5 Apollo Poster',
      domain: 'poster.v5apollo.com',
      port: ':3011',
      timestamp: new Date().toISOString(),
      uptime,
      memoryUsage,
    },
    {
      status: 200,
      headers: CORS_HEADERS,
    }
  );
}
