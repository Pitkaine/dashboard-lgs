"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  GripVertical,
  Save,
  X,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

type FaqContentItem = {
  id: number;
  language: string;
  question: string;
  answer: string;
};

type FaqItemType = {
  id: number;
  position: number;
  status: string;
  contents: FaqContentItem[];
};

type FormData = {
  status: string;
  fr: { question: string; answer: string };
  en: { question: string; answer: string };
};

const emptyForm: FormData = {
  status: "PUBLISHED",
  fr: { question: "", answer: "" },
  en: { question: "", answer: "" },
};

export default function FaqClient({ items: initial }: { items: FaqItemType[] }) {
  const [items, setItems] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"fr" | "en">("fr");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Open dialog for new item
  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActiveTab("fr");
    setDialogOpen(true);
  };

  // Open dialog for editing
  const openEdit = (item: FaqItemType) => {
    setEditingId(item.id);
    const fr = item.contents.find((c) => c.language === "fr");
    const en = item.contents.find((c) => c.language === "en");
    setForm({
      status: item.status,
      fr: { question: fr?.question || "", answer: fr?.answer || "" },
      en: { question: en?.question || "", answer: en?.answer || "" },
    });
    setActiveTab("fr");
    setDialogOpen(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.fr.question.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/faq/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
          setDialogOpen(false);
        }
      } else {
        // Create
        const res = await fetch("/api/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setItems((prev) => [...prev, created]);
          setDialogOpen(false);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette question ? Cette action est irréversible.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/faq/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  // Toggle status
  const handleToggleStatus = async (item: FaqItemType) => {
    const newStatus = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/faq/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        fr: (() => {
          const c = item.contents.find((c) => c.language === "fr");
          return { question: c?.question || "", answer: c?.answer || "" };
        })(),
        en: (() => {
          const c = item.contents.find((c) => c.language === "en");
          return { question: c?.question || "", answer: c?.answer || "" };
        })(),
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    }
  };

  // Drag & drop reorder
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
    await fetch("/api/faq/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: items.map((i, idx) => ({ id: i.id, position: idx })),
      }),
    });
  };

  const publishedCount = items.filter((i) => i.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">FAQ</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez les questions fréquentes ({publishedCount} publiées sur {items.length})
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="size-4 mr-2" />
          Nouvelle question
        </Button>
      </div>

      {/* FAQ List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-neutral-500">
              <HelpCircle className="size-10 mx-auto mb-3 text-neutral-300" />
              <p>Aucune question dans la FAQ</p>
              <p className="text-sm mt-1">Cliquez sur &quot;Nouvelle question&quot; pour commencer</p>
            </CardContent>
          </Card>
        ) : (
          items.map((item, index) => {
            const fr = item.contents.find((c) => c.language === "fr");
            const en = item.contents.find((c) => c.language === "en");
            const isDraft = item.status === "DRAFT";

            return (
              <Card
                key={item.id}
                className={`group transition-all ${
                  isDraft ? "opacity-60 border-dashed" : ""
                } ${draggedIndex === index ? "ring-2 ring-amber-400" : ""}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Drag handle */}
                    <div className="pt-1 cursor-grab active:cursor-grabbing">
                      <GripVertical className="size-4 text-neutral-300" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-neutral-400">
                          Q{index + 1}
                        </span>
                        <div className="flex gap-1">
                          {fr && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200"
                            >
                              FR
                            </Badge>
                          )}
                          {en && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200"
                            >
                              EN
                            </Badge>
                          )}
                        </div>
                        <Badge
                          className={`text-[10px] font-normal ${
                            isDraft
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isDraft ? "Brouillon" : "Publié"}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-neutral-900 text-sm leading-snug">
                        {fr?.question || en?.question || "Sans question"}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {fr?.answer || en?.answer || "Sans réponse"}
                      </p>
                    </div>

                    {/* Actions */}
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
                        <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                          {isDraft ? (
                            <>
                              <Eye className="size-4 mr-2" />
                              Publier
                            </>
                          ) : (
                            <>
                              <EyeOff className="size-4 mr-2" />
                              Brouillon
                            </>
                          )}
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
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier la question" : "Nouvelle question"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Status toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="faq-status" className="text-sm font-medium">
                Statut
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">
                  {form.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                </span>
                <Switch
                  id="faq-status"
                  checked={form.status === "PUBLISHED"}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, status: checked ? "PUBLISHED" : "DRAFT" }))
                  }
                />
              </div>
            </div>

            {/* Language tabs */}
            <div className="flex gap-1 border-b border-neutral-200">
              {(["fr", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === lang
                      ? "border-amber-600 text-amber-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {lang === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
                </button>
              ))}
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Question {activeTab === "fr" ? "(FR)" : "(EN)"}
                  {activeTab === "fr" && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  value={form[activeTab].question}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [activeTab]: { ...f[activeTab], question: e.target.value },
                    }))
                  }
                  placeholder={
                    activeTab === "fr"
                      ? "Entrez la question en français..."
                      : "Enter the question in English..."
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Réponse {activeTab === "fr" ? "(FR)" : "(EN)"}
                </Label>
                <Textarea
                  value={form[activeTab].answer}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [activeTab]: { ...f[activeTab], answer: e.target.value },
                    }))
                  }
                  placeholder={
                    activeTab === "fr"
                      ? "Entrez la réponse en français..."
                      : "Enter the answer in English..."
                  }
                  rows={5}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Preview of the other language */}
            {form[activeTab === "fr" ? "en" : "fr"].question && (
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="text-xs text-neutral-400 mb-1">
                  {activeTab === "fr" ? "🇬🇧 English version" : "🇫🇷 Version française"}
                </p>
                <p className="text-sm font-medium text-neutral-700">
                  {form[activeTab === "fr" ? "en" : "fr"].question}
                </p>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {form[activeTab === "fr" ? "en" : "fr"].answer}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                <X className="size-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.fr.question.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Save className="size-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
