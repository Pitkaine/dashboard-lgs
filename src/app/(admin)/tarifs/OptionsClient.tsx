"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  GripVertical,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";

type OptionContent = {
  id: number;
  language: string;
  name: string;
  description: string;
};

type OptionItem = {
  id: number;
  price: string | null;
  position: number;
  status: string;
  contents: OptionContent[];
};

type FormData = {
  price: string;
  status: string;
  contents: {
    fr: { name: string; description: string };
    en: { name: string; description: string };
  };
};

const emptyForm: FormData = {
  price: "",
  status: "PUBLISHED",
  contents: {
    fr: { name: "", description: "" },
    en: { name: "", description: "" },
  },
};

export default function OptionsClient({ options: initialOptions }: { options: OptionItem[] }) {
  const [items, setItems] = useState(initialOptions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (opt: OptionItem) => {
    setEditingId(opt.id);
    const fr = opt.contents.find((c) => c.language === "fr");
    const en = opt.contents.find((c) => c.language === "en");
    setForm({
      price: opt.price || "",
      status: opt.status,
      contents: {
        fr: { name: fr?.name || "", description: fr?.description || "" },
        en: { name: en?.name || "", description: en?.description || "" },
      },
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.contents.fr.name) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/options/${editingId}` : "/api/options";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editingId) {
          setItems((prev) => prev.map((p) => (p.id === editingId ? saved : p)));
        } else {
          setItems((prev) => [...prev, saved]);
        }
        setDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette option ? Cette action est irréversible.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/options/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  // Drag & drop
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setItems((prev) => {
      const next = [...prev];
      const dragged = next[draggedIndex];
      next.splice(draggedIndex, 1);
      next.splice(index, 0, dragged);
      return next.map((p, i) => ({ ...p, position: i }));
    });
    setDraggedIndex(index);
  };
  const handleDragEnd = async () => {
    setDraggedIndex(null);
    await fetch("/api/options/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: items.map((p, i) => ({ id: p.id, position: i })),
      }),
    });
  };

  const updateContent = (lang: "fr" | "en", field: "name" | "description", value: string) => {
    setForm((prev) => ({
      ...prev,
      contents: {
        ...prev.contents,
        [lang]: { ...prev.contents[lang], [field]: value },
      },
    }));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Options affichées sur la page tarifs ({items.length} options) — les prix sont masqués côté public
          </p>
          <Button onClick={openNew} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="size-4 mr-2" />
            Nouvelle option
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]" />
                  <TableHead>Option</TableHead>
                  <TableHead className="w-[120px]">Prix (admin)</TableHead>
                  <TableHead className="w-[100px]">Langues</TableHead>
                  <TableHead className="w-[100px]">Statut</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                      Aucune option
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((opt, index) => {
                    const fr = opt.contents.find((c) => c.language === "fr");
                    return (
                      <TableRow
                        key={opt.id}
                        className="group"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <TableCell>
                          <GripVertical className="size-4 text-neutral-300 cursor-grab active:cursor-grabbing" />
                        </TableCell>
                        <TableCell>
                          <button onClick={() => openEdit(opt)} className="text-left hover:text-amber-600 transition-colors">
                            <span className="font-medium text-neutral-900">{fr?.name || "Sans nom"}</span>
                            {fr?.description && (
                              <div className="text-xs text-neutral-400 mt-0.5">{fr.description}</div>
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-neutral-500">{opt.price || "—"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {opt.contents.map((c) => (
                              <Badge
                                key={c.language}
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${
                                  c.language === "fr"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-purple-50 text-purple-700 border-purple-200"
                                }`}
                              >
                                {c.language === "fr" ? "FR" : "EN"}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`font-normal ${
                              opt.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {opt.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(opt)}>
                                <Pencil className="size-4 mr-2" />
                                Éditer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(opt.id)}
                                disabled={deleting === opt.id}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="size-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'option" : "Nouvelle option"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prix (admin uniquement)</Label>
                <Input
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="ex: 350 €"
                />
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="fr">
              <TabsList className="w-full">
                <TabsTrigger value="fr" className="flex-1">Français</TabsTrigger>
                <TabsTrigger value="en" className="flex-1">English</TabsTrigger>
              </TabsList>
              {(["fr", "en"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-3">
                  <div>
                    <Label>Nom {lang === "fr" ? "(FR)" : "(EN)"}</Label>
                    <Input
                      value={form.contents[lang].name}
                      onChange={(e) => updateContent(lang, "name", e.target.value)}
                      placeholder={lang === "fr" ? "ex: Teaser 1-2 min" : "ex: 1-2 min Teaser"}
                    />
                  </div>
                  <div>
                    <Label>Description {lang === "fr" ? "(FR)" : "(EN)"}</Label>
                    <Textarea
                      value={form.contents[lang].description}
                      onChange={(e) => updateContent(lang, "description", e.target.value)}
                      placeholder={lang === "fr" ? "ex: Livraison sous 1 à 3 semaines" : "ex: Delivered within 1-3 weeks"}
                      rows={2}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="size-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.contents.fr.name}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Save className="size-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
