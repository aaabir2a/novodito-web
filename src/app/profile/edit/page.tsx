"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import RequireAuth from "@/components/auth/RequireAuth";
import { ApiError, type PlayerProfile, type ProfileUpdateInput } from "@/lib/api";
import {
  AuthShell,
  Field,
  TextInput,
  SelectInput,
  SubmitButton,
  ErrorBanner,
  SuccessBanner,
} from "@/components/auth/ui";

const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function EditForm({ user }: { user: PlayerProfile }) {
  const { updateProfile } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [form, setForm] = useState<ProfileUpdateInput>({
    legal_name: user.legal_name ?? "",
    hometown: user.hometown ?? "",
    birthday: user.birthday ?? "",
    blood_group: user.blood_group ?? "",
    facebook_url: user.facebook_url ?? "",
    discord_url: user.discord_url ?? "",
    konami_portal_url: user.konami_portal_url ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ProfileUpdateInput>(key: K, value: ProfileUpdateInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setLoading(true);
    try {
      // birthday: send null when cleared (backend allows null, rejects "").
      const payload: ProfileUpdateInput = {
        ...form,
        birthday: form.birthday ? form.birthday : null,
      };
      await updateProfile(payload);
      setOk("Profile updated.");
      toast.success("Profile updated successfully.");
      setLoading(false);
      setTimeout(() => router.push("/profile"), 700);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="EDIT PROFILE"
      subtitle="Update your public details. Role and verification are managed by staff."
      maxWidth={560}
      footer={
        <Link href="/profile" className="go" style={{ fontWeight: 700 }}>
          ← Back to profile
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <ErrorBanner message={error} />
        <SuccessBanner message={ok} />

        <Field label="Legal name">
          <TextInput
            value={form.legal_name ?? ""}
            onChange={(e) => set("legal_name", e.target.value)}
          />
        </Field>
        <Field label="Hometown">
          <TextInput
            value={form.hometown ?? ""}
            onChange={(e) => set("hometown", e.target.value)}
          />
        </Field>
        <Field label="Birthday">
          <TextInput
            type="date"
            value={form.birthday ?? ""}
            onChange={(e) => set("birthday", e.target.value)}
          />
        </Field>
        <Field label="Blood group">
          <SelectInput
            value={form.blood_group ?? ""}
            onChange={(e) => set("blood_group", e.target.value)}
          >
            {BLOOD_GROUPS.map((b) => (
              <option key={b || "none"} value={b}>
                {b || "— none —"}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Facebook URL" hint="Full URL (https://…)">
          <TextInput
            type="url"
            value={form.facebook_url ?? ""}
            onChange={(e) => set("facebook_url", e.target.value)}
            placeholder="https://facebook.com/you"
          />
        </Field>
        <Field label="Discord URL">
          <TextInput
            type="url"
            value={form.discord_url ?? ""}
            onChange={(e) => set("discord_url", e.target.value)}
            placeholder="https://discord.com/users/…"
          />
        </Field>
        <Field label="Konami portal URL">
          <TextInput
            type="url"
            value={form.konami_portal_url ?? ""}
            onChange={(e) => set("konami_portal_url", e.target.value)}
            placeholder="https://www.konami.com/efootball/…"
          />
        </Field>

        <SubmitButton loading={loading}>Save Changes</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ProfileEditPage() {
  return (
    <RequireAuth>
      <EditGate />
    </RequireAuth>
  );
}

function EditGate() {
  const { user } = useAuth();
  return <EditForm user={user!} />;
}
