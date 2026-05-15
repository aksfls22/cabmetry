import { PageHeader } from "@/components/PageHeader";
import { RideForm } from "@/components/RideForm";
import { es } from "@/lib/i18n/es";

export default function NewRidePage() {
  return (
    <>
      <PageHeader title={es.rides.newTitle} subtitle={es.rides.newSubtitle} />
      <RideForm />
    </>
  );
}
