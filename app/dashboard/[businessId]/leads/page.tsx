import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusinessAccess } from "@/lib/auth";
import { getBusinessWorkspace } from "@/lib/crm-db";
import { businesses } from "@/lib/mock-crm";
import { createManualLead, updateLeadStatus } from "./actions";

type LeadsRouteProps = {
  params: Promise<{ businessId: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return businesses.map((business) => ({ businessId: business.id }));
}

const statuses = ["new", "contacted", "scheduled", "closed", "lost"];

export default async function LeadsPage({ params }: LeadsRouteProps) {
  const { businessId } = await params;
  await requireBusinessAccess(businessId);
  const business = await getBusinessWorkspace(businessId);

  if (!business) {
    notFound();
  }

  return (
    <main className={`min-h-screen ${business.theme.shell} px-3 py-4 text-slate-950 sm:px-5 sm:py-6`}>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className={`rounded-lg px-4 py-5 text-white shadow-sm sm:px-5 ${business.theme.hero}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Link className="text-sm font-semibold text-white/70" href={`/dashboard/${business.id}`}>
                Back to dashboard
              </Link>
              <h1 className="mt-2 text-3xl font-bold">Lead workflow</h1>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Manage only {business.name}&apos;s leads, statuses, revenue, and follow-up notes.
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${business.theme.card}`}>
              {business.theme.label}
            </span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <form action={createManualLead.bind(null, business.id)} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold">Add lead manually</h2>
            <div className="mt-4 grid gap-3">
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="name" placeholder="Lead name" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="phone" placeholder="Phone" />
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="email" placeholder="Email" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="source" placeholder="Source" />
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="service" placeholder="Service interest" />
              </div>
              <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="estimatedValue" placeholder="Estimated value" type="number" />
              <textarea className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm" name="notes" placeholder="Notes" />
              <button className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${business.theme.button}`} type="submit">
                Save lead
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Pipeline</h2>
                <p className="text-sm text-slate-500">{business.dbLeads.length} leads stored for this business.</p>
              </div>
              <Link className={`rounded-lg px-3 py-2 text-center text-sm font-semibold text-white ${business.theme.button}`} href={`/dashboard/${business.id}#funnels`}>
                Manage funnels
              </Link>
            </div>

            <div className="mt-4 hidden overflow-hidden rounded-lg border border-slate-200 xl:block">
              <div className="grid grid-cols-[1fr_0.9fr_0.7fr_0.8fr_1.1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Lead</span>
                <span>Service</span>
                <span>Source</span>
                <span>Value</span>
                <span>Status</span>
              </div>
              {business.dbLeads.map((lead) => (
                <div className="grid grid-cols-[1fr_0.9fr_0.7fr_0.8fr_1.1fr] items-center border-t border-slate-200 px-4 py-3 text-sm" key={lead.id}>
                  <div>
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-slate-500">{lead.email ?? lead.phone}</p>
                  </div>
                  <span className="text-slate-600">{lead.service ?? "Lead inquiry"}</span>
                  <span className="text-slate-600">{lead.source}</span>
                  <span className="font-semibold">${Math.round(lead.estimatedValue).toLocaleString()}</span>
                  <form action={updateLeadStatus.bind(null, business.id, lead.id)} className="grid grid-cols-[1fr_96px_auto] gap-2">
                    <select className="rounded-lg border border-slate-200 px-2 py-2 text-xs" defaultValue={lead.status} name="status">
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <input className="rounded-lg border border-slate-200 px-2 py-2 text-xs" defaultValue={lead.closedValue || lead.estimatedValue} name="closedValue" type="number" />
                    <button className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${business.theme.button}`} type="submit">
                      Save
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 xl:hidden">
              {business.dbLeads.map((lead) => (
                <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={lead.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{lead.firstName} {lead.lastName}</h3>
                      <p className="mt-1 text-sm text-slate-600">{lead.service ?? "Lead inquiry"}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${business.theme.chip}`}>{lead.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{lead.source} · ${Math.round(lead.estimatedValue).toLocaleString()}</p>
                  <form action={updateLeadStatus.bind(null, business.id, lead.id)} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <select className="rounded-lg border border-slate-200 px-2 py-2 text-sm" defaultValue={lead.status} name="status">
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <input className="rounded-lg border border-slate-200 px-2 py-2 text-sm" defaultValue={lead.closedValue || lead.estimatedValue} name="closedValue" type="number" />
                    <button className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${business.theme.button}`} type="submit">
                      Save
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
