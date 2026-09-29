import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://api.kilometria.com');
  const headers = new Headers(request.headers);
  headers.set('x-proxy-secret', process.env.TRUSTED_PROXY_SECRET!);
  // Vercel pisa x-real-ip con la IP real del cliente; el navegador no puede falsificarlo.
  headers.set('x-client-ip', request.headers.get('x-real-ip') ?? '');
  return NextResponse.rewrite(target, { request: { headers } });
}

export const config = { matcher: '/api/:path*' };