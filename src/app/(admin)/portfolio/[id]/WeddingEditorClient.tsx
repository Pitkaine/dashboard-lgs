"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import TiptapEditor from "@/components/editor/TiptapEditor";
import ImageUpload from "@/components/editor/ImageUpload";
import {
  ArrowLeft,
  Check,
  Globe,
  Loader2,
  Save,
  Search,
  Upload,
  Trash2,
  Star,
  GripVertical,
  Film,
  ImageIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import type { Wedding, WeddingContent, WeddingMedia } from "@prisma/client";

type WeddingWithRelations = Wedding & {
  details: WeddingContent[];
  media: WeddingMedia[];
};

interface LangData {
  title: string;
  location: string;
  venue: string;
  description: string;
  body: JSONContent | null;
}

interface MediaItem {
  id?: number;
  type: "PHOTO" | "VIDEO" | "YOUTUBE";
  url: string;
  thumbnail?: string;
  caption?: string;
  position: number;
  isCover: boolean;
  isNew?: boolean;
  file?: File;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function WeddingEditorClient({
  wedding,
}: {
  wedding: WeddingWithRelations | null;
}) {
  const router = useRouter();
  const isNew = !wedding;
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Page-level fields
  const [slug, setSlug] = useState(wedding?.slug || "");
  const [status, setStatus] = useState<string>(wedding?.status || "DRAFT");
  const [date, setDate] = useState(
    wedding?.date
      ? new Date(wedding.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );

  // Language data
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [langData, setLangData] = useState<Record<"fr" | "en", LangData>>({
    fr: {
      title: wedding?.details.find((d) => d.language === "fr")?.title || "",
      location: wedding?.details.find((d) => d.language === "fr")?.location || "",
      venue: wedding?.details.find((d) => d.language === "fr")?.venue || "",
      description: wedding?.details.find((d) => d.language === "fr")?.description || "",
      body: (wedding?.details.find((d) => d.language === "fr")?.body as JSONContent) || null,
    },
    en: {
      title: wedding?.details.find((d) => d.language === "en")?.title || "",
      location: wedding?.details.find((d) => d.language === "en")?.location || "",
      venue: wedding?.details.find((d) => d.language === "en")?.venue || "",
      description: wedding?.details.find((d) => d.language === "en")?.description || "",
      body: (wedding?.details.find((d) => d.language === "en")?.body as JSONContent) || null,
    },
  });

  // Media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(
    wedding?.media.map((m) => ({
      id: m.id,
      type: m.type as "PHOTO" | "VIDEO" | "YOUTUBE",
      url: m.url,
      thumbnail: m.thumbnail || undefined,
      caption: m.caption || undefined,
      position: m.position,
      isCover: m.isCover,
    })) || []
  );
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  // Active section tab
  const [activeSection, setActiveSection] = useState<"info" | "medias" | "seo">("info");

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!wedding?.slug);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Auto-save every 30 seconds (only for existing weddings)
  useEffect(() => {
    if (isNew) return;
    autoSaveTimer.current = setInterval(() => {
      handleSave(false);
    }, 30000);
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [langData, slug, status, date, mediaItems]);

  // --- File upload ---
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const totalFiles = files.length;
    let uploaded = 0;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        continue;
      }

      setUploadProgress(`Upload ${++uploaded}/${totalFiles}...`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", "portfolio");

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const isVideo = file.type.startsWith("video/");

          setMediaItems((prev) => [
            ...prev,
            {
              type: isVideo ? "VIDEO" : "PHOTO",
              url: data.url,
              position: prev.length,
              isCover: prev.length === 0,
              isNew: true,
            },
          ]);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setUploading(false);
    setUploadProgress("");
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- YouTube add ---
  const handleAddYoutube = () => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) return;

    setMediaItems((prev) => [
      ...prev,
      {
        type: "YOUTUBE",
        url: `https://www.youtube.com/embed/${videoId}`,
        thumbnail: `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`,
        position: prev.length,
        isCover: prev.length === 0,
        isNew: true,
      },
    ]);
    setYoutubeUrl("");
  };

  // --- Media actions ---
  const handleSetCover = (index: number) => {
    setMediaItems((prev) =>
      prev.map((m, i) => ({ ...m, isCover: i === index }))
    );
  };

  const handleDeleteMedia = (index: number) => {
    setMediaItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Re-index positions
      return next.map((m, i) => ({ ...m, position: i }));
    });
  };

  // --- Drag & drop reorder ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setMediaItems((prev) => {
      const items = [...prev];
      const dragged = items[draggedIndex];
      items.splice(draggedIndex, 1);
      items.splice(index, 0, dragged);
      return items.map((m, i) => ({ ...m, position: i }));
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // --- Save ---
  const handleSave = useCallback(
    async (showFeedback = true) => {
      if (saving) return;
      setSaving(true);

      try {
        const payload = {
          slug,
          date,
          status,
          details: {
            fr: {
              title: langData.fr.title,
              location: langData.fr.location,
              venue: langData.fr.venue,
              description: langData.fr.description,
              body: langData.fr.body,
            },
            en: {
              title: langData.en.title,
              location: langData.en.location,
              venue: langData.en.venue,
              description: langData.en.description,
              body: langData.en.body,
            },
          },
          media: mediaItems.map((m, i) => ({
            id: m.id,
            type: m.type,
            url: m.url,
            thumbnail: m.thumbnail || null,
            caption: m.caption || null,
            position: i,
            isCover: m.isCover,
          })),
        };

        const url = isNew ? "/api/portfolio" : `/api/portfolio/${wedding.id}`;
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
          router.push(`/portfolio/${data.id}`);
        } else {
          // Update media IDs from response
          if (data.media) {
            setMediaItems(
              data.media.map((m: WeddingMedia) => ({
                id: m.id,
                type: m.type as "PHOTO" | "VIDEO" | "YOUTUBE",
                url: m.url,
                thumbnail: m.thumbnail || undefined,
                caption: m.caption || undefined,
                position: m.position,
                isCover: m.isCover,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        setSaving(false);
      }
    },
    [saving, slug, date, status, langData, mediaItems, isNew, wedding?.id, router]
  );

  const handlePublish = async () => {
    setStatus("PUBLISHED");
    setTimeout(() => handleSave(true), 50);
  };

  const coverMedia = mediaItems.find((m) => m.isCover);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/portfolio">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-1" />
              Portfolio
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">
            {isNew ? "Nouveau mariage" : langData.fr.title || "Sans titre"}
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

      {/* Section tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex gap-6">
          {(
            [
              { key: "info", label: "Informations" },
              { key: "medias", label: `Médias (${mediaItems.length})` },
              { key: "seo", label: "SEO" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === tab.key
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ===== SECTION: INFO ===== */}
      {activeSection === "info" && (
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
                        lang === "fr"
                          ? "Titre du mariage (ex: Mariage de Julie & Thomas)"
                          : "Wedding title (e.g. Julie & Thomas Wedding)"
                      }
                      className="text-2xl font-bold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-neutral-600">
                        {lang === "fr" ? "Lieu" : "Location"}
                      </Label>
                      <Input
                        value={langData[lang].location}
                        onChange={(e) =>
                          updateLangField(lang, "location", e.target.value)
                        }
                        placeholder={
                          lang === "fr" ? "Paris, France" : "Paris, France"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-neutral-600">
                        {lang === "fr" ? "Lieu de réception" : "Venue"}
                      </Label>
                      <Input
                        value={langData[lang].venue}
                        onChange={(e) =>
                          updateLangField(lang, "venue", e.target.value)
                        }
                        placeholder={
                          lang === "fr"
                            ? "Château de Versailles"
                            : "Palace of Versailles"
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-neutral-600">
                      {lang === "fr" ? "Description courte" : "Short description"}
                    </Label>
                    <Textarea
                      value={langData[lang].description}
                      onChange={(e) =>
                        updateLangField(lang, "description", e.target.value)
                      }
                      placeholder={
                        lang === "fr"
                          ? "Un bref résumé de ce mariage..."
                          : "A brief summary of this wedding..."
                      }
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-neutral-600">
                      {lang === "fr"
                        ? "Contenu détaillé (optionnel)"
                        : "Detailed content (optional)"}
                    </Label>
                    <TiptapEditor
                      content={langData[lang].body}
                      onChange={(json) => updateLangField(lang, "body", json)}
                      placeholder={
                        lang === "fr"
                          ? "Racontez l'histoire de ce mariage..."
                          : "Tell the story of this wedding..."
                      }
                      onImageUpload={() => setImageUploadOpen(true)}
                    />
                  </div>
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

            {/* Date */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Date du mariage</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Slug */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Slug URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-400 shrink-0">
                    /portfolio/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="julie-thomas-paris"
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cover preview */}
            {coverMedia && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Couverture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video rounded-md overflow-hidden bg-neutral-100">
                    <Image
                      src={coverMedia.thumbnail || coverMedia.url}
                      alt="Couverture"
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ===== SECTION: MEDIAS ===== */}
      {activeSection === "medias" && (
        <div className="space-y-6">
          {/* Upload bar */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* File upload */}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        {uploadProgress}
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-2" />
                        Ajouter des photos / vidéos
                      </>
                    )}
                  </Button>
                </div>

                {/* YouTube URL */}
                <div className="flex gap-2">
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="URL YouTube..."
                    className="w-64"
                    onKeyDown={(e) => e.key === "Enter" && handleAddYoutube()}
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddYoutube}
                    disabled={!extractYouTubeId(youtubeUrl)}
                  >
                    <Film className="size-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media grid */}
          {mediaItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-neutral-500">
                <ImageIcon className="size-12 mx-auto mb-3 text-neutral-300" />
                <p>Aucun média</p>
                <p className="text-xs mt-1">
                  Ajoutez des photos, vidéos ou liens YouTube
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {mediaItems.map((media, index) => (
                <div
                  key={`${media.url}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border-2 transition-all cursor-grab active:cursor-grabbing ${
                    draggedIndex === index
                      ? "border-amber-400 opacity-50"
                      : media.isCover
                      ? "border-amber-400"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  {/* Thumbnail */}
                  {media.type === "YOUTUBE" ? (
                    <Image
                      src={
                        media.thumbnail ||
                        `https://i.ytimg.com/vi_webp/${extractYouTubeId(media.url)}/maxresdefault.webp`
                      }
                      alt="YouTube"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <Image
                      src={media.url}
                      alt={media.caption || "Media"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  )}

                  {/* Overlay icons */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                    {/* Drag handle */}
                    <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="size-4 text-white drop-shadow" />
                    </div>

                    {/* Type badge */}
                    {media.type === "YOUTUBE" && (
                      <div className="absolute bottom-1.5 left-1.5">
                        <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0">
                          YouTube
                        </Badge>
                      </div>
                    )}
                    {media.type === "VIDEO" && (
                      <div className="absolute bottom-1.5 left-1.5">
                        <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">
                          Vidéo
                        </Badge>
                      </div>
                    )}

                    {/* Cover star */}
                    {media.isCover && (
                      <div className="absolute top-1.5 right-1.5">
                        <Star className="size-5 text-amber-400 fill-amber-400 drop-shadow" />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!media.isCover && (
                        <button
                          onClick={() => handleSetCover(index)}
                          className="p-1 rounded bg-black/50 text-white hover:bg-amber-500 transition-colors"
                          title="Définir comme couverture"
                        >
                          <Star className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMedia(index)}
                        className="p-1 rounded bg-black/50 text-white hover:bg-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SECTION: SEO ===== */}
      {activeSection === "seo" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="size-4" />
              SEO & Référencement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-neutral-500">Slug URL</Label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-neutral-400 shrink-0">
                  lesgarssympas.com/portfolio/
                </span>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  placeholder="julie-thomas-paris"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Google preview */}
            <div className="rounded-md border border-neutral-200 p-3 bg-white">
              <p className="text-xs text-neutral-400 mb-2">
                Prévisualisation Google
              </p>
              <p className="text-sm text-blue-700 font-medium leading-tight truncate">
                {langData.fr.title || "Titre du mariage"} | Les Gars Sympas
              </p>
              <p className="text-xs text-emerald-700 mt-0.5 truncate">
                lesgarssympas.com/portfolio/{slug || "slug"}
              </p>
              <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                {langData.fr.description || "Description du mariage..."}
              </p>
            </div>

            <p className="text-xs text-neutral-400">
              Le titre et la description FR sont utilisés pour le SEO. Le slug
              est auto-généré depuis le titre FR, mais vous pouvez le
              personnaliser.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Image upload dialog (for Tiptap editor) */}
      <ImageUpload
        open={imageUploadOpen}
        onOpenChange={setImageUploadOpen}
        onImageUploaded={() => {}}
        uploadPath="portfolio"
      />
    </div>
  );
}
