"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Check,
  Globe,
  Image as ImageIcon,
  Loader2,
  Mail,
  Palette,
  Phone,
  Save,
  Settings,
  Share2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

type SettingsGroup = Record<
  string,
  { id: number; key: string; value: string }[]
>;

const GROUP_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  appearance: { label: "Apparence", icon: <Palette className="size-4" /> },
  contact: { label: "Contact", icon: <Mail className="size-4" /> },
  social: { label: "Réseaux sociaux", icon: <Share2 className="size-4" /> },
  seo: { label: "SEO", icon: <Globe className="size-4" /> },
  business: { label: "Entreprise", icon: <Settings className="size-4" /> },
  pricing: { label: "Tarifs", icon: <Phone className="size-4" /> },
  blog: { label: "Blog", icon: <BookOpen className="size-4" /> },
};

// Display order for groups
const GROUP_ORDER = ["appearance", "blog", "contact", "social", "seo", "business", "pricing"];

const KEY_LABELS: Record<string, string> = {
  hero_video_url: "Vidéo hero (fond de la page d'accueil)",
  hero_poster_url: "Image poster (avant chargement vidéo)",
  hero_youtube_url: "URL YouTube (fallback si la vidéo locale est absente)",
  hero_title_font: "Police du titre hero",
  footer_badge_1_url: "Badge footer #1 — Image",
  footer_badge_1_alt: "Badge footer #1 — Texte alternatif",
  footer_badge_2_url: "Badge footer #2 — Image",
  footer_badge_2_alt: "Badge footer #2 — Texte alternatif",
  footer_badge_3_url: "Badge footer #3 — Image",
  footer_badge_3_alt: "Badge footer #3 — Texte alternatif",
  contact_email: "Email de contact",
  contact_phone_fr: "Téléphone France",
  contact_phone_pt: "Téléphone Portugal",
  contact_address: "Adresse",
  social_instagram: "Instagram",
  social_facebook: "Facebook",
  social_youtube: "YouTube",
  social_tiktok: "TikTok",
  seo_site_name_fr: "Nom du site (FR)",
  seo_site_name_en: "Nom du site (EN)",
  seo_default_og_image: "Image OG par défaut",
  seo_ga4_id: "Google Analytics (GA4 ID)",
  business_name: "Raison sociale",
  business_country: "Pays",
  business_owners: "Gérants",
  business_brand_fr: "Marque (FR)",
  business_brand_en: "Marque (EN)",
  pricing_starting_price: "Prix d appel (euros)",
  pricing_currency: "Devise",
  pricing_extra_hour: "Heure supplémentaire (euros)",
  pricing_deposit_percent: "Acompte requis (%)",
  blog_hero_image: "Image hero du blog (fond du header)",
  blog_hero_title: "Titre hero du blog — FR (en majuscules)",
  blog_hero_title_en: "Titre hero du blog — EN (en majuscules)",
  blog_hero_title_font: "Police du titre blog",
  blog_hero_title_size: "Taille du titre blog",
};

// Keys that accept file uploads
const FILE_UPLOAD_KEYS: Record<string, { accept: string; type: "image" | "video"; path: string }> = {
  hero_video_url: { accept: "video/webm,video/mp4", type: "video", path: "video" },
  hero_poster_url: { accept: "image/*", type: "image", path: "video" },
  footer_badge_1_url: { accept: "image/*", type: "image", path: "badges" },
  footer_badge_2_url: { accept: "image/*", type: "image", path: "badges" },
  footer_badge_3_url: { accept: "image/*", type: "image", path: "badges" },
  blog_hero_image: { accept: "image/*", type: "image", path: "blog" },
};

// Font options for the hero title dropdown
const FONT_OPTIONS = [
  { value: "rubik", label: "Rubik — Moderne sans-serif" },
  { value: "cormorant", label: "Cormorant — Élégant serif" },
  { value: "poppins", label: "Poppins — Clean sans-serif" },
  { value: "playfair", label: "Playfair Display — Classique serif" },
  { value: "great-vibes", label: "Great Vibes — Script cursif" },
  { value: "cinzel", label: "Cinzel — Luxe serif" },
  { value: "montserrat", label: "Montserrat — Géométrique sans-serif" },
];

const SIZE_OPTIONS = [
  { value: "sm", label: "Petit" },
  { value: "md", label: "Moyen" },
  { value: "lg", label: "Grand (par défaut)" },
  { value: "xl", label: "Très grand" },
];

