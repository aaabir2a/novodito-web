"use client";

// Own profile = the same full ProfileView as public profiles (FR-024…043),
// plus Edit / Dossier / Logout actions and the Following Feed (own-only).

import RequireAuth from "@/components/auth/RequireAuth";
import ProfileView from "@/components/profile/ProfileView";
import { useAuth } from "@/lib/auth-context";

function OwnProfile() {
  const { user } = useAuth();
  if (!user) return null; // RequireAuth guards; this is a type-narrowing fallback
  return (
    <div
      className="page act"
      style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem", paddingBottom: "5rem" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <ProfileView playerId={user.id} own />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <OwnProfile />
    </RequireAuth>
  );
}
