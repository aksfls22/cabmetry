import { PageHeader } from "@/components/PageHeader";
import { ExpenseForm } from "@/components/ExpenseForm";
import { es } from "@/lib/i18n/es";

export default function NewExpensePage() {
  return (
    <>
      <PageHeader
        title={es.expenses.newTitle}
        subtitle={es.expenses.newSubtitle}
      />
      <ExpenseForm />
    </>
  );
}
