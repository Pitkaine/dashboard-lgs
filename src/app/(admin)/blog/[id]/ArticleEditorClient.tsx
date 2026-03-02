"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ImageIcon,
  Loader2,
  Save,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import type { Article } from "@prisma/client";

/**
 * Detect if content is Tiptap JSON or legacy HTML/text.
 * If legacy, wrap it in a basic Tiptap document structure.
 */
function parseContent(raw: string | null): JSONContent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.type === "doc") {
      return parsed; // Already Tiptap JSON
    }
  } catch {
    // Not JSON — legacy HTML content
  }
  // Convert legacy HTML to a Tiptap-compatible doc
  // Tiptap will parse this HTML when loaded
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: raw }],
      },
    ],
  };
}

export default function ArticleEditorClient({
  article,
}: {
  article: Article | null;
}) {
  const router = useRouter();
  const isNew = !article;
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Fields
  const [title, setTitle] = useState(article?.title || "");
  const [description, setDescription] = useState(article?.description || "");
  const [language, setLanguage] = useState<string>(article?.language || "fr");
  const [type, setType] = useState(article?.type || "guide");
  const [content, setContent] = useState<JSONContent | null>(
    parseContent(article?.content || null)
  );
  const [thumbnail, setThumbnail] = useState(article?.thumbnail || "");
  const [banner, setBanner] = useState(article?.banner || "");
  const [statut, setStatut] = useState(article?.statut || "0");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [imageTarget, setImageTarget] = useState<
    "editor" | "thumbnail" | "banner"
  >("editor");

  // Auto-save
  useEffect(() => {
    if (isNew) return;
    autoSaveTimer.current = setInterval(() => {
      handleSave(false);
    }, 30000);
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [title, description, language, type, content, thumbnail, banner, statut]);

  const handleSave = useCallback(
    async (showFeedback = true) => {
      if (saving) return;
      setSaving(true);

      try {
        const payload = {
          title,
          description,
          language,
          type,
          content: content ? JSON.stringify(content) : "",
          thumbnail,
          banner,
          statut,
        };

        const url = isNew ? "/api/blog" : `/api/blog/${article.id}`;
        const method = isNew ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Erreur");

        const data = await res.json();

        if (showFeedback) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }

        if (isNew) {
          router.push(`/blog/${data.id}`);
        }
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        setSaving(false);
      }
    },
    [saving, title, description, language, type, content, thumbnail, banner, statut, isNew, article?.id, router]
  );

  const handlePublish = () => {
    setStatut("1");
    setTimeout(() => handleSave(true), 50);
  };

  const openImageUpload = (target: "editor" | "thumbnail" | "banner") => {
    setImageTarget(target);
    setImageUploadOpen(true);
  };

  const handleImageUploaded = (url: string) => {
    if (imageTarget === "thumbnail") {
      setThumbnail(url);
    } else if (imageTarget === "banner") {
      setBanner(url);
    }
    // For "editor", the TiptapEditor handles image insertion internally
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-1" />
              Blog
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">
            {isNew ? "Nouvel article" : title || "Sans titre"}
          </h1>
          <Badge
            className={
              statut === "1"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }
          >
            {statut === "1" ? "Publié" : "Brouillon"}
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
          {statut !== "1" && (
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main column */}
        <div className="space-y-4">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'article"
            className="text-2xl font-bold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-amber-500"
          />

          {/* Description (excerpt) */}
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description courte (affichée dans la liste du blog)..."
            rows={2}
            className="resize-none text-sm"
          />

          {/* Editor */}
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Rédigez votre article..."
            onImageUpload={() => openImageUpload("editor")}
          />
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
                  {statut === "1" ? "Publié" : "Brouillon"}
                </span>
                <Switch
                  checked={statut === "1"}
                  onCheckedChange={(checked) =>
                    setStatut(checked ? "1" : "0")
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Article settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">Langue</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="conseil">Conseil</SelectItem>
                    <SelectItem value="inspiration">Inspiration</SelectItem>
                    <SelectItem value="actualite">Actualité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="size-4" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Thumbnail */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">
                  Image à la une
                </Label>
                {thumbnail ? (
                  <div className="relative group">
                    <img
                      src={thumbnail}
                      alt="Thumbnail"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openImageUpload("thumbnail")}
                      >
                        Changer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setThumbnail("")}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-20"
                    onClick={() => openImageUpload("thumbnail")}
                  >
                    <ImageIcon className="size-4 mr-2" />
                    Ajouter
                  </Button>
                )}
              </div>

              {/* Banner */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">Bannière</Label>
                {banner ? (
                  <div className="relative group">
                    <img
                      src={banner}
                      alt="Banner"
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openImageUpload("banner")}
                      >
                        Changer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setBanner("")}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-16"
                    onClick={() => openImageUpload("banner")}
                  >
                    <ImageIcon className="size-4 mr-2" />
                    Ajouter
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Search className="size-4" />
                Prévisualisation Google
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-neutral-200 p-3 bg-white">
                <p className="text-sm text-blue-700 font-medium leading-tight truncate">
                  {title || "Titre de l'article"}
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  lesgarssympas.com/{language}/blog
                </p>
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                  {description || "Description de l'article..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image upload dialog */}
      <ImageUpload
        open={imageUploadOpen}
        onOpenChange={setImageUploadOpen}
        onImageUploaded={handleImageUploaded}
        uploadPath="blog"
      />
    </div>
  );
}
