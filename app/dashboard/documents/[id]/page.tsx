"use client";

import { ReactNode, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function DocumentView() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedFullDoc, setCopiedFullDoc] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/documentation/${params.id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch document");
        }

        const data = await res.json();
        if (data.success) {
          setDocument(data.document);
        } else {
          toast.error("Document not found");
          router.push("/dashboard");
        }
      } catch (error) {
        toast.error("Failed to load document");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchDocument();
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm text-[#666]">Loading documentation...</p>
        </div>
      </div>
    );
  }

  const extractText = (node: any): string => {
    if (typeof node === "string") {
      return node;
    }

    if (Array.isArray(node)) {
      return node.map(extractText).join("");
    }

    if (node?.props?.children) {
      return extractText(node.props.children);
    }

    return "";
  };

  const copyFullDocumentation = async () => {
    if (!document?.documentation) return;

    try {
      await navigator.clipboard.writeText(document.documentation);

      setCopiedFullDoc(true);

      setTimeout(() => {
        setCopiedFullDoc(false);
      }, 2000);

      toast.success("Documentation copied!");
    } catch (error) {
      toast.error("Failed to copy documentation");
    }
  };

  if (!document) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-15%] w-[45%] h-[45%] rounded-full bg-purple-600/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <nav className="z-10 border-b border-white/6 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">

          {/* Left */}
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="shrink-0 text-[#999] hover:bg-white/5 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-purple-400" />

              <span className="truncate font-semibold max-w-50 sm:max-w-100">
                {document.repoUrl.split("/").slice(-1)[0]} Docs
              </span>
            </div>
          </div>

          {/* Right */}
          <Button
            onClick={copyFullDocumentation}
            variant="outline"
            size="sm"
            className="ml-4 shrink-0 border-white/10 bg-white/5 text-[#c9d1d9] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            {copiedFullDoc ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Markdown
              </>
            )}
          </Button>

        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-4xl px-6 pt-4 md:px-12">
        <div className="rounded-2xl border border-white/8 bg-white/2 p-8 md:p-12 shadow-xl backdrop-blur-sm">
          <div className="prose prose-invert prose-purple max-w-none h-[calc(100vh-200px)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 overflow-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white border-b border-white/10 pb-4 mb-6">
                    {children}
                  </h1>
                ),

                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-white mt-10 mb-4 border-b border-white/10 pb-2">
                    {children}
                  </h2>
                ),

                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-white mt-8 mb-3">
                    {children}
                  </h3>
                ),

                p: ({ children }) => (
                  <p className="text-[#c9d1d9] leading-7 mb-4">
                    {children}
                  </p>
                ),

                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {children}
                  </a>
                ),

                ul: ({ children }) => (
                  <ul className="list-disc pl-6 space-y-2 text-[#c9d1d9] mb-5">
                    {children}
                  </ul>
                ),

                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 space-y-2 text-[#c9d1d9] mb-5">
                    {children}
                  </ol>
                ),

                li: ({ children }) => (
                  <li className="leading-7">
                    {children}
                  </li>
                ),

                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-white/20 pl-4 my-5 text-[#8b949e] italic">
                    {children}
                  </blockquote>
                ),

                hr: () => (
                  <hr className="my-8 border-white/10" />
                ),

                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse text-sm">
                      {children}
                    </table>
                  </div>
                ),

                th: ({ children }) => (
                  <th className="border border-white/10 bg-white/5 px-4 py-3 text-left font-semibold text-white">
                    {children}
                  </th>
                ),

                td: ({ children }) => (
                  <td className="border border-white/10 px-4 py-3 text-[#c9d1d9]">
                    {children}
                  </td>
                ),

                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");

                  if (isBlock) {
                    return (
                      <code className="text-sm text-[#e6edf3]">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-sm text-[#e6edf3]">
                      {children}
                    </code>
                  );
                },

                pre: ({ children }) => {
                  const [copied, setCopied] = useState(false);

                  const copyCode = async () => {
                    const code = extractText(children);

                    await navigator.clipboard.writeText(code);

                    setCopied(true);

                    setTimeout(() => {
                      setCopied(false);
                    }, 2000);
                  };

                  return (
                    <div className="relative my-6">
                      <button
                        onClick={copyCode}
                        className="absolute right-3 top-3 z-10 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8b949e] transition hover:bg-white/10 hover:text-white"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>

                      <pre className="overflow-x-auto rounded-lg border border-white/10 bg-[#161b22] p-4 pr-20">
                        {children}
                      </pre>
                    </div>
                  );
                },

                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),

                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt || ""}
                    className="rounded-lg border border-white/10 my-6"
                  />
                ),
              }}
            >
              {document.documentation || "# No documentation generated yet."}
            </ReactMarkdown>

          </div>
        </div>
      </main>
    </div>
  );
}
