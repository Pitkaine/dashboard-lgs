"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type PracticalContent = {
  id: number;
  language: string;
  text: string;
};

type PracticalItem = {
  id: number;
  position: number;
  status: string;
  contents: PracticalContent[];
};

type FormData = {
  status: string;
  contents: {
    fr: { text: string };
    en: { text: string };
  };
};

const emptyForm: FormData = {
  status: "PUBLISHED",
  contents: {
    fr: { text: "" },
    en: { text: "" },
  },
};

export default function PracticalClient({ items: initialItems }: { items: PracticalItem[] }) {
  const [items, setItems] = useState(initialItems);
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

  const openEdit = (item: PracticalItem) => {
    setEditingId(item.id);
    const fr = item.contents.find((c) => c.language === "fr");
    const en = item.contents.find((c) => c.language === "en");
    setForm({
      status: item.status,
      contents: {
        fr: { text: fr?.text || "" },
        en: { text: en?.text || "" },
      },
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.contents.fr.text) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/practical/${editingId}` : "/api/practical";
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
    if (!confirm("Supprimer cette information ? Cette action est irréversible.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/practical/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

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
    await fetch("/api/practical/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: items.map((p, i) => ({ id: p.id, position: i })),
      }),
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Points affichés dans la section "Informations pratiques" ({items.length} points)
          </p>
          <Button onClick={openNew} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="size-4 mr-2" />
            Nouvelle info
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]" />
                  <TableHead>Texte (FR)</TableHead>
                  <TableHead className="w-[100px]">Langues</TableHead>
                  <TableHead className="w-[100px]">Statut</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                      Aucune information
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => {
                    const fr = item.contents.find((c) => c.language === "fr");
                    return (
                      <TableRow
                        key={item.id}
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
                          <button onClick={() => openEdit(item)} className="text-left hover:text-amber-600 transition-colors">
                            <span className="text-neutral-900">{fr?.text || "Sans texte"}</span>
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.contents.map((c) => (
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
                              item.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.status === "PUBLISHED" ? "Publié" : "Brouillon"}
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
                              <DropdownMenuItem onClick={() => openEdit(item)}>
                                <Pencil className="size-4 mr-2" />
                                Éditer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(item.id)}
                                disabled={deleting === item.id}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'information" : "Nouvelle information"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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

            <Tabs defaultValue="fr">
              <TabsList className="w-full">
                <TabsTrigger value="fr" className="flex-1">Français</TabsTrigger>
                <TabsTrigger value="en" className="flex-1">English</TabsTrigger>
              </TabsList>
              {(["fr", "en"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-3">
                  <div>
                    <Label>Texte {lang === "fr" ? "(FR)" : "(EN)"}</Label>
                    <Input
                      value={form.contents[lang].text}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          contents: {
                            ...prev.contents,
                            [lang]: { text: e.target.value },
                          },
                        }))
                      }
                      placeholder={lang === "fr" ? "ex: Les frais de transport ne sont pas inclus" : "ex: Transport costs are not included"}
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
                disabled={saving || !form.contents.fr.text}
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
