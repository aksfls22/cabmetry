import { PageHeader } from "@/components/PageHeader";
import { RideHistoryList } from "@/components/HistoryList";
import { es } from "@/lib/i18n/es";
import { getRides } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RidesHistoryPage() {
  let rides: Awaited<ReturnType<typeof getRides>> = [];
  let error: string | null = null;

  try {
    rides = await getRides();
  } catch (e) {
    error = e instanceof Error ? e.message : es.rides.loadError;
  }

  return (
    <>
      <PageHeader
        title={es.rides.historyTitle}
        subtitle={es.dashboard.records(rides.length)}
      />
      {error ? (
        <p className="text-expense text-sm">{error}</p>
      ) : (
        <RideHistoryList rides={rides} />
      )}
    </>
  );
}
