import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { useLinks, type Link } from "../api/links";
import { Spinner } from "../components/ui";
import {
  AlertCircle,
  Link2Off,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import Back from "../components/global/back";
import { toast } from "react-hot-toast";
import gsap from "gsap";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";

export const Route = createFileRoute("/links")({
  component: LinksPage,
});

const columnHelper = createColumnHelper<Link>();

function LinksPage() {
  const [retried, setRetried] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading, isError, refetch } = useLinks();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".animate-in");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, [isLoading]);

  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
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
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("code", {
        header: "Short",
        size: 100,
        cell: (info) => (
          <button
            onClick={() => handleCopy(info.row.original.short_url)}
            className="font-mono font-bold text-accent cursor-pointer hover:underline text-left"
          >
            /{info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor("original_url", {
        header: "Original URL",
        size: 300,
        cell: (info) => (
          <div className="flex items-center gap-2 group max-w-[200px] md:max-w-[400px]">
            <div
              onClick={() => handleCopy(info.getValue())}
              className="text-sm text-black/60 truncate font-medium cursor-pointer hover:underline"
            >
              {info.getValue()}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("instagram_mode", {
        header: "Mode",
        size: 100,
        cell: (info) => (
          <span
            className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded border ${info.getValue()
              ? "bg-accent/5 border-accent/20 text-accent"
              : "bg-black/5 border-black/10 text-black/40"
              }`}
          >
            {info.getValue() ? "Instagram" : "Normal"}
          </span>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Date",
        size: 120,
        cell: (info) => (
          <span className="text-[11px] font-medium text-black/40 tabular-nums">
            {new Date(info.getValue()).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "2-digit",
            })}
          </span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data?.links ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    if (isError && !retried) {
      setRetried(true);
      refetch();
    }
  }, [isError, retried, refetch]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto">
      <div className="animate-in">
        <Back subtitle="All Links" />
      </div>

      {!isLoading && !isError && (
        <div className="mb-10 flex justify-center animate-in">
          <div className="inline-flex flex-col items-center bg-black/[0.03] px-10 py-6 rounded-3xl border border-black/5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2">
              Total Links Created
            </span>
            <span className="text-4xl font-black text-black tabular-nums">
              {data?.total ?? 0}
            </span>
          </div>
        </div>
      )}

      <div className="overflow-hidden border border-black/10 rounded-2xl bg-white shadow-sm mb-10 animate-in">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-black/10 bg-black/[0.02]"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 text-left select-none cursor-pointer hover:bg-black/5 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <ChevronUp size={14} className="text-accent" />,
                          desc: (
                            <ChevronDown size={14} className="text-accent" />
                          ),
                        }[header.column.getIsSorted() as string] ?? (
                            <ArrowUpDown size={12} className="opacity-20" />
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {isLoading && (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center">
                    <Spinner size="md" className="mx-auto text-accent" />
                  </td>
                </tr>
              )}
              {!isLoading && isError && (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center">
                    <AlertCircle
                      className="mx-auto mb-3 text-error"
                      size={24}
                    />
                    <p className="text-sm font-bold text-black/60">
                      Failed to load links
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="text-accent text-xs font-black uppercase tracking-widest mt-4 cursor-pointer hover:underline"
                    >
                      Retry Connection
                    </button>
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-black/[0.01] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 overflow-hidden">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              {!isLoading && !isError && data?.links.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center">
                    <Link2Off
                      className="mx-auto mb-3 text-black/10"
                      size={32}
                    />
                    <p className="text-sm font-medium text-black/30">
                      No links created yet
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
