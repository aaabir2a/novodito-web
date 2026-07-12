"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { ApiError, type ConsoleType, type DeviceType } from "@/lib/api";
import {
  AuthShell,
  Field,
  TextInput,
  SelectInput,
  SubmitButton,
  ErrorBanner,
} from "@/components/auth/ui";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,50}$/;

// Mirror of the backend password policy so users get instant feedback.
function passwordProblems(pw: string, username: string): string[] {
  const out: string[] = [];
  if (pw.length < 8) out.push("at least 8 characters");
  if (/^\d+$/.test(pw)) out.push("not entirely numeric");
  if (username && pw.toLowerCase().includes(username.toLowerCase()) && username.length >= 3)
    out.push("not too similar to your username");
  return out;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deviceType, setDeviceType] = useState<DeviceType>("mobile");
  const [consoleType, setConsoleType] = useState<ConsoleType>("PS5");
  const [konamiId, setKonamiId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameOk = username === "" || USERNAME_RE.test(username);
  const pwProblems = useMemo(
    () => (password ? passwordProblems(password, username) : []),
    [password, username],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!USERNAME_RE.test(username)) {
      setError("Username must be 3–50 characters: letters, digits, underscore.");
      return;
    }
    if (pwProblems.length) {
      setError(`Password must be ${pwProblems.join(", ")}.`);
      return;
    }

    setLoading(true);
    try {
      await register({
        username: username.trim(),
        password,
        device_type: deviceType,
        ...(deviceType === "console" ? { console_type: consoleType } : {}),
        ...(konamiId.trim() ? { konami_id: konamiId.trim() } : {}),
      });
      toast.success(`Account created — welcome, ${username.trim()}!`);
      router.replace("/profile");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Registration failed. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="CREATE ACCOUNT"
      subtitle="Join the 2026 season. It only takes a moment."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="go" style={{ fontWeight: 700 }}>
            Sign in →
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <ErrorBanner message={error} />

        <Field
          label="Username"
          hint={
            !usernameOk
              ? "3–50 characters: letters, digits, underscore only."
              : "This is your public handle."
          }
        >
          <TextInput
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            style={!usernameOk ? { borderColor: "rgba(255,80,80,.6)" } : undefined}
          />
        </Field>

        <Field
          label="Password"
          hint={
            pwProblems.length
              ? `Needs: ${pwProblems.join(", ")}.`
              : "Min 8 chars, not all numbers, not a common password."
          }
        >
          <TextInput
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field label="Device">
          <SelectInput
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as DeviceType)}
          >
            <option value="mobile">Mobile</option>
            <option value="console">Console</option>
          </SelectInput>
        </Field>

        {deviceType === "console" ? (
          <Field label="Console type">
            <SelectInput
              value={consoleType}
              onChange={(e) => setConsoleType(e.target.value as ConsoleType)}
            >
              <option value="PS5">PS5</option>
              <option value="PS4">PS4</option>
              <option value="PC">PC</option>
            </SelectInput>
          </Field>
        ) : null}

        <Field label="Konami ID" hint="Optional — you can link this later.">
          <TextInput
            name="konami_id"
            value={konamiId}
            onChange={(e) => setKonamiId(e.target.value)}
            placeholder="e.g. 1234-5678-9012"
          />
        </Field>

        <SubmitButton loading={loading}>Create Account</SubmitButton>
      </form>
    </AuthShell>
  );
}
