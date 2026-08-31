"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight, Shield, Zap, FileText, GitCompareArrowsIcon } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          window.location.href = "/dashboard";
          return;
        }
      } catch {
        // Not authenticated, stay on login page
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const loginWithGithub = () => {
    setIsLoading(true);
    // Navigate the browser directly — the backend will redirect to GitHub OAuth
    window.location.href = `/api/auth/github`;
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-600/8 blur-[100px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            DocGen<span className="text-purple-400">AI</span>
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Hero text */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-purple-300 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              Generate docs
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                in seconds
              </span>
            </h1>
            <p className="text-[#8a8a9a] text-base md:text-lg max-w-sm mx-auto leading-relaxed">
              Connect your GitHub repositories and let AI create beautiful, comprehensive documentation automatically.
            </p>
          </div>

          {/* Login card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl shadow-purple-500/5">
            <button
              onClick={loginWithGithub}
              disabled={isLoading}
              id="github-login-button"
              className="group relative w-full flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-[#0a0a0f] transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GitCompareArrowsIcon className="h-5 w-5" />
              )}
              {isLoading ? "Redirecting to GitHub..." : "Continue with GitHub"}
              {!isLoading && (
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              )}
            </button>

            <p className="mt-4 text-center text-xs text-[#555] leading-relaxed">
              We&apos;ll access your repositories to generate documentation.
              <br />
              No code is stored on our servers.
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#666]">
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
              <Shield className="h-3 w-3 text-green-400" />
              Secure OAuth
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
              <Zap className="h-3 w-3 text-yellow-400" />
              Instant Setup
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
              <FileText className="h-3 w-3 text-blue-400" />
              Auto-Generated
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-[#444]">
        Built with AI · Powered by OpenRouter & GitHub
      </footer>
    </div>
  );
}

export default Auth;