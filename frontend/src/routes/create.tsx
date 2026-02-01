import { useState, useEffect, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Input, Button, Checkbox } from "../components/ui";
import { useShortenUrl, type Link } from "../api/links";
import { toast } from "react-hot-toast";
import gsap from "gsap";
import Back from "../components/global/back";
import { Copy, Check, Trash2, Link as LinkIcon, Globe } from "lucide-react";

export const Route = createFileRoute("/create")({
  component: Index,
});

function Index() {
  const [url, setUrl] = useState("");
  const [instagramMode, setInstagramMode] = useState(false);
  const [result, setResult] = useState<Link | null>(null);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);

  const shortenMutation = useShortenUrl();

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".animate-in");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      );
    }
  }, []);

  const params = useMemo(() => {
    try {
      const u = new URL(url);
      return Array.from(u.searchParams.entries());
    } catch {
      return [];
    }
  }, [url]);

  const handleClearParams = () => {
    try {
      const u = new URL(url);
      setUrl(`${u.origin}${u.pathname}`);
      setResult(null);
      toast.success("Parameters cleared");
    } catch { }
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (result) setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    try {
      await shortenMutation.mutateAsync(
        { url: url, instagram_mode: instagramMode },
        {
          onSuccess: (data) => {
            setResult(data);
            toast.success("Link generated");
          },
          onError: (error: any) => {
            if (error.existing) {
              setResult(error.existing);
              toast.error("Link already exists");
            }
          },
        },
      );
    } catch { }
  };

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
      );

      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [result]);

  const handleCopy = async () => {
    if (!result) return;
    const textToCopy = result.short_url;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Copied to clipboard");
      setCopied(true);
    } catch (err) {
      toast.error("Failed to copy link");
    }

    if (copyBtnRef.current) {
      gsap
        .timeline()
        .to(copyBtnRef.current, { scale: 0.95, duration: 0.1 })
        .to(copyBtnRef.current, {
          scale: 1,
          duration: 0.4,
          ease: "elastic.out(1, 0.3)",
        });
    }

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto pb-10">
      <div className="animate-in">
        <Back subtitle="Create a short link" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-4 animate-in">
          <div className="relative">
            <Input
              type="url"
              placeholder="https://example.com/long-link"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              required
              className="h-10 text-lg px-6 bg-white border-2 border-black/20 focus:border-black/50 transition-all rounded-2xl text-black placeholder:text-black/50"
              suffix={<LinkIcon size={20} className="text-black/50 mr-2" />}
            />
          </div>

          {params.length > 0 && (
            <button
              type="button"
              onClick={handleClearParams}
              className="flex items-center gap-2 text-[10px] font-black text-red-600 hover:opacity-80 transition-opacity uppercase tracking-widest ml-2"
            >
              <Trash2 size={12} />
              Strip URL Parameters
            </button>
          )}

          <div className="bg-black/5 p-6 rounded-2xl border border-black/20 space-y-4">
            <Checkbox
              label="Instagram/Facebook Story Mode"
              checked={instagramMode}
              onChange={(e) => setInstagramMode(e.target.checked)}
              className="w-5 h-5"
            />
            <p className="text-xs text-black/70 font-medium leading-relaxed pl-8">
              Links open directly in the device's default browser, avoiding
              limitations imposed by in-app social media browsers.
            </p>
          </div>
        </div>

        <div className="animate-in">
          <Button
            type="submit"
            size="lg"
            className="w-full h-10 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/30"
            isLoading={shortenMutation.isPending}
          >
            Generate Link
          </Button>
        </div>
      </form>

      {result && (
        <div
          ref={resultRef}
          className="mt-16 pt-12 border-t border-black/20 space-y-8"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-2 text-center">
            Success! Your Link is Ready
          </p>

          <div className="flex items-stretch gap-3">
            <div className="flex-grow relative group">
              <Input
                value={result.short_url}
                readOnly
                className="h-16 font-mono text-center bg-white border-2 border-black/20 rounded-2xl cursor-default text-black"
              />
            </div>

            <button
              ref={copyBtnRef}
              type="button"
              onClick={handleCopy}
              className={`h-16 px-6 flex items-center justify-center rounded-2xl transition-all cursor-pointer shadow-lg ${copied
                  ? "bg-green-600 shadow-green-600/30"
                  : "bg-black hover:bg-black/80 shadow-black/30"
                }`}
            >
              <div className="text-white flex items-center gap-2">
                {copied ? <Check size={22} /> : <Copy size={22} />}
                <span className="text-xs font-black uppercase tracking-widest">
                  {copied ? "Copied" : "Copy"}
                </span>
              </div>
            </button>
          </div>

          {result.metadata &&
            (result.metadata.title ||
              result.metadata.description ||
              result.metadata.image) && (
              <div className="border border-black/10 rounded-2xl overflow-hidden bg-black/[0.02] flex flex-col md:flex-row shadow-sm">
                {result.metadata.image && (
                  <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden bg-black/5 flex-shrink-0">
                    <img
                      src={result.metadata.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-2">
                    {result.metadata.favicon ? (
                      <img
                        src={result.metadata.favicon}
                        alt=""
                        className="w-4 h-4 object-contain"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <Globe size={14} className="text-black/20" />
                    )}
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider truncate">
                      {new URL(result.original_url).hostname}
                    </span>
                  </div>
                  {result.metadata.title && (
                    <h3 className="text-sm font-black text-black leading-tight line-clamp-2">
                      {result.metadata.title}
                    </h3>
                  )}
                  {result.metadata.description && (
                    <p className="text-xs text-black/60 font-medium line-clamp-2">
                      {result.metadata.description}
                    </p>
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
