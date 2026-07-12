"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";
import {
  AuthShell,
  Field,
  TextInput,
  SubmitButton,
  ErrorBanner,
} from "@/components/auth/ui";

function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/profile";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      toast.success(`Welcome back, ${identifier.trim()}!`);
      router.replace(next);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Login failed. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="PLAYER LOGIN"
      subtitle="Sign in with your username or Konami ID."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="go" style={{ fontWeight: 700 }}>
            Create an account →
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <ErrorBanner message={error} />
        <Field label="Username or Konami ID">
          <TextInput
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoFocus
          />
        </Field>
        <Field label="Password">
          <TextInput
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <SubmitButton loading={loading}>Sign In</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
