"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  LogOut,
  FileText,
  Plus,
  User as UserIcon,
  GitCompareArrowsIcon,
} from "lucide-react";
import RepositoriesModel from "@/components/RepositoriesModel";
import DocumentsModel from "@/components/DocumentsModel";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface AuthUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  email: string | null;
}

function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [open, setOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [isDocumentationLoading, setIsDocumentationLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          window.location.href = "/";
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          window.location.href = "/";
        }
      } catch {
        window.location.href = "/";
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore logout errors
    }
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm text-[#666]">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-15%] w-[45%] h-[45%] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/6">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4 md:px-12">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              DocGen<span className="text-purple-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* User avatar & info */}
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-8 w-8 rounded-full ring-2 ring-white/10"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <UserIcon className="h-4 w-4 text-white/60" />
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">
                  {user.name || user.username}
                </p>
                <p className="mt-0.5 text-xs text-[#666]">@{user.username}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              id="logout-button"
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-[#999] transition-all hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-12">
        {/* Welcome section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {user.name || user.username}
            </span>
          </h1>
          <p className="mt-2 text-[#666]">
            Generate AI-powered documentation for your GitHub repositories.
          </p>
        </div>

        {/* Quick action card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <button
          onClick={() => setOpen(true)}
            id="new-documentation-button"
            className="group rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] p-6 text-left transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-lg hover:shadow-purple-500/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 transition-transform duration-300 group-hover:scale-110">
              <Plus className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold">
              New Documentation
            </h3>
            <p className="mt-1 text-sm text-[#666]">
              Select a repository and generate comprehensive docs with AI.
            </p>
          </button>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05]">
              <GitCompareArrowsIcon className="h-6 w-6 text-[#888]" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Connected to GitHub</h3>
            <p className="mt-1 text-sm text-[#666]">
              Signed in as <span className="text-purple-400">@{user.username}</span>
            </p>
          </div>

          <button
            onClick={() => setDocumentsOpen(true)}
            className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-left transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] group-hover:bg-purple-500/20 transition-colors">
              <FileText className="h-6 w-6 text-[#888] group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="mt-4 text-base font-semibold">Your Documents</h3>
            <p className="mt-1 text-sm text-[#666]">
              View your previously generated documentation.
            </p>
          </button>
        </div>
      </main>
      
      <RepositoriesModel open={open} setOpen={setOpen} username={user.username} isDocumentationLoading={isDocumentationLoading} setIsDocumentationLoading={setIsDocumentationLoading} />
      <DocumentsModel open={documentsOpen} setOpen={setDocumentsOpen} />
    </div>
  );
}

export default Dashboard;
