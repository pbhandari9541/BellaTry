import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export const runtime = "edge"; // Ensure streaming support

export async function POST(req: NextRequest) {
  // Validate bearer token (same logic as proxy-ai-analyze)
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!bearerToken) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate JWT token with Supabase
  try {
    const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
    if (error || !user) {
      console.error("[proxy-ai-stream] JWT validation failed:", error);
      return new Response(JSON.stringify({ error: "Invalid authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("[proxy-ai-stream] Authenticated user:", user.id);
  } catch (error) {
    console.error("[proxy-ai-stream] JWT validation error:", error);
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.X_API_KEY_PRIVATE;
  console.log("[proxy-ai-stream] X_API_KEY_PRIVATE available:", !!apiKey);
  console.log("[proxy-ai-stream] API key length:", apiKey?.length || 0);
  
  if (!apiKey) {
    console.error("[proxy-ai-stream] X_API_KEY_PRIVATE not found in environment");
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/ai/stream`;

  // Proxy fetch with stream enabled
  const backendRes = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: req.body,
  });

  // Relay SSE headers
  const headers = new Headers(backendRes.headers);
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(backendRes.body, {
    status: backendRes.status,
    headers,
  });
} 