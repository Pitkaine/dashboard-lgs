"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileText,
  Plus,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Search,
  Globe,
  MapPin,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PageWithRelations {
  id: number;
  type: string;
  slug: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  contents: { language: string; title: string }[];
  seo: { language: string; metaTitle: string | null }[];
}

const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  SERVICE: { label: "Service", icon: <FileText className="size-3.5" /> },
  GEO: { label: "Géo", icon: <MapPin className="size-3.5" /> },
  LEGAL: { label: "Légal", icon: <Scale className="size-3.5" /> },
};

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-amber-100 text-amber-700",
};

export default function PagesClient({
  pages,
}: {
  pages: PageWithRelations[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = pages.filter((page) => {
    const frTitle =
      page.contents.find((c) => c.language === "fr")?.title || "";
    const enTitle =
      page.contents.find((c) => c.language === "en")?.title || "";
    const matchSearch =
      !search ||
      frTitle.toLowerCase().includes(search.toLowerCase()) ||
      enTitle.toLowerCase().includes(search.toLowerCase()) ||
      page.slug.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === "all" || page.type === typeFilter;
    const matchStatus = statusFilter === "all" || page.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette page ? Cette action est irréversible."))
      return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const res = await fetch(`/api/pages/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/pages/${data.id}`);
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pages</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez les pages du site (services, géo, légal)
          </p>
        </div>
        <Link href="/pages/new">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="size-4 mr-2" />
            Nouvelle page
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
                placeholder="Rechercher par titre ou slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
                <SelectItem value="GEO">Géo</SelectItem>
                <SelectItem value="LEGAL">Légal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PUBLISHED">Publié</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
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
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[100px]">Langues</TableHead>
                <TableHead className="w-[100px]">Statut</TableHead>
                <TableHead className="w-[150px]">Dernière modif.</TableHead>
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
                    {pages.length === 0
                      ? "Aucune page créée"
                      : "Aucun résultat pour ces filtres"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((page) => {
                  const frContent = page.contents.find(
                    (c) => c.language === "fr"
                  );
                  const enContent = page.contents.find(
                    (c) => c.language === "en"
                  );
                  const typeInfo = typeLabels[page.type] || {
                    label: page.type,
                    icon: <FileText className="size-3.5" />,
                  };
                  const hasLangs = {
                    fr: !!frContent,
                    en: !!enContent,
                  };

                  return (
                    <TableRow key={page.id} className="group">
                      <TableCell>
                        <Link
                          href={`/pages/${page.id}`}
                          className="hover:text-amber-600 transition-colors"
                        >
                          <div className="font-medium text-neutral-900">
                            {frContent?.title || enContent?.title || "Sans titre"}
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5">
                            /{page.slug}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="gap-1 font-normal"
                        >
                          {typeInfo.icon}
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge
                            variant={hasLangs.fr ? "default" : "outline"}
                            className={`text-[10px] px-1.5 py-0 ${
                              hasLangs.fr
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "text-neutral-400"
                            }`}
                          >
                            FR
                          </Badge>
                          <Badge
                            variant={hasLangs.en ? "default" : "outline"}
                            className={`text-[10px] px-1.5 py-0 ${
                              hasLangs.en
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                : "text-neutral-400"
                            }`}
                          >
                            EN
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`font-normal ${
                            statusColors[page.status] || ""
                          }`}
                        >
                          {page.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {new Date(page.updatedAt).toLocaleDateString("fr-FR", {
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
                              <Link href={`/pages/${page.id}`}>
                                <Pencil className="size-4 mr-2" />
                                Éditer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(page.id)}
                            >
                              <Copy className="size-4 mr-2" />
                              Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(page.id)}
                              disabled={deleting === page.id}
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
