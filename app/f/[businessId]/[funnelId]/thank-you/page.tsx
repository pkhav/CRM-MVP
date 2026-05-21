import Link from "next/link";
import { notFound } from "next/navigation";
import { businesses, getFunnel } from "@/lib/mock-crm";

type ThankYouRouteProps = {
  params: Promise<{ businessId: string; funnelId: string }>;
};

export function generateStaticParams() {
  return businesses.flatMap((business) =>
    business.funnels.map((funnel) => ({
      businessId: business.id,
      funnelId: funnel.id,
    })),
  );
}

export default async function FunnelThankYouPage({ params }: ThankYouRouteProps) {
  const { businessId, funnelId } = await params;
  const match = getFunnel(businessId, funnelId);

  if (!match) {
    notFound();
  }

  const { business, funnel } = match;

  return (
    <main className={`flex min-h-screen items-center justify-center ${business.theme.shell} px-4 py-8 text-slate-950`}>
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className={`mx-auto inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${business.theme.chip}`}>
          Request received
        </span>
        <h1 className="mt-4 text-3xl font-bold">You&apos;re in.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {business.name} received your request for {funnel.name}. Their team can now follow up from the CRM.
        </p>
        <Link
          className={`mt-6 inline-flex rounded-lg px-4 py-3 text-sm font-bold text-white ${business.theme.button}`}
          href={`/f/${business.id}/${funnel.id}`}
        >
          Back to offer
        </Link>
      </section>
    </main>
  );
}
