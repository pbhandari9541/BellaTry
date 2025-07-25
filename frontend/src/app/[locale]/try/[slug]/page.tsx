"use client";
import React from "react";
import { useParams } from "next/navigation";

export default function TryOnPage() {
  const params = useParams();
  const slug = params?.slug;

  // Placeholder for fetching MUA and looks by slug
  // TODO: Fetch from Supabase

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Try On Looks by {slug}</h1>
      <div className="border p-4 rounded bg-gray-50 mb-6">[Virtual try-on coming soon]</div>
      <a href="#" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">Book Now</a>
    </div>
  );
} 