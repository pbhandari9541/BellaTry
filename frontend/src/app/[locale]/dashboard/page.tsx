"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    router.replace("/auth");
    return null;
  }

  // Placeholder state for profile and looks
  const [profile, setProfile] = useState({ username: "", calendly: "" });
  const [looks, setLooks] = useState([]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">MUA Dashboard</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <div className="flex flex-col gap-2">
          <label>
            Username (for your try-on link):
            <input className="border p-2 rounded w-full" value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} />
          </label>
          <label>
            Calendly Link:
            <input className="border p-2 rounded w-full" value={profile.calendly} onChange={e => setProfile(p => ({ ...p, calendly: e.target.value }))} />
          </label>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upload Makeup Look</h2>
        <div className="border p-4 rounded bg-gray-50">[Upload form coming soon]</div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Your Looks</h2>
        <div className="border p-4 rounded bg-gray-50">[Looks list coming soon]</div>
      </section>
    </div>
  );
} 