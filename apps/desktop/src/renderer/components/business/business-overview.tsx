import { Building2, TrendingUp, Calendar, DollarSign, Users, Globe, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@orca-blitz/ui/components/ui/card";
import { Badge } from "@orca-blitz/ui/components/ui/badge";
import { Skeleton } from "@orca-blitz/ui/components/ui/skeleton";
import type { Business } from "@orca-blitz/shared";

interface BusinessOverviewProps {
  business: Business;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="truncate text-sm font-medium">{value || "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

export function BusinessOverview({ business }: BusinessOverviewProps) {
  const { t } = useTranslation("business");

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{business.name}</h1>
          <Badge variant="secondary">{business.type}</Badge>
        </div>
        {business.description && (
          <p className="text-sm text-muted-foreground max-w-2xl">{business.description}</p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label={t("overview.stats.monthlyRevenue")}
          value={business.monthlyRevenue}
        />
        <StatCard
          icon={Calendar}
          label={t("overview.stats.established")}
          value={business.yearEstablished}
        />
        <StatCard icon={Users} label={t("overview.stats.teamSize")} value={business.teamSize} />
        <StatCard icon={Globe} label={t("overview.stats.industry")} value={business.industry} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-muted-foreground" />
              {t("overview.sections.productsAudience")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label={t("overview.labels.products")} value={business.products} />
            <InfoRow label={t("overview.labels.audience")} value={business.audience} />
            {business.goals.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("overview.labels.goals")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {business.goals.map((g) => (
                    <Badge key={g} variant="outline" className="text-muted-foreground">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              {t("overview.sections.marketPosition")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label={t("overview.labels.usp")} value={business.usp} />
            <InfoRow label={t("overview.labels.competitors")} value={business.competitors} />
            <InfoRow label={t("overview.labels.painPoints")} value={business.painPoints} />
          </CardContent>
        </Card>
      </div>

      {(business.channels.length > 0 || business.website) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              {t("overview.sections.channelsPresence")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {business.website && (
              <InfoRow label={t("overview.labels.website")} value={business.website} />
            )}
            {business.channels.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("overview.labels.activeChannels")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {business.channels.map((ch) => (
                    <Badge key={ch} variant="secondary">
                      {ch}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function BusinessOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} size="sm">
            <CardContent>
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
