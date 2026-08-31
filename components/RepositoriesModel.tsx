"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Search, GitCompareArrowsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";


type Repository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
};

const ITEMS_PER_PAGE = 5;

export default function RepositoriesModel({
  open = false,
  setOpen,
  username,
  isDocumentationLoading,
  setIsDocumentationLoading
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  username: string;
  isDocumentationLoading: boolean;
  setIsDocumentationLoading: (isDocumentationLoading: boolean) => void;
}) {
  const [page, setPage] = useState(1);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!open) return;

    const fetchRepositories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          username,
          page: page.toString(),
          perPage: ITEMS_PER_PAGE.toString(),
          search: debouncedSearch,
        });

        const res = await fetch(
          `/api/documentation/?${queryParams.toString()}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch repositories");
        }

        const data = await res.json();
        setRepositories(data?.items);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepositories();
  }, [open, page, username, debouncedSearch]);

  // GitHub API doesn't return total count easily without extra calls,
  // so we'll just check if we received less than ITEMS_PER_PAGE to disable "Next"
  const hasMore = repositories.length === ITEMS_PER_PAGE;

  const handleGenerateDocumentation = async() => {
    setIsDocumentationLoading(true)
    const res = await fetch(`/api/documentation`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: selectedRepo?.html_url,
      }),
    });
    if(!res.ok){
      const data = await res.json();
      setError(data?.message || "Failed to generate documentation");
      setIsDocumentationLoading(false)
      return;
    }
    const data = await res.json();
    
    if(data.success && data.documentId){
      toast.success('Documentaion Generated Successfully');
      window.location.href = `/dashboard/documents/${data.documentId}`;
    }
    setIsDocumentationLoading(false)
    setOpen(false)
    setSelectedRepo(null)
    setSearch("")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => {
        if(isDocumentationLoading){
          toast.error("Please wait for the current documentation to finish generating")
          return;
        }
        setOpen(val)
        setSelectedRepo(null)
        setSearch("")
      }}>
        <DialogContent className="sm:max-w-150 bg-[#0a0a0f] text-white border-white/8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <GitCompareArrowsIcon className="w-6 h-6" />
              Select a Repository
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2  mb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                className="pl-9 bg-white/2 border-white/8 focus-visible:ring-purple-500 text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerateDocumentation} disabled={!selectedRepo || isDocumentationLoading} className="bg-purple-500 hover:bg-purple-600 text-white h-10">{isDocumentationLoading ? "Generating..." : "Generate Doc"}</Button>
          </div>

          {error ? (
            <div className="p-4 text-center text-red-400 bg-red-500/10 rounded-lg">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : repositories.length === 0 ? (
            <div className="text-center py-8 text-[#666]">
              No repositories found.
            </div>
          ) : (
            <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
              {repositories?.map((repo) => (
                <div
                  key={repo.id}
                  className={`flex flex-col rounded-lg border p-4 cursor-pointer transition-colors group
                      ${selectedRepo?.id === repo.id
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-white/8 bg-white/2 hover:border-purple-500/30"
                    }
  `}
                  onClick={() => setSelectedRepo(repo)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-purple-100 group-hover:text-purple-400 transition-colors">
                      {repo.name}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-[#999]">
                      {repo.language || "Unknown"}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="text-sm text-[#666] line-clamp-1 mb-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[#555]">
                    <span className="flex items-center gap-1">
                      ★ {repo.stargazers_count}
                    </span>
                    <span>
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
            <p className="text-sm text-[#666]">
              Page {page}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || isLoading}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="border-white/8 bg-white/2 hover:bg-white/5 text-white"
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore || isLoading}
                onClick={() => setPage((prev) => prev + 1)}
                className="border-white/8 bg-white/2 hover:bg-white/5 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}