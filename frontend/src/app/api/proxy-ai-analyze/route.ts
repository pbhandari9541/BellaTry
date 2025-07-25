import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/api/core/endpoints';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  // Check for Bearer token in Authorization header
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!bearerToken) {
    console.log('[proxy-ai-analyze] No Bearer token found');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Validate JWT token with Supabase
  try {
    const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
    if (error || !user) {
      console.error('[proxy-ai-analyze] JWT validation failed:', error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    console.log('[proxy-ai-analyze] Authenticated user:', user.id);
  } catch (error) {
    console.error('[proxy-ai-analyze] JWT validation error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  const apiKey = process.env.X_API_KEY_PRIVATE;
  console.log('[proxy-ai-analyze] X_API_KEY_PRIVATE available:', !!apiKey);
  console.log('[proxy-ai-analyze] API key length:', apiKey?.length || 0);
  
  if (!apiKey) {
    console.error('[proxy-ai-analyze] X_API_KEY_PRIVATE not found in environment');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    
    // Get validated user from Supabase
    const { data: { user } } = await supabase.auth.getUser(bearerToken);
    if (user) {
      body.user_id = user.id;
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${API_ENDPOINTS.AI_ANALYZE}`;
    console.log(`[proxy-ai-analyze] Authenticated user (${user?.id}), sending request to backend with private key. URL: ${backendUrl}`);
    
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body),
    });

    console.log(`[proxy-ai-analyze] Backend response status: ${backendRes.status}`);
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    console.error('[proxy-ai-analyze] Proxy error:', err);
    return NextResponse.json({ error: err.message || 'Proxy error' }, { status: 500 });
  }
}

 