import { prisma } from "@/lib/db";
import { QuoteForm } from "@/components/public/QuoteForm";
import { PageIntro } from "@/components/public/Section";

export const dynamic = "force-dynamic";
export const metadata = { title: "Get a quote" };

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { basePrice: "asc" },
    select: { id: true, name: true, basePrice: true, pricePerFeature: true, typicalWeeks: true },
  });

  return (
    <>
      <PageIntro
        eyebrow="Get a quote"
        title="Tell us what you're building."
        description="You'll see an instant price range as you go, and our team will get back to you within one business day."
      />
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <QuoteForm
          services={services}
          initialServiceId={services.some((s) => s.id === service) ? service : undefined}
        />
      </div>
    </>
  );
}
