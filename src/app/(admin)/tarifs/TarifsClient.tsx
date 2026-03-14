"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PlanSummary = {
  id: number;
  slug: string;
  price: string;
  isPopular: boolean;
  position: number;
  status: string;
  contents: { language: string; name: string; subtitle: string | null }[];
  features: { language: string; text: string; included: boolean }[];
};

export default function TarifsClient({ plans }: { plans: PlanSummary[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [items, setItems] = useState(plans);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette formule ? Cette action est irréversible."))
      return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/tarifs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  };

  // Drag & drop reorder
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

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
    // Save new order
    setReordering(true);
    try {
      await fetch("/api/tarifs/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: items.map((p, i) => ({ id: p.id, position: i })),
        }),
      });
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          
          <p className="text-sm text-neutral-500 mt-1">
          </p>
        </div>
        <Link href="/tarifs/new">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="size-4 mr-2" />
            Nouvelle formule
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]" />
                <TableHead>Formule</TableHead>
                <TableHead className="w-[120px]">Prix</TableHead>
                <TableHead className="w-[100px]">Langues</TableHead>
                <TableHead className="w-[100px]">Statut</TableHead>
                <TableHead className="w-[100px]">Features</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-neutral-500"
                  >
                    Aucune formule
                  </TableCell>
                </TableRow>
              ) : (
                items.map((plan, index) => {
                  const frContent = plan.contents.find(
                    (c) => c.language === "fr"
                  );
                  const frFeatureCount = plan.features.filter(
                    (f) => f.language === "fr"
                  ).length;

                  return (
                    <TableRow
                      key={plan.id}
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
                        <Link
                          href={`/tarifs/${plan.id}`}
                          className="hover:text-amber-600 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">
                              {frContent?.name || "Sans nom"}
                            </span>
                            {plan.isPopular && (
                              <Star className="size-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          {frContent?.subtitle && (
                            <div className="text-xs text-neutral-400 mt-0.5">
                              {frContent.subtitle}
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-neutral-900">
                          {plan.price}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {plan.contents.map((c) => (
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
                            plan.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {plan.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-neutral-500">
                          {frFeatureCount} features
                        </span>
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
                            <DropdownMenuItem asChild>
                              <Link href={`/tarifs/${plan.id}`}>
                                <Pencil className="size-4 mr-2" />
                                Éditer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(plan.id)}
                              disabled={deleting === plan.id}
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
  );
}
