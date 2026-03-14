"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Pencil, Plus, Save, Trash2, Upload, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Team } from "@prisma/client";

interface MemberForm {
  name: string;
  job: string;
  job2: string;
  img: string;
  imgPosition: string;
}

const POSITION_OPTIONS = [
  { value: "top left", label: "\u2196" },
  { value: "top center", label: "\u2191" },
  { value: "top right", label: "\u2197" },
  { value: "center left", label: "\u2190" },
  { value: "center", label: "\u25CF" },
  { value: "center right", label: "\u2192" },
  { value: "bottom left", label: "\u2199" },
  { value: "bottom center", label: "\u2193" },
  { value: "bottom right", label: "\u2198" },
];

export default function TeamClient({ members }: { members: Team[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState<MemberForm>({
    name: "",
    job: "",
    job2: "",
    img: "",
    imgPosition: "center",
  });
  const JOB_LABELS: Record<string, string> = {
    job1: "R\u00e9alisateur",
    job2: "Photographe",
    job3: "Vid\u00e9aste",
    job4: "Monteur",
    job5: "Directrice artistique",
    job6: "Fondateur",
  };
  const jobLabel = (key: string) => JOB_LABELS[key] || key;
  const teamImgUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return "https://www.lesgarssympas.com" + img;
    return "https://www.lesgarssympas.com/api/uploads/team/" + img;
  };
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", job: "", job2: "", img: "", imgPosition: "center" });
    setDialogOpen(true);
  };

  const openEdit = (member: Team) => {
    setEditing(member);
    setForm({
      name: member.name,
      job: member.job,
      job2: member.job2,
      img: member.img,
      imgPosition: member.imgPosition || "center",
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "team");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, img: data.filename }));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.job) return;
    setSaving(true);

    try {
      const url = editing ? `/api/team/${editing.id}` : "/api/team";
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
    if (!confirm("Supprimer ce membre ?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Users className="size-6 text-amber-600" />
            Équipe
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez les membres de l&apos;équipe ({members.length} membres)
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="size-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>

      {/* Grid */}
      {members.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-neutral-500">
            Aucun membre dans l&apos;équipe
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="group overflow-hidden">
              <div className="relative aspect-square bg-neutral-100">
                {member.img ? (
                  <Image
                    src={teamImgUrl(member.img)}
                    alt={member.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: member.imgPosition || "center" }}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="size-16 text-neutral-300" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openEdit(member)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Pencil className="size-3.5 mr-1" />
                    Éditer
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDelete(member.id)}
                    disabled={deleting === member.id}
                    className="bg-white/90 hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-neutral-900">{member.name}</h3>
                <p className="text-sm text-neutral-500">{jobLabel(member.job)}</p>
                {member.job2 && (
                  <p className="text-xs text-neutral-400">{jobLabel(member.job2)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for add/edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le membre" : "Nouveau membre"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Photo */}
            <div className="space-y-2">
              <Label className="text-sm">Photo</Label>
              <div className="flex items-center gap-3">
                {form.img ? (
                  <div className="relative size-16 rounded-full overflow-hidden bg-neutral-100 border-2 border-amber-200">
                    <Image
                      src={teamImgUrl(form.img)}
                      alt="Preview"
                      fill
                      className="object-cover"
                      style={{ objectPosition: form.imgPosition }}
                    />
                  </div>
                ) : (
                  <div className="size-16 rounded-full bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300">
                    <Users className="size-6 text-neutral-300" />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <Upload className="size-4 mr-1" />
                  )}
                  {uploading ? "Upload..." : "Changer"}
                </Button>
              </div>
            </div>

            {/* Image position selector */}
            {form.img && (
              <div className="space-y-2">
                <Label className="text-sm">Position dans le cercle</Label>
                <div className="flex items-center gap-4">
                  <div className="grid grid-cols-3 gap-1">
                    {POSITION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, imgPosition: opt.value }))
                        }
                        className={`size-8 rounded text-xs font-bold flex items-center justify-center transition-all ${
                          form.imgPosition === opt.value
                            ? "bg-amber-600 text-white shadow-sm"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="relative size-24 rounded-full overflow-hidden bg-neutral-100 border-2 border-amber-200 flex-shrink-0">
                    <Image
                      src={teamImgUrl(form.img)}
                      alt="Position preview"
                      fill
                      className="object-cover"
                      style={{ objectPosition: form.imgPosition }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm">Nom</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Peter"
              />
            </div>

            {/* Job */}
            <div className="space-y-2">
              <Label className="text-sm">Métier principal</Label>
              <Input
                value={form.job}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, job: e.target.value }))
                }
                placeholder="Vidéaste"
              />
            </div>

            {/* Job2 */}
            <div className="space-y-2">
              <Label className="text-sm">Métier secondaire</Label>
              <Input
                value={form.job2}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, job2: e.target.value }))
                }
                placeholder="Photographe"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.job}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Save className="size-4 mr-1" />
              )}
              {editing ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
