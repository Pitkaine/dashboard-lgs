"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TiptapEditor from "@/components/editor/TiptapEditor";
import ImageUpload from "@/components/editor/ImageUpload";
import GeoPageEditor from "@/components/editors/GeoPageEditor";
import LegalPageEditor from "@/components/editors/LegalPageEditor";
import ServicePageEditor from "@/components/editors/ServicePageEditor";
import AboutPageEditor from "@/components/editors/AboutPageEditor";
import FaqPageEditor from "@/components/editors/FaqPageEditor";
import DestinationWeddingPageEditor from "@/components/editors/DestinationWeddingPageEditor";
import {
  ArrowLeft,
  Check,
  Globe,
  Loader2,
  Save,
  Search,
  LayoutTemplate,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import type { Page, PageContent, PageSeo } from "@prisma/client";

type PageWithRelations = Page & {
  contents: PageContent[];
  seo: PageSeo[];
};

interface LangData {
  title: string;
  body: JSONContent | Record<string, unknown> | null;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

function getStructuredEditorType(
  type: string,
  slug: string
): "geo" | "legal" | "service" | "about" | "faq" | "destination-wedding" | null {
  switch (type) {
    case "GEO":
      return "geo";
    case "LEGAL":
      return "legal";
    case "SERVICE":
      return "service";
    case "LANDING":
      if (slug === "a-propos") return "about";
      if (slug === "faq") return "faq";
      if (slug === "destination-wedding") return "destination-wedding";
      return null;
    default:
      return null;
  }
}

const STRUCTURED_EDITOR_LABELS: Record<string, string> = {
  geo: "Page g\u00e9ographique",
  legal: "Page l\u00e9gale",
  service: "Page service",
  about: "Page \u00e0 propos",
  faq: "Page FAQ",
  "destination-wedding": "Page Destination Wedding",
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function PageEditorClient({
  page,
}: {
  page: PageWithRelations | null;
}) {
  const router = useRouter();
  const isNew = !page;
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const [type, setType] = useState<string>(page?.type || "SERVICE");
  const [slug, setSlug] = useState(page?.slug || "");
  const [status, setStatus] = useState<string>(page?.status || "DRAFT");

  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [langData, setLangData] = useState<Record<"fr" | "en", LangData>>({
    fr: {
      title: page?.contents.find((c) => c.language === "fr")?.title || "",
      body:
        (page?.contents.find((c) => c.language === "fr")
          ?.body as JSONContent | Record<string, unknown>) || null,
      metaTitle:
        page?.seo.find((s) => s.language === "fr")?.metaTitle || "",
      metaDescription:
        page?.seo.find((s) => s.language === "fr")?.metaDescription || "",
      ogImage:
        page?.seo.find((s) => s.language === "fr")?.ogImage || "",
    },
    en: {
      title: page?.contents.find((c) => c.language === "en")?.title || "",
      body:
        (page?.contents.find((c) => c.language === "en")
          ?.body as JSONContent | Record<string, unknown>) || null,
      metaTitle:
        page?.seo.find((s) => s.language === "en")?.metaTitle || "",
      metaDescription:
        page?.seo.find((s) => s.language === "en")?.metaDescription || "",
      ogImage:
        page?.seo.find((s) => s.language === "en")?.ogImage || "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!page?.slug);

  const editorType = getStructuredEditorType(type, slug);

  useEffect(() => {
    if (!slugManuallyEdited && langData.fr.title) {
      setSlug(generateSlug(langData.fr.title));
    }
  }, [langData.fr.title, slugManuallyEdited]);

  const updateLangField = (
    lang: "fr" | "en",
    field: keyof LangData,
    value: string | JSONContent | Record<string, unknown> | null
  ) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
    setSaved(false);
  };

  useEffect(() => {
    if (isNew) return;
    autoSaveTimer.current = setInterval(() => {
      handleSave(false);
    }, 30000);
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [langData, type, slug, status]);

  const handleSave = useCallback(
    async (showFeedback = true) => {
      if (saving) return;
      setSaving(true);

      try {
        const payload = {
          type,
          slug,
          status,
          contents: {
            fr: { title: langData.fr.title, body: langData.fr.body },
            en: { title: langData.en.title, body: langData.en.body },
          },
          seo: {
            fr: {
              metaTitle: langData.fr.metaTitle,
              metaDescription: langData.fr.metaDescription,
              ogImage: langData.fr.ogImage,
            },
            en: {
              metaTitle: langData.en.metaTitle,
              metaDescription: langData.en.metaDescription,
              ogImage: langData.en.ogImage,
            },
          },
        };

        const url = isNew ? "/api/pages" : `/api/pages/${page.id}`;
        const method = isNew ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Erreur de sauvegarde");

        const data = await res.json();

        if (showFeedback) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }

        if (isNew) {
          router.push(`/pages/${data.id}`);
        }
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        setSaving(false);
      }
    },
    [saving, type, slug, status, langData, isNew, page?.id, router]
  );

  const handlePublish = async () => {
    setStatus("PUBLISHED");
    setTimeout(() => handleSave(true), 50);
  };

  const currentLang = langData[activeLang];

  const renderEditor = (lang: "fr" | "en") => {
    const bodyData = langData[lang].body as Record<string, unknown> | null;
    const handleBodyChange = (newBody: Record<string, unknown>) => {
      updateLangField(lang, "body", newBody);
    };

    switch (editorType) {
      case "geo":
        return (
          <GeoPageEditor body={bodyData} onChange={handleBodyChange} lang={lang} />
        );
      case "legal":
        return (
          <LegalPageEditor body={bodyData} onChange={handleBodyChange} lang={lang} />
        );
      case "service":
        return (
          <ServicePageEditor body={bodyData} onChange={handleBodyChange} lang={lang} />
        );
      case "about":
        return (
          <AboutPageEditor body={bodyData} onChange={handleBodyChange} lang={lang} />
        );
      case "faq":
        return (
          <FaqPageEditor body={bodyData} onChange={handleBodyChange} lang={lang} />
        );
      case "destination-wedding":
        return (
          <DestinationWeddingPageEditor body={bodyData} onChange={handleBodyChange} lang={lang} />
        );
      default:
        return (
          <TiptapEditor
            content={langData[lang].body as JSONContent | null}
            onChange={(json: JSONContent) => updateLangField(lang, "body", json)}
            placeholder={
              lang === "fr"
                ? "Commencez \u00e0 \u00e9crire le contenu..."
                : "Start writing content..."
            }
            onImageUpload={() => setImageUploadOpen(true)}
          />
        );
    }
  };

  /** Shared save/publish buttons used in both top bar and sticky bar */
  const SaveButtons = ({ size = "sm" }: { size?: "sm" | "default" }) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={() => handleSave(true)}
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="size-4 mr-1.5 animate-spin" />
        ) : saved ? (
          <Check className="size-4 mr-1.5 text-emerald-500" />
        ) : (
          <Save className="size-4 mr-1.5" />
        )}
        {saved ? "Sauvegard\u00e9 !" : "Sauvegarder"}
      </Button>
      {status !== "PUBLISHED" && (
        <Button
          size={size}
          onClick={handlePublish}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Globe className="size-4 mr-1.5" />
          Publier
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top bar — wraps on small screens */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/pages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-1" />
              Pages
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground truncate max-w-[300px]">
            {isNew ? "Nouvelle page" : langData.fr.title || "Sans titre"}
          </h1>
          <Badge
            className={
              status === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }
          >
            {status === "PUBLISHED" ? "Publi\u00e9" : "Brouillon"}
          </Badge>
          {editorType && (
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <LayoutTemplate className="size-3 mr-1" />
              {STRUCTURED_EDITOR_LABELS[editorType]}
            </Badge>
          )}
        </div>
        <SaveButtons />
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          <Tabs
            value={activeLang}
            onValueChange={(v) => setActiveLang(v as "fr" | "en")}
          >
            <TabsList>
              <TabsTrigger value="fr" className="gap-1.5">
                {"\ud83c\uddeb\ud83c\uddf7"} Fran\u00e7ais
              </TabsTrigger>
              <TabsTrigger value="en" className="gap-1.5">
                {"\ud83c\uddec\ud83c\udde7"} English
              </TabsTrigger>
            </TabsList>

            {(["fr", "en"] as const).map((lang) => (
              <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
                <div>
                  <Input
                    value={langData[lang].title}
                    onChange={(e) =>
                      updateLangField(lang, "title", e.target.value)
                    }
                    placeholder={
                      lang === "fr" ? "Titre de la page" : "Page title"
                    }
                    className="text-2xl font-bold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-amber-500"
                  />
                </div>

                {renderEditor(lang)}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {status === "PUBLISHED" ? "Publi\u00e9" : "Brouillon"}
                </span>
                <Switch
                  checked={status === "PUBLISHED"}
                  onCheckedChange={(checked) =>
                    setStatus(checked ? "PUBLISHED" : "DRAFT")
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Page settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Type de page</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SERVICE">Service</SelectItem>
                    <SelectItem value="GEO">G\u00e9ographique</SelectItem>
                    <SelectItem value="LANDING">Landing</SelectItem>
                    <SelectItem value="LEGAL">L\u00e9gal</SelectItem>
                    <SelectItem value="BLOG">Blog</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Slug URL</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground shrink-0">/</span>
                  <Input
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="mon-slug"
                    className="text-sm"
                  />
                </div>
              </div>

              {editorType && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 p-3 text-xs text-blue-700 dark:text-blue-400">
                  <LayoutTemplate className="size-3.5 inline mr-1.5 -mt-0.5" />
                  \u00c9diteur structur\u00e9 actif \u2014 les champs du formulaire
                  correspondent \u00e0 la structure de la page sur le site.
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Search className="size-4" />
                SEO \u2014 {activeLang.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Meta Title</Label>
                  <span
                    className={`text-xs ${
                      currentLang.metaTitle.length > 60
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {currentLang.metaTitle.length}/60
                  </span>
                </div>
                <Input
                  value={currentLang.metaTitle}
                  onChange={(e) =>
                    updateLangField(activeLang, "metaTitle", e.target.value)
                  }
                  placeholder="Titre pour Google"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Meta Description
                  </Label>
                  <span
                    className={`text-xs ${
                      currentLang.metaDescription.length > 160
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {currentLang.metaDescription.length}/160
                  </span>
                </div>
                <Textarea
                  value={currentLang.metaDescription}
                  onChange={(e) =>
                    updateLangField(
                      activeLang,
                      "metaDescription",
                      e.target.value
                    )
                  }
                  placeholder="Description pour Google"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              {/* Google preview */}
              <div className="rounded-md border p-3 bg-card">
                <p className="text-xs text-muted-foreground mb-2">
                  Pr\u00e9visualisation Google
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium leading-tight truncate">
                  {currentLang.metaTitle ||
                    currentLang.title ||
                    "Titre de la page"}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  lesgarssympas.com/{slug || "slug"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {currentLang.metaDescription || "Description de la page..."}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">OG Image</Label>
                <Input
                  value={currentLang.ogImage}
                  onChange={(e) =>
                    updateLangField(activeLang, "ogImage", e.target.value)
                  }
                  placeholder="/uploads/pages/image.webp"
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image upload dialog */}
      <ImageUpload
        open={imageUploadOpen}
        onOpenChange={setImageUploadOpen}
        onImageUploaded={() => {}}
        uploadPath="pages"
      />

      {/* ── Sticky save bar (always visible at bottom) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-6 py-3">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <p className="text-xs text-muted-foreground hidden sm:block">
            {saved
              ? "\u2705 Modifications sauvegard\u00e9es"
              : "Auto-save toutes les 30s"}
          </p>
          <SaveButtons size="default" />
        </div>
      </div>
    </div>
  );
}
