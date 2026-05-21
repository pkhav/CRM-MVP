import Link from "next/link";
import { notFound } from "next/navigation";
import { businesses, getFunnel } from "@/lib/mock-crm";
import { ensureDemoData } from "@/lib/crm-db";

type FunnelRouteProps = {
  params: Promise<{ businessId: string; funnelId: string }>;
  searchParams: Promise<{ submitted?: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return businesses.flatMap((business) =>
    business.funnels.map((funnel) => ({
      businessId: business.id,
      funnelId: funnel.id,
    })),
  );
}

export default async function FunnelPortalPage({ params, searchParams }: FunnelRouteProps) {
  await ensureDemoData();
  const { businessId, funnelId } = await params;
  const { submitted } = await searchParams;
  const match = getFunnel(businessId, funnelId);

  if (!match) {
    notFound();
  }

  const { business, funnel } = match;

  return (
    <main className={`min-h-screen ${business.theme.shell} px-4 py-5 text-slate-950 sm:px-6 lg:px-8`}>
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <section className={`rounded-lg px-5 py-6 text-white shadow-sm sm:p-8 ${business.theme.hero}`}>
          <div className="flex h-full flex-col justify-between gap-8">
            <div>
              <p className="text-sm font-semibold text-white/70">{business.name}</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{funnel.headline}</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/75">{funnel.offer}</p>
            </div>

            <div className={`rounded-lg border p-4 ${business.theme.card}`}>
              <p className="text-sm font-semibold">{business.theme.label} lead portal</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-bold">{funnel.leads}</p>
                  <p className="text-xs opacity-70">Leads captured</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{funnel.conversion}</p>
                  <p className="text-xs opacity-70">Conversion</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{business.location}</p>
                  <p className="text-xs opacity-70">Market</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className={`text-sm font-semibold ${business.theme.accentText}`}>{funnel.name}</p>
              <h2 className="mt-1 text-2xl font-bold">Request your spot</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This form would save directly into {business.name}&apos;s CRM as a new lead.
              </p>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${business.theme.chip}`}>
              {funnel.channel}
            </span>
          </div>

          {submitted === "1" ? (
            <div className={`mt-6 rounded-lg border p-4 ${business.theme.card}`}>
              <p className="text-lg font-bold">You&apos;re in.</p>
              <p className="mt-2 text-sm leading-6 opacity-75">
                Your request was saved in {business.name}&apos;s CRM as a new lead.
              </p>
            </div>
          ) : null}

          <form action={`/api/funnels/${business.id}/${funnel.id}/submit`} className="mt-6 grid gap-3" method="post">
            {funnel.fields.map((field) => (
              <label className="grid gap-1 text-sm font-medium text-slate-700" key={field}>
                {field}
                {field.toLowerCase().includes("goal") ||
                field.toLowerCase().includes("interest") ||
                field.toLowerCase().includes("notes") ||
                field.toLowerCase().includes("concern") ? (
                  <textarea
                    className="min-h-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    name={field}
                    placeholder={`Tell us about your ${field.toLowerCase()}`}
                  />
                ) : (
                  <input
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    name={field}
                    placeholder={field}
                  />
                )}
              </label>
            ))}

            <button className={`mt-2 rounded-lg px-4 py-3 text-sm font-bold text-white ${business.theme.button}`} type="submit">
              {funnel.cta}
            </button>
          </form>

          <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-3">
            <p>Auto-tags source: {funnel.channel}</p>
            <p>Assigns owner: {business.owner}</p>
            <p>Stores under: {business.theme.label}</p>
          </div>

          <Link
            className="mt-5 inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href={`/dashboard/${business.id}`}
          >
            Back to dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}
