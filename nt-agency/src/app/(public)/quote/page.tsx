import { prisma } from "@/lib/db";
import { QuoteForm } from "@/components/public/QuoteForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Get a Quote" };

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { basePrice: "asc" },
    select: { id: true, name: true, basePrice: true, pricePerFeature: true, typicalWeeks: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-3xl font-bold">Get a quote</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Tell us about your project. You&apos;ll see an instant price range, and our team will get back to you within one
        business day.
      </p>
      <QuoteForm
        services={services}
        initialServiceId={services.some((s) => s.id === service) ? service : undefined}
      />
    </div>
  );
}