// Keys that use a dropdown select instead of a text input
const SELECT_KEYS: Record<string, { options: { value: string; label: string }[] }> = {
  hero_title_font: { options: FONT_OPTIONS },
  blog_hero_title_font: { options: FONT_OPTIONS },
  blog_hero_title_size: { options: SIZE_OPTIONS },
};

function FileUploadField({
  settingKey,
  currentValue,
  onUpload,
}: {
  settingKey: string;
  currentValue: string;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const config = FILE_UPLOAD_KEYS[settingKey];

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || uploading) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", config.path);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          onUpload(data.url);
        } else {
          let errMsg = `Erreur upload (${res.status})`;
          try {
            const err = await res.json();
            errMsg = err.error || errMsg;
          } catch {
            const text = await res.text();
            console.error("Upload error response:", res.status, text.slice(0, 200));
          }
          alert(errMsg);
        }
      } catch (err) {
        console.error("Upload network error:", err);
        alert("Erreur réseau — vérifiez la taille du fichier (max 100 Mo)");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [uploading, config.path, onUpload]
  );

  return (
    <div className="space-y-2">
      {/* Preview */}
      {currentValue && (
        <div className="rounded-md border border-neutral-200 p-2 bg-neutral-50">
          {config.type === "image" ? (
            <Image
              src={`https://www.lesgarssympas.com${currentValue}`}
              alt="preview"
              width={120}
              height={80}
              className="h-16 w-auto object-contain rounded"
              unoptimized
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <ImageIcon className="size-4" />
              <span className="truncate">{currentValue}</span>
            </div>
          )}
        </div>
      )}
      {/* Upload button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={config.accept}
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs"
        >
          {uploading ? (
            <Loader2 className="size-3 mr-1 animate-spin" />
          ) : (
            <Upload className="size-3 mr-1" />
          )}
          {uploading ? "Upload..." : config.type === "video" ? "Changer la vidéo" : "Changer l'image"}
        </Button>
      </div>
    </div>
  );
}

export default function SettingsClient({
  settings,
}: {
  settings: SettingsGroup;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const vals: Record<string, string> = {};
    Object.values(settings).forEach((group) => {
      group.forEach((s) => {
        vals[s.key] = s.value;
      });
    });
    return vals;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }, [saving, values]);

  // Sort groups by predefined order
  const groups = Object.keys(settings).sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a);
    const ib = GROUP_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="size-6 text-amber-600" />
            Paramètres
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configuration générale du site
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {saving ? (
            <Loader2 className="size-4 mr-1 animate-spin" />
          ) : saved ? (
            <Check className="size-4 mr-1" />
          ) : (
            <Save className="size-4 mr-1" />
          )}
          {saved ? "Sauvegardé" : "Sauvegarder"}
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-neutral-500">
            <p>Aucun paramètre configuré.</p>
            <p className="text-xs mt-1">
              Les paramètres seront ajoutés au fur et à mesure de
              l&apos;intégration site ↔ dashboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => {
          const info = GROUP_LABELS[group] || {
            label: group,
            icon: <Settings className="size-4" />,
          };

          return (
            <Card key={group}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {info.icon}
                  {info.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings[group].map((setting) => {
                  const isTextarea =
                    setting.key.includes("description") ||
                    setting.key.includes("address");
                  const isFileUpload = setting.key in FILE_UPLOAD_KEYS;

                  return (
                    <div key={setting.key} className="space-y-2">
                      <Label className="text-xs text-neutral-500">
                        {KEY_LABELS[setting.key] || setting.key}
                      </Label>

                      {setting.key in SELECT_KEYS ? (
                        <select
                          value={values[setting.key] || ""}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              [setting.key]: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          {SELECT_KEYS[setting.key].options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : isFileUpload ? (
                        <>
                          <FileUploadField
                            settingKey={setting.key}
                            currentValue={values[setting.key] || ""}
                            onUpload={(url) =>
                              setValues((prev) => ({ ...prev, [setting.key]: url }))
                            }
                          />
                          <Input
                            value={values[setting.key] || ""}
                            onChange={(e) =>
                              setValues((prev) => ({
                                ...prev,
                                [setting.key]: e.target.value,
                              }))
                            }
                            className="text-xs text-neutral-400 font-mono"
                            placeholder="URL du fichier..."
                          />
                        </>
                      ) : isTextarea ? (
                        <Textarea
                          value={values[setting.key] || ""}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              [setting.key]: e.target.value,
                            }))
                          }
                          rows={3}
                          className="text-sm resize-none"
                        />
                      ) : (
                        <Input
                          value={values[setting.key] || ""}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              [setting.key]: e.target.value,
                            }))
                          }
                          className="text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
