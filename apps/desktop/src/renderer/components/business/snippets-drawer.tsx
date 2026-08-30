import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, Copy, Check, Trash2, PenLine } from "lucide-react";
import { toast } from "@orca-blitz/ui/components/ui/toast";
import { Button } from "@orca-blitz/ui/components/ui/button";
import { Input } from "@orca-blitz/ui/components/ui/input";
import { ScrollArea } from "@orca-blitz/ui/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@orca-blitz/ui/components/ui/sheet";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@orca-blitz/ui/components/ui/empty";
import { cn } from "../../lib/utils";
import { useAppStore } from "../../store";
import { SnippetForm, type SavedSnippet, type SnippetCategory } from "./snippet-form";

const STORAGE_KEY = (businessId: string) => `orca-business-snippets-${businessId}`;

const CATEGORY_OPTIONS: { value: SnippetCategory; labelKey: string }[] = [
  { value: "cta", labelKey: "snippets.categories.cta" },
  { value: "description", labelKey: "snippets.categories.description" },
  { value: "greeting", labelKey: "snippets.categories.greeting" },
  { value: "response", labelKey: "snippets.categories.response" },
  { value: "payment", labelKey: "snippets.categories.payment" },
  { value: "other", labelKey: "snippets.categories.other" },
];

interface SnippetsDrawerProps {
  businessId: string;
}

export function SnippetsDrawer({ businessId }: SnippetsDrawerProps) {
  const { t } = useTranslation("business");
  const open = useAppStore((s) => s.snippetsDrawerOpen);
  const setOpen = useAppStore((s) => s.setSnippetsDrawerOpen);

  const [snippets, setSnippets] = useState<SavedSnippet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(businessId));
      return saved ? (JSON.parse(saved) as SavedSnippet[]) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SnippetCategory | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<SavedSnippet | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(businessId), JSON.stringify(snippets));
  }, [businessId, snippets]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return snippets.filter((s) => {
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
      if (query) {
        return s.title.toLowerCase().includes(query) || s.body.toLowerCase().includes(query);
      }
      return true;
    });
  }, [snippets, searchQuery, categoryFilter]);

  const handleCopy = async (snippet: SavedSnippet) => {
    try {
      await navigator.clipboard.writeText(snippet.body);
      toast.add({ title: t("snippets.copied"), type: "success" });
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.add({ title: t("snippets.copyError"), type: "error" });
    }
  };

  const handleDelete = (id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
    toast.add({ title: t("snippets.deleted"), type: "success" });
  };

  const handleSave = (data: Omit<SavedSnippet, "id" | "createdAt">) => {
    if (editingSnippet) {
      setSnippets((prev) => prev.map((s) => (s.id === editingSnippet.id ? { ...s, ...data } : s)));
    } else {
      setSnippets((prev) => [
        { id: `snippet-${Date.now()}`, ...data, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    }
    setEditingSnippet(null);
  };

  const getCategoryLabel = (category: SnippetCategory) => {
    const opt = CATEGORY_OPTIONS.find((o) => o.value === category);
    return opt ? t(opt.labelKey) : category;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>{t("snippets.title")}</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-3 px-4 pb-4 flex-1 min-h-0">
            <div className="flex overflow-x-auto gap-1.5 pb-1 px-1 scrollbar-visible">
              <Button
                size="sm"
                variant={categoryFilter === "all" ? "default" : "ghost"}
                className="shrink-0 text-xs"
                onClick={() => setCategoryFilter("all")}
              >
                {t("snippets.categories.all")}
              </Button>
              {CATEGORY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={categoryFilter === opt.value ? "default" : "ghost"}
                  className="shrink-0 text-xs"
                  onClick={() => setCategoryFilter(opt.value)}
                >
                  {t(opt.labelKey)}
                </Button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("snippets.searchPlaceholder")}
                className="pl-9"
              />
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {filtered.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Copy />
                    </EmptyMedia>
                    <EmptyTitle>{t("snippets.noSnippets")}</EmptyTitle>
                    <EmptyDescription>{t("snippets.emptyDescription")}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button size="sm" onClick={() => setShowForm(true)}>
                      <Plus className="size-3.5" />
                      {t("snippets.createFirst")}
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="space-y-2">
                  {filtered.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="rounded-lg border border-border bg-card p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{snippet.title}</p>
                          <span className="text-[11px] text-muted-foreground">
                            {getCategoryLabel(snippet.category)}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => handleCopy(snippet)}
                            className={cn(
                              "flex size-6 items-center justify-center rounded-md transition-colors",
                              copiedId === snippet.id
                                ? "text-green-500"
                                : "text-muted-foreground hover:bg-accent",
                            )}
                          >
                            {copiedId === snippet.id ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingSnippet(snippet);
                              setShowForm(true);
                            }}
                            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent"
                          >
                            <PenLine className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(snippet.id)}
                            className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      {snippet.body && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{snippet.body}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="absolute bottom-4 right-4">
            <Button
              size="icon"
              className="rounded-full shadow-lg"
              onClick={() => {
                setEditingSnippet(null);
                setShowForm(true);
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <SnippetForm
        open={showForm}
        onOpenChange={(v) => {
          setShowForm(v);
          if (!v) setEditingSnippet(null);
        }}
        snippet={editingSnippet}
        onSave={handleSave}
      />
    </>
  );
}
