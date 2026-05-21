import { DashboardHistoryLinks } from "@/components/DashboardHistoryLinks";
import { DashboardInsights } from "@/components/DashboardInsights";
import { PageHeader } from "@/components/PageHeader";
import { QuickActions } from "@/components/QuickActions";
import { RecentRidesSection } from "@/components/RecentRidesSection";
import { StatCard } from "@/components/StatCard";
import { TodaySubtitle } from "@/components/TodaySubtitle";
import { es } from "@/lib/i18n/es";
import { getDashboardData } from "@/lib/queries";
import { getTodayKilometers } from "@/lib/daily-metrics";
import type { DashboardData } from "@/lib/types";
import { getProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";

const emptyDashboard: DashboardData = {
  paidIncome: 0,
  pendingIncome: 0,
  totalRides: 0,
  totalExpenses: 0,
  netProfit: 0,
  recentRides: [],
  insights: { topPaymentMethod: null, averageRideValue: 0 },
};

export default async function DashboardPage() {
  let data = emptyDashboard;
  let error: string | null = null;
  let todayKilometers = 0;
  const profile = await getProfile();

const greetingName =
  profile?.display_name?.trim() || "User";

  try {
    data = await getDashboardData();
    todayKilometers = await getTodayKilometers();
  } catch (e) {
    error =
      e instanceof Error ? e.message : es.dashboard.loadErrorGeneric;
  }

  const hasRides = data.totalRides > 0;
  const netEstimated = data.paidIncome + data.pendingIncome - data.totalExpenses;

  return (
    <>
      <PageHeader
  title={`Hola, ${greetingName}`}
  subtitleSlot={<TodaySubtitle />}
/>

      {error ? (
        <div className="mb-6 rounded-2xl border border-expense/30 bg-expense/10 p-4 text-sm text-expense">
          <p className="font-medium">{es.dashboard.loadError}</p>
          <p className="mt-1 text-expense/80">{error}</p>
        </div>
      ) : (
        <>
          <section className="mb-8" aria-label={es.dashboard.summaryAria}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {es.dashboard.summary}
            </h2>

            {/* Featured Net Estimated Card */}
            <div className="mb-4">
              <StatCard
                label={es.dashboard.netEstimated}
                value={netEstimated}
                variant={netEstimated >= 0 ? "profit" : "expense"}
                size="large"
                featured
              />
            </div>

            {/* Secondary Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                label={es.dashboard.paidToday}
                value={data.paidIncome}
                variant="profit"
                size="small"
              />

              <StatCard
                label={es.dashboard.pendingToday}
                value={data.pendingIncome}
                variant="accent"
                size="small"
              />

              <StatCard
                label={es.dashboard.expensesToday}
                value={data.totalExpenses}
                variant="expense"
                size="small"
              />

              <StatCard
                label={es.dashboard.ridesToday}
                value={data.totalRides}
                variant="accent"
                size="small"
                isCount
              />
            </div>
          </section>

          <DashboardInsights 
            insights={data.insights} 
            hasRides={hasRides}
            todayKilometers={todayKilometers}
            totalIncome={data.paidIncome + data.pendingIncome}
            totalExpenses={data.totalExpenses}
          />

          <QuickActions />

          <RecentRidesSection rides={data.recentRides} />
        </>
      )}

      <DashboardHistoryLinks />
    </>
  );
}
