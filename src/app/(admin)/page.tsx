import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  BookOpen,
  Camera,
  DollarSign,
  FileText,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [pagesCount, articlesCount, weddingsCount, plansCount] =
    await Promise.all([
      prisma.page.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count(),
      prisma.wedding.count(),
      prisma.pricingPlan.count(),
    ]);

  return { pagesCount, articlesCount, weddingsCount, plansCount };
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
  const stats = await getStats();

  const statCards = [
    {
      title: "Pages publiees",
      value: stats.pagesCount,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Articles blog",
      value: stats.articlesCount,
      icon: BookOpen,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Mariages portfolio",
      value: stats.weddingsCount,
      icon: Camera,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Formules tarifs",
      value: stats.plansCount,
      icon: DollarSign,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Tableau de bord</h1>
        <p className="text-neutral-500 mt-1">
          Vue d&apos;ensemble du site Les Gars Sympas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-neutral-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={"p-3 rounded-xl " + stat.bg}>
                    <Icon className={"size-6 " + stat.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Domain Alerts */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="size-5 text-amber-500" />
            Alertes domaines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {domainAlerts.map((alert) => (
              <div
                key={alert.domain}
                className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
              >
                <div>
                  <p className="font-medium text-neutral-900">{alert.domain}</p>
                  <p className="text-sm text-neutral-500">
                    Expire le {alert.expires}
                  </p>
                </div>
                <Badge
                  variant={
                    alert.severity === "warning" ? "destructive" : "secondary"
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
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="/blog"
              className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <BookOpen className="size-5 text-emerald-500" />
              <span className="text-sm font-medium text-neutral-700">
                Nouvel article
              </span>
            </a>
            <a
              href="/portfolio"
              className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <Camera className="size-5 text-purple-500" />
              <span className="text-sm font-medium text-neutral-700">
                Ajouter un mariage
              </span>
            </a>
            <a
              href="/pages"
              className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              <FileText className="size-5 text-blue-500" />
              <span className="text-sm font-medium text-neutral-700">
                Nouvelle page
              </span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
