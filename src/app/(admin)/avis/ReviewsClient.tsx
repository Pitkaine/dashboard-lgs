"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GripVertical,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Review } from "@prisma/client";

interface ReviewForm {
  name: string;
  note: number;
  picture: string;
  review: string;
  source: string;
  status: string;
}

const SOURCES = [
  { value: "google", label: "Google" },
  { value: "mariages.net", label: "Mariages.net" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "autre", label: "Autre" },
];

const reviewImgUrl = (img: string) => {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("/uploads")) return img;
  return "https://www.lesgarssympas.com" + img;
};

export default function ReviewsClient({ reviews: initialReviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState<ReviewForm>({
    name: "",
    note: 5,
    picture: "",
    review: "",
    source: "google",
    status: "PUBLISHED",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", note: 5, picture: "", review: "", source: "google", status: "PUBLISHED" });
    setDialogOpen(true);
  };

  const openEdit = (review: Review) => {
    setEditing(review);
    setForm({
      name: review.name,
      note: review.note,
      picture: review.picture || "",
      review: review.review,
      source: review.source,
      status: review.status,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "reviews");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, picture: data.url }));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.review) return;
    setSaving(true);
    try {
      const url = editing ? `/api/reviews?id=${editing.id}` : "/api/reviews";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDialogOpen(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet avis ?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  // Drag & drop reorder
  const handleDragStart = (id: number) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const oldIndex = reviews.findIndex((r) => r.id === dragId);
    const newIndex = reviews.findIndex((r) => r.id === targetId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...reviews];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setReviews(reordered);
    setDragId(null);

    // Save new order
    await fetch("/api/reviews/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((r) => r.id) }),
    });
  };

  const publishedCount = reviews.filter((r) => r.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquareQuote className="size-6 text-amber-600" />
            Avis clients
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {reviews.length} avis ({publishedCount} publies)
          </p>
        </div>
        <Button onClick={openNew} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="size-4 mr-2" />
          Ajouter un avis
        </Button>
      </div>

      {/* List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-neutral-500">
            Aucun avis pour le moment
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card
              key={review.id}
              draggable
              onDragStart={() => handleDragStart(review.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(review.id)}
              className={
                "group cursor-grab active:cursor-grabbing transition-all " +
                (dragId === review.id ? "opacity-50 scale-[0.98]" : "") +
                (review.status !== "PUBLISHED" ? " opacity-60" : "")
              }
            >
              <CardContent className="p-4 flex items-start gap-4">
                {/* Drag handle */}
                <div className="pt-1 text-neutral-300 group-hover:text-neutral-500">
                  <GripVertical className="size-5" />
                </div>

                {/* Avatar */}
                {review.picture ? (
                  <div className="relative size-12 rounded-full overflow-hidden bg-neutral-100 shrink-0">
                    <Image
                      src={reviewImgUrl(review.picture)}
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-amber-700 font-bold text-lg">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900">{review.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.note }, (_, i) => (
                        <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full capitalize">
                      {review.source}
                    </span>
                    {review.status !== "PUBLISHED" && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        Brouillon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                    {review.review}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(review)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(review.id)}
                    disabled={deleting === review.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {deleting === review.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l avis" : "Nouvel avis"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Photo */}
            <div className="space-y-2">
              <Label className="text-sm">Photo (optionnel)</Label>
              <div className="flex items-center gap-3">
                {form.picture ? (
                  <div className="relative size-14 rounded-full overflow-hidden bg-neutral-100">
                    <Image src={reviewImgUrl(form.picture)} alt="Preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="size-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-xl">
                      {form.name ? form.name.charAt(0) : "?"}
                    </span>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Upload className="size-4 mr-1" />}
                    {uploading ? "Upload..." : "Photo"}
                  </Button>
                  {form.picture && (
                    <Button variant="outline" size="sm" onClick={() => setForm((prev) => ({ ...prev, picture: "" }))}>
                      Retirer
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Name + Note row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Nom</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du client"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Note</Label>
                <div className="flex gap-1 pt-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, note: n }))}
                      className="cursor-pointer"
                    >
                      <Star
                        className={
                          "size-6 transition-colors " +
                          (n <= form.note
                            ? "fill-amber-400 text-amber-400"
                            : "fill-neutral-200 text-neutral-200")
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Review text */}
            <div className="space-y-2">
              <Label className="text-sm">Avis</Label>
              <Textarea
                value={form.review}
                onChange={(e) => setForm((prev) => ({ ...prev, review: e.target.value }))}
                placeholder="Texte de l avis..."
                rows={5}
              />
            </div>

            {/* Source + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Source</Label>
                <Select value={form.source} onValueChange={(v) => setForm((prev) => ({ ...prev, source: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm((prev) => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Publie</SelectItem>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.review}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Save className="size-4 mr-1" />}
              {editing ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
