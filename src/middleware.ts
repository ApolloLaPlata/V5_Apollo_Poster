import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

// Rate limiter em memória para proteção da API e despachos
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. CORS Pre-flight
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  // 2. Rate Limiting em rotas de API
  if (pathname.startsWith('/api')) {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = (forwarded ? forwarded.split(',')[0].trim() : realIp?.trim()) || '127.0.0.1';

    const now = Date.now();
    const rateKey = `${ip}:poster_api`;
    const record = ipRateMap.get(rateKey);

    if (!record || now >= record.resetAt) {
      ipRateMap.set(rateKey, { count: 1, resetAt: now + 60000 });
    } else {
      record.count++;
      if (record.count > 60) {
        return NextResponse.json(
          {
            success: false,
            error: 'Limite de requisições excedido. Aguarde alguns instantes.',
            code: 'POSTER_RATE_LIMIT_EXCEEDED',
            retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((record.resetAt - now) / 1000).toString(),
              'X-Shield': 'v5-poster-rate-limiter-v1',
            },
          }
        );
      }
    }
  }

  // 3. Injeção de Cabeçalhos de Segurança OWASP
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}
