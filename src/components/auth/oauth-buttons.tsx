"use client";

import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" focusable="false">
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.872h5.386a4.61 4.61 0 0 1-2.004 3.022v2.507h3.24c1.896-1.746 2.978-4.323 2.978-7.356Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.963-.895 6.617-2.418l-3.24-2.507c-.9.604-2.05.964-3.377.964-2.595 0-4.793-1.751-5.579-4.104H3.073v2.575A9.993 9.993 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.42 13.935A6.005 6.005 0 0 1 6.107 12c0-.672.116-1.323.313-1.935V7.49H3.073A9.996 9.996 0 0 0 2 12c0 1.61.385 3.135 1.073 4.51l3.347-2.575Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.468 0 2.785.505 3.82 1.496l2.864-2.863C16.959 2.983 14.696 2 12 2A9.993 9.993 0 0 0 3.073 7.49l3.347 2.575C7.206 7.711 9.404 5.96 12 5.96Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current" focusable="false">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.426 2.865 8.182 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.699-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.607.069-.607 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.089.635-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.651 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.295 2.748-1.026 2.748-1.026.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.337 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  );
}

export function OAuthButtons() {
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const next = searchParams.get("next") ?? "/";

  const handleSignIn = async (provider: "google" | "github") => {
    setPendingProvider(provider);
    await signIn(provider, { callbackUrl: next });
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={() => handleSignIn("google")}
        variant="outline"
        className="relative w-full justify-center"
        disabled={pendingProvider !== null}
      >
        <span className="pointer-events-none absolute left-4">
          {pendingProvider === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
        </span>
        <span>Continue with Google</span>
      </Button>
      <Button
        onClick={() => handleSignIn("github")}
        variant="outline"
        className="relative w-full justify-center"
        disabled={pendingProvider !== null}
      >
        <span className="pointer-events-none absolute left-4">
          {pendingProvider === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <GitHubIcon />
          )}
        </span>
        <span>Continue with GitHub</span>
      </Button>
    </div>
  );
}
