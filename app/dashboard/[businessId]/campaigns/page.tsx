import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusinessAccess } from "@/lib/auth";
import { getBusinessWorkspace } from "@/lib/crm-db";
import { businesses } from "@/lib/mock-crm";
import { createCampaign, updateCampaignStatus } from "./actions";

type CampaignsRouteProps = {
  params: Promise<{ businessId: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return businesses.map((business) => ({ businessId: business.id }));
}

const channels = ["Email", "Text", "Social"];
const statuses = ["draft", "scheduled", "sent", "paused"];

export default async function CampaignsPage({ params }: CampaignsRouteProps) {
  const { businessId } = await params;
  await requireBusinessAccess(businessId);
  const business = await getBusinessWorkspace(businessId);

  if (!business) {
    notFound();
  }

  const draftCount = business.dbCampaigns.filter((campaign) => campaign.status === "draft").length;
  const sentCount = business.dbCampaigns.filter((campaign) => campaign.status === "sent").length;

  return (
    <main className={`min-h-screen ${business.theme.shell} px-3 py-4 text-slate-950 sm:px-5 sm:py-6`}>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className={`rounded-lg px-4 py-5 text-white shadow-sm sm:px-5 ${business.theme.hero}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Link className="text-sm font-semibold text-white/70" href={`/dashboard/${business.id}`}>
                Back to dashboard
              </Link>
              <h1 className="mt-2 text-3xl font-bold">Campaign Center</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Create email, text, and social campaigns that send leads back to this business&apos;s funnel links.
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${business.theme.card}`}>
              {business.theme.label}
            </span>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Campaigns", value: business.dbCampaigns.length, helper: "Total created" },
            { label: "Drafts", value: draftCount, helper: "Ready to edit" },
            { label: "Sent", value: sentCount, helper: "Marked sent" },
            { label: "Funnels", value: business.dbFunnels.length, helper: "Available links" },
          ].map((stat) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={stat.label}>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.helper}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <form action={createCampaign.bind(null, business.id)} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className={`text-sm font-semibold ${business.theme.accentText}`}>Campaign composer</p>
            <h2 className="mt-1 text-xl font-bold">Create a new campaign</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Draft the message once, choose the channel, and attach a funnel link for tracking.
            </p>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Campaign name
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="name" placeholder="May promo follow-up" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Channel
                  <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="channel">
                    {channels.map((channel) => <option key={channel}>{channel}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Audience
                  <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="audience">
                    <option>New funnel leads</option>
                    <option>Open leads</option>
                    <option>Stale leads</option>
                    <option>Past clients</option>
                    <option>Social followers</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Subject
                <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="subject" placeholder="Optional for text/social" />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Message
                <textarea className="min-h-32 rounded-lg border border-slate-200 px-3 py-2 text-sm" name="body" placeholder="Write the campaign message..." />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  CTA
                  <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="cta" placeholder="Book now" />
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Funnel link
                  <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" name="funnelSlug">
                    <option value="">No funnel attached</option>
                    {business.dbFunnels.map((funnel) => (
                      <option key={funnel.slug} value={funnel.slug}>{funnel.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${business.theme.button}`} type="submit">
                Save campaign
              </button>
            </div>
          </form>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Campaign library</h2>
                <p className="text-sm text-slate-500">Templates and drafts for {business.name}.</p>
              </div>
              <Link className={`rounded-lg px-3 py-2 text-center text-sm font-semibold text-white ${business.theme.button}`} href={`/dashboard/${business.id}#funnels`}>
                View funnels
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {business.dbCampaigns.map((campaign) => {
                const funnel = business.dbFunnels.find((item) => item.slug === campaign.funnelSlug);

                return (
                  <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={campaign.id}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${business.theme.chip}`}>
                            {campaign.channel}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                            {campaign.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{campaign.audience}</p>
                        {campaign.subject ? <p className="mt-2 text-sm font-semibold">{campaign.subject}</p> : null}
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{campaign.body}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">
                            CTA: {campaign.cta}
                          </span>
                          {funnel ? (
                            <Link className={`rounded-full border px-2 py-1 ${business.theme.chip}`} href={`/f/${business.id}/${funnel.slug}`}>
                              {funnel.name}
                            </Link>
                          ) : null}
                        </div>
                      </div>

                      <form action={updateCampaignStatus.bind(null, business.id, campaign.id)} className="grid gap-2 sm:grid-cols-[1fr_auto] lg:w-56">
                        <select className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm" defaultValue={campaign.status} name="status">
                          {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                        <button className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${business.theme.button}`} type="submit">
                          Update
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
