"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Calendar,
  MapPin,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type WeddingSummary = {
  id: number;
  slug: string;
  date: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  details: { language: string; title: string; location: string }[];
  media: { url: string; type: string; thumbnail: string | null }[];
};

export default function PortfolioClient({
  weddings,
}: {
  weddings: WeddingSummary[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = weddings.filter((w) => {
    const frDetail = w.details.find((d) => d.language === "fr");
    const enDetail = w.details.find((d) => d.language === "en");
    const matchSearch =
      !search ||
      frDetail?.title.toLowerCase().includes(search.toLowerCase()) ||
      enDetail?.title.toLowerCase().includes(search.toLowerCase()) ||
      frDetail?.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce mariage et tous ses médias ? Cette action est irréversible."))
      return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-bold text-neutral-900">Portfolio</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez les mariages du portfolio ({weddings.length} mariages)
          </p>
        </div>
        <Link href="/portfolio/new">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="size-4 mr-2" />
            Ajouter un mariage
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                placeholder="Rechercher par titre ou lieu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="PUBLISHED">Publié</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-neutral-500">
            {weddings.length === 0
              ? "Aucun mariage dans le portfolio"
              : "Aucun résultat pour ces filtres"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((wedding) => {
            const frDetail = wedding.details.find((d) => d.language === "fr");
            const coverMedia = wedding.media[0];

            return (
              <Card
                key={wedding.id}
                className="group overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Cover image */}
                <Link href={`/portfolio/${wedding.id}`}>
                  <div className="relative aspect-[16/10] bg-neutral-100">
                    {coverMedia ? (
                      <Image
                        src={coverMedia.thumbnail || coverMedia.url}
                        alt={frDetail?.title || "Mariage"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="size-12 text-neutral-300" />
                      </div>
                    )}
                    {/* Status badge overlay */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={`text-[10px] shadow-sm ${
                          wedding.status === "PUBLISHED"
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {wedding.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                  </div>
                </Link>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link href={`/portfolio/${wedding.id}`}>
                        <h3 className="font-semibold text-neutral-900 truncate hover:text-amber-600 transition-colors">
                          {frDetail?.title || "Sans titre"}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                        {frDetail?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {frDetail.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(wedding.date).toLocaleDateString("fr-FR", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {/* Language badges */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {wedding.details.map((d) => (
                          <Badge
                            key={d.language}
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              d.language === "fr"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            }`}
                          >
                            {d.language === "fr" ? "FR" : "EN"}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/portfolio/${wedding.id}`}>
                            <Pencil className="size-4 mr-2" />
                            Éditer
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(wedding.id)}
                          disabled={deleting === wedding.id}
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
          })}
        </div>
      )}
    </div>
  );
}
