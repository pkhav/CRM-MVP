import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusinessAccess } from "@/lib/auth";
import { getBusinessWorkspace } from "@/lib/crm-db";
import { businesses } from "@/lib/mock-crm";
import { createAutomationRule, queueTestMessage, updateAutomationStatus } from "./actions";

type AssistantRouteProps = {
  params: Promise<{ businessId: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return businesses.map((business) => ({ businessId: business.id }));
}

const triggers = [
  { label: "New lead created", value: "new_lead_created" },
  { label: "Lead no reply", value: "lead_no_reply" },
  { label: "Lead stale 3 days", value: "lead_stale_3_days" },
  { label: "Consult no-show", value: "consult_no_show" },
  { label: "Lead marked lost", value: "lead_marked_lost" },
];

export default async function AssistantPage({ params }: AssistantRouteProps) {
  const { businessId } = await params;
  await requireBusinessAccess(businessId);
  const business = await getBusinessWorkspace(businessId);

  if (!business) {
    notFound();
  }

  const activeRules = business.dbAutomations.filter((rule) => rule.status === "active").length;
  const queuedCount = business.dbQueuedMessages.filter((message) => message.status === "queued").length;

  return (
    <main className={`min-h-screen ${business.theme.shell} px-3 py-4 text-slate-950 sm:px-5 sm:py-6`}>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className={`rounded-lg px-4 py-5 text-white shadow-sm sm:px-5 ${business.theme.hero}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Link className="text-sm font-semibold text-white/70" href={`/dashboard/${business.id}`}>
                Back to dashboard
              </Link>
              <h1 className="mt-2 text-3xl font-bold">Automated Follow-Up Assistant</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Build text and email rules for new leads, stale leads, no-shows, and follow-up reminders.
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${business.theme.card}`}>
              {business.theme.label}
            </span>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Rules", value: business.dbAutomations.length, helper: "Total playbooks" },
            { label: "Active", value: activeRules, helper: "Currently running" },
            { label: "Queued", value: queuedCount, helper: "Messages waiting" },
            { label: "Leads watched", value: business.dbLeads.length, helper: "CRM lead pool" },
          ].map((stat) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={stat.label}>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.helper}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <form action={createAutomationRule.bind(null, business.id)} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className={`text-sm font-semibold ${business.theme.accentText}`}>Assistant builder</p>
            <h2 className="mt-1 text-xl font-bold">Create a follow-up rule</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This creates the workflow logic. Live SMS/email delivery can be connected later through Twilio, Resend, or another provider.
            </p>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Rule name
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="name" placeholder="Instant new lead reply" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Trigger
                  <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="trigger">
                    {triggers.map((trigger) => <option key={trigger.value} value={trigger.value}>{trigger.label}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Channel
                  <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="channel">
                    <option>Text</option>
                    <option>Email</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Delay minutes
                  <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" defaultValue="0" min="0" name="delayMinutes" type="number" />
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Audience
                  <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="audience" placeholder="New funnel leads" />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Message
                <textarea className="min-h-28 rounded-lg border border-slate-200 px-3 py-2 text-sm" name="message" placeholder="Hi {{firstName}}, thanks for reaching out..." />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Guardrail / fallback
                <textarea className="min-h-20 rounded-lg border border-slate-200 px-3 py-2 text-sm" name="fallbackMessage" placeholder="Stop if lead is marked scheduled or closed." />
              </label>
              <button className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${business.theme.button}`} type="submit">
                Save automation
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Follow-up playbooks</h2>
                <p className="text-sm text-slate-500">Rules are scoped to {business.name} only.</p>
              </div>
              <Link className={`rounded-lg px-3 py-2 text-center text-sm font-semibold text-white ${business.theme.button}`} href={`/dashboard/${business.id}/campaigns`}>
                Open campaigns
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {business.dbAutomations.map((rule) => (
                <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={rule.id}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${business.theme.chip}`}>
                          {rule.channel}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                          {rule.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{rule.audience} · trigger: {rule.trigger} · delay: {rule.delayMinutes} min</p>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{rule.message}</p>
                      {rule.fallbackMessage ? <p className="mt-2 text-xs font-medium text-slate-500">{rule.fallbackMessage}</p> : null}
                    </div>

                    <div className="grid gap-2 lg:w-64">
                      <form action={updateAutomationStatus.bind(null, business.id, rule.id)} className="grid grid-cols-[1fr_auto] gap-2">
                        <select className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm" defaultValue={rule.status} name="status">
                          <option>active</option>
                          <option>paused</option>
                        </select>
                        <button className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${business.theme.button}`} type="submit">
                          Save
                        </button>
                      </form>
                      <form action={queueTestMessage.bind(null, business.id, rule.id)}>
                        <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" type="submit">
                          Queue test
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold">Queued follow-ups</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {business.dbQueuedMessages.length > 0 ? business.dbQueuedMessages.map((message) => (
              <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={message.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${business.theme.chip}`}>{message.channel}</span>
                  <span className="text-xs font-semibold text-slate-500">{message.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{message.message}</p>
                <p className="mt-3 text-xs text-slate-500">Scheduled: {message.scheduledAt.toLocaleString()}</p>
              </article>
            )) : (
              <p className="text-sm text-slate-500">No follow-ups queued yet. Use “Queue test” on a rule to preview one.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
