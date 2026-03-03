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
import { Plus, MoreVertical, Pencil, Globe, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type GeoPageSummary = {
  id: number;
  slug: string;
  status: string;
  updatedAt: Date;
  contents: { language: string; title: string }[];
};

export default function GeoClient({ pages }: { pages: GeoPageSummary[] }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <MapPin className="size-6 text-amber-600" />
            Pages géographiques
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Pages de destination par ville/région ({pages.length} pages)
          </p>
        </div>
        <Link href="/pages/new">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="size-4 mr-2" />
            Nouvelle page géo
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="w-[200px]">Slug</TableHead>
                <TableHead className="w-[100px]">Langues</TableHead>
                <TableHead className="w-[100px]">Statut</TableHead>
                <TableHead className="w-[130px]">Modifié</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-neutral-500"
                  >
                    Aucune page géographique
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => {
                  const frContent = page.contents.find(
                    (c) => c.language === "fr"
                  );

                  return (
                    <TableRow key={page.id} className="group">
                      <TableCell>
                        <Link
                          href={`/pages/${page.id}`}
                          className="hover:text-amber-600 transition-colors"
                        >
                          <div className="font-medium text-neutral-900 flex items-center gap-2">
                            <Globe className="size-4 text-neutral-400" />
                            {frContent?.title || "Sans titre"}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded">
                          /{page.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {page.contents.map((c) => (
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
                            page.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {page.status === "PUBLISHED"
                            ? "Publié"
                            : "Brouillon"}
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

      <p className="text-xs text-neutral-400">
        Les pages géographiques sont des Pages de type &quot;GEO&quot;. Cliquez sur
        &quot;Éditer&quot; pour ouvrir l&apos;éditeur de pages complet.
      </p>
    </div>
  );
}
