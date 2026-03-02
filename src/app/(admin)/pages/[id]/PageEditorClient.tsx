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
import {
  ArrowLeft,
  Check,
  Globe,
  Loader2,
  Save,
  Search,
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
  body: JSONContent | null;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

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

  // Page-level fields
  const [type, setType] = useState<string>(page?.type || "SERVICE");
  const [slug, setSlug] = useState(page?.slug || "");
  const [status, setStatus] = useState<string>(page?.status || "DRAFT");

  // Language data
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [langData, setLangData] = useState<Record<"fr" | "en", LangData>>({
    fr: {
      title: page?.contents.find((c) => c.language === "fr")?.title || "",
      body: (page?.contents.find((c) => c.language === "fr")?.body as JSONContent) || null,
      metaTitle: page?.seo.find((s) => s.language === "fr")?.metaTitle || "",
      metaDescription: page?.seo.find((s) => s.language === "fr")?.metaDescription || "",
      ogImage: page?.seo.find((s) => s.language === "fr")?.ogImage || "",
    },
    en: {
      title: page?.contents.find((c) => c.language === "en")?.title || "",
      body: (page?.contents.find((c) => c.language === "en")?.body as JSONContent) || null,
      metaTitle: page?.seo.find((s) => s.language === "en")?.metaTitle || "",
      metaDescription: page?.seo.find((s) => s.language === "en")?.metaDescription || "",
      ogImage: page?.seo.find((s) => s.language === "en")?.ogImage || "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!page?.slug);

  // Auto-generate slug from FR title
  useEffect(() => {
    if (!slugManuallyEdited && langData.fr.title) {
      setSlug(generateSlug(langData.fr.title));
    }
  }, [langData.fr.title, slugManuallyEdited]);

  const updateLangField = (
    lang: "fr" | "en",
    field: keyof LangData,
    value: string | JSONContent | null
  ) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
    setSaved(false);
  };

  // Auto-save every 30 seconds
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

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-1" />
              Pages
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">
            {isNew ? "Nouvelle page" : langData.fr.title || "Sans titre"}
          </h1>
          <Badge
            className={
              status === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }
          >
            {status === "PUBLISHED" ? "Publié" : "Brouillon"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : saved ? (
              <Check className="size-4 mr-1 text-emerald-600" />
            ) : (
              <Save className="size-4 mr-1" />
            )}
            {saved ? "Sauvegardé" : "Sauvegarder"}
          </Button>
          {status !== "PUBLISHED" && (
            <Button
              size="sm"
              onClick={handlePublish}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Globe className="size-4 mr-1" />
              Publier
            </Button>
          )}
        </div>
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
                🇫🇷 Français
              </TabsTrigger>
              <TabsTrigger value="en" className="gap-1.5">
                🇬🇧 English
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

                <TiptapEditor
                  content={langData[lang].body}
                  onChange={(json) => updateLangField(lang, "body", json)}
                  placeholder={
                    lang === "fr"
                      ? "Commencez à écrire le contenu..."
                      : "Start writing content..."
                  }
                  onImageUpload={() => setImageUploadOpen(true)}
                />
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
                <span className="text-sm text-neutral-600">
                  {status === "PUBLISHED" ? "Publié" : "Brouillon"}
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
                <Label className="text-xs text-neutral-500">Type de page</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SERVICE">Service</SelectItem>
                    <SelectItem value="GEO">Géographique</SelectItem>
                    <SelectItem value="LEGAL">Légal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">Slug URL</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-400 shrink-0">/</span>
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
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Search className="size-4" />
                SEO — {activeLang.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-neutral-500">Meta Title</Label>
                  <span
                    className={`text-xs ${
                      currentLang.metaTitle.length > 60
                        ? "text-red-500"
                        : "text-neutral-400"
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
                  <Label className="text-xs text-neutral-500">Meta Description</Label>
                  <span
                    className={`text-xs ${
                      currentLang.metaDescription.length > 160
                        ? "text-red-500"
                        : "text-neutral-400"
                    }`}
                  >
                    {currentLang.metaDescription.length}/160
                  </span>
                </div>
                <Textarea
                  value={currentLang.metaDescription}
                  onChange={(e) =>
                    updateLangField(activeLang, "metaDescription", e.target.value)
                  }
                  placeholder="Description pour Google"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              {/* Google preview */}
              <div className="rounded-md border border-neutral-200 p-3 bg-white">
                <p className="text-xs text-neutral-400 mb-2">Prévisualisation Google</p>
                <p className="text-sm text-blue-700 font-medium leading-tight truncate">
                  {currentLang.metaTitle || currentLang.title || "Titre de la page"}
                </p>
                <p className="text-xs text-emerald-700 mt-0.5 truncate">
                  lesgarssympas.com/{slug || "slug"}
                </p>
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                  {currentLang.metaDescription || "Description de la page..."}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">OG Image</Label>
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
    </div>
  );
}
