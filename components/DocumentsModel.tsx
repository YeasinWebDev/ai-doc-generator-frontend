"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";


type Document = {
  id: string;
  repoUrl: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function DocumentsModel({
  open = false,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/documentation/user/documents`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await res.json();
        setDocuments(data?.documents || []);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [open]);

  const handleOpenDocument = (docId: string) => {
    setOpen(false);
    router.push(`/dashboard/documents/${docId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-[#0a0a0f] text-white border-white/8">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6" />
            Your Generated Documents
          </DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="p-4 text-center text-red-400 bg-red-500/10 rounded-lg">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-[#666]">
            No documents generated yet.
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-white/8 bg-white/2 p-4 hover:border-purple-500/30 group transition-colors cursor-pointer"
                onClick={() => handleOpenDocument(doc.id)}
              >
                <div>
                  <p className="font-semibold text-purple-100 group-hover:text-purple-400 transition-colors">
                    {doc.repoUrl.replace("https://github.com/", "")}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#555] mt-1">
                    <span>
                      Created {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#666] group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}