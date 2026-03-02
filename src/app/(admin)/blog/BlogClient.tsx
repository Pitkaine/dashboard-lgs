"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Article } from "@prisma/client";

export default function BlogClient({ articles }: { articles: Article[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = articles.filter((a) => {
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchLang = langFilter === "all" || a.language === langFilter;
    const matchStatus =
      statusFilter === "all" || a.statut === statusFilter;
    return matchSearch && matchLang && matchStatus;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet article ? Cette action est irréversible."))
      return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-bold text-neutral-900">Blog</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez les articles du blog ({articles.length} articles)
          </p>
        </div>
        <Link href="/blog/new">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="size-4 mr-2" />
            Nouvel article
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
                placeholder="Rechercher par titre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={langFilter} onValueChange={setLangFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="1">Publié</SelectItem>
                <SelectItem value="0">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead className="w-[80px]">Langue</TableHead>
                <TableHead className="w-[100px]">Statut</TableHead>
                <TableHead className="w-[80px]">Vues</TableHead>
                <TableHead className="w-[130px]">Date</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-neutral-500"
                  >
                    {articles.length === 0
                      ? "Aucun article"
                      : "Aucun résultat pour ces filtres"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((article) => (
                  <TableRow key={article.id} className="group">
                    <TableCell>
                      <Link
                        href={`/blog/${article.id}`}
                        className="hover:text-amber-600 transition-colors"
                      >
                        <div className="font-medium text-neutral-900 line-clamp-1">
                          {article.title}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                          {article.description}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          article.language === "fr"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {article.language === "fr" ? "FR" : "EN"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`font-normal ${
                          article.statut === "1"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {article.statut === "1" ? "Publié" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <Eye className="size-3.5" />
                        {article.views}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {new Date(article.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                            <Link href={`/blog/${article.id}`}>
                              <Pencil className="size-4 mr-2" />
                              Éditer
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(article.id)}
                            disabled={deleting === article.id}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
