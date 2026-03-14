export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  BookOpen,
  Camera,
  DollarSign,
  Eye,
  FileText,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [pagesCount, articlesCount, weddingsCount, plansCount, teamCount, totalViews] =
    await Promise.all([
      prisma.page.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count(),
      prisma.wedding.count(),
      prisma.pricingPlan.count(),
      prisma.team.count(),
      prisma.article.aggregate({ _sum: { views: true } }),
    ]);

  return {
    pagesCount,
    articlesCount,
    weddingsCount,
    plansCount,
    teamCount,
    totalViews: totalViews._sum.views || 0,
  };
}

async function getRecentArticles() {
  return prisma.article.findMany({
    select: { id: true, title: true, language: true, views: true, statut: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

async function getTopArticles() {
  return prisma.article.findMany({
    select: { id: true, title: true, language: true, views: true },
    orderBy: { views: "desc" },
    take: 5,
  });
}

const domainAlerts = [
  {
    domain: "overviewagency.com",
    expires: "26 avril 2026",
    severity: "warning" as const,
  },
  {
    domain: "lesgarsympas.fr",
    expires: "15 juillet 2026",
    severity: "info" as const,
  },
];

export default async function DashboardPage() {
  const [stats, recentArticles, topArticles] = await Promise.all([
    getStats(),
    getRecentArticles(),
    getTopArticles(),
  ]);

  const statCards = [
    {
      title: "Pages publiees",
      value: stats.pagesCount,
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      href: "/pages",
    },
    {
      title: "Articles blog",
      value: stats.articlesCount,
      icon: BookOpen,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      href: "/blog",
    },
    {
      title: "Mariages",
      value: stats.weddingsCount,
      icon: Camera,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      href: "/portfolio",
    },
    {
      title: "Vues totales",
      value: stats.totalViews,
      icon: Eye,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      href: "/blog",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground mt-1">
          Vue d&apos;ensemble du site Les Gars Sympas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className={"p-3 rounded-xl " + stat.bg}>
                      <Icon className={"size-6 " + stat.color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Two columns: Recent + Top articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent articles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="size-5 text-emerald-400" />
              Articles recents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun article</p>
            ) : (
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={"/blog/" + article.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(article.createdAt).toLocaleDateString(
                          "fr-FR",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge
                        variant="outline"
                        className={
                          article.language === "fr"
                            ? "text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-400 border-purple-500/30"
                        }
                      >
                        {article.language === "fr" ? "FR" : "EN"}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="size-3" />
                        {article.views}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top articles by views */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="size-5 text-amber-400" />
              Articles populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun article</p>
            ) : (
              <div className="space-y-3">
                {topArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={"/blog/" + article.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <span
                      className={
                        "text-lg font-bold w-6 text-center " +
                        (index === 0
                          ? "text-amber-400"
                          : index === 1
                          ? "text-muted-foreground"
                          : index === 2
                          ? "text-amber-600"
                          : "text-muted-foreground/50")
                      }
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {article.title}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground shrink-0">
                      <Eye className="size-3.5" />
                      {article.views}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Domain Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="size-5 text-amber-400" />
            Alertes domaines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {domainAlerts.map((alert) => (
              <div
                key={alert.domain}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {alert.domain}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expire le {alert.expires}
                  </p>
                </div>
                <Badge
                  variant={
                    alert.severity === "warning"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {alert.severity === "warning" ? "Urgent" : "A surveiller"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/blog/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors"
            >
              <BookOpen className="size-5 text-emerald-400" />
              <span className="text-sm font-medium text-foreground">
                Nouvel article
              </span>
            </Link>
            <Link
              href="/portfolio/new"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors"
            >
              <Camera className="size-5 text-purple-400" />
              <span className="text-sm font-medium text-foreground">
                Ajouter un mariage
              </span>
            </Link>
            <Link
              href="/equipe"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors"
            >
              <Users className="size-5 text-amber-400" />
              <span className="text-sm font-medium text-foreground">
                Gerer l&apos;equipe
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
