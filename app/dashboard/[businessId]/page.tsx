import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusinessAccess } from "@/lib/auth";
import { getBusinessWorkspace } from "@/lib/crm-db";
import { businesses } from "@/lib/mock-crm";
import { logout } from "@/app/login/actions";

type DashboardRouteProps = {
  params: Promise<{ businessId: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return businesses.map((business) => ({ businessId: business.id }));
}

export default async function BusinessDashboardPage({ params }: DashboardRouteProps) {
  const { businessId } = await params;
  await requireBusinessAccess(businessId);
  const business = await getBusinessWorkspace(businessId);

  if (!business) {
    notFound();
  }

  const totalSourceValue = business.sources.reduce((sum, source) => sum + source.value, 0);
  const pipelineLeads = business.dbLeads.map((lead) => ({
    name: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
    source: lead.source,
    status: lead.status.charAt(0).toUpperCase() + lead.status.slice(1),
    value: `$${Math.round(lead.estimatedValue).toLocaleString()}`,
    service: lead.service ?? "Lead inquiry",
  }));
  const operationCards = [
    {
      title: "Google reviews",
      metric: `${business.dbReviews[0]?.rating ?? 0} avg rating`,
      detail: `${business.dbReviews[0]?.pending ?? 0} reviews ready for reply after Google connection.`,
    },
    {
      title: "Social inbox",
      metric: `${business.dbSocials.reduce((sum, social) => sum + social.unread, 0)} messages`,
      detail: "Instagram, Facebook, and TikTok connections are staged for OAuth setup.",
    },
    {
      title: "Booking calendar",
      metric: `${business.dbBookings.length} consults`,
      detail: "Bookings can be saved now and synced to Google Calendar later.",
    },
  ];

  return (
    <main className={`min-h-screen ${business.theme.shell} text-slate-950`}>
      <div className="mx-auto flex max-w-7xl gap-4 px-3 py-4 sm:px-5 sm:py-6 lg:gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 space-y-5">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${business.theme.accentText}`}>
                BHW Consulting
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight">FitFlow CRM</h1>
            </div>
            <form action={logout}>
              <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50" type="submit">
                Sign out
              </button>
            </form>

            <nav className="space-y-1 text-sm font-medium">
              {[
                { label: "Dashboard", href: `/dashboard/${business.id}` },
                { label: "Funnels", href: "#funnels" },
                { label: "Leads", href: `/dashboard/${business.id}/leads` },
                { label: "Reviews", href: "#operations" },
                { label: "Social inbox", href: "#operations" },
                { label: "Calendar", href: "#operations" },
                { label: "Campaigns", href: `/dashboard/${business.id}/campaigns` },
                { label: "Assistant", href: `/dashboard/${business.id}/assistant` },
              ].map((item) => (
                <Link
                  className={`block rounded-lg px-3 py-2 ${
                    item.label === "Dashboard"
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Switch business</p>
              <div className="mt-3 space-y-2">
                {businesses.map((account) => (
                  <Link
                    className={`block rounded-lg border px-3 py-2 text-sm ${
                      account.id === business.id
                        ? account.theme.chip
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    href={`/dashboard/${account.id}`}
                    key={account.id}
                  >
                    {account.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4 sm:space-y-6">
          <header className="lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${business.theme.accentText}`}>
                  FitFlow CRM
                </p>
                <h1 className="mt-1 text-xl font-bold">{business.name}</h1>
              </div>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${business.theme.chip}`}>
                {business.theme.label}
              </span>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {businesses.map((account) => (
                <Link
                  className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium ${
                    account.id === business.id
                      ? account.theme.chip
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                  href={`/dashboard/${account.id}`}
                  key={account.id}
                >
                  {account.name}
                </Link>
              ))}
            </div>
          </header>

          <section className={`rounded-lg px-4 py-5 text-white shadow-sm sm:px-5 ${business.theme.hero}`}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-medium text-white/75">{business.theme.label} dashboard</p>
                <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
                  {business.name}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">{business.tagline}</p>
              </div>

              <div className={`rounded-lg border p-4 shadow-sm ${business.theme.card} xl:w-[360px]`}>
                <p className="text-sm font-semibold">{business.owner}</p>
                <p className={`mt-2 text-3xl font-bold ${business.theme.accentText}`}>
                  {business.stats[2].value}
                </p>
                <p className="mt-1 text-sm opacity-75">Closed revenue this month in {business.location}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {business.stats.map((stat) => (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={stat.label}>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm leading-5 text-slate-500">{stat.helper}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className={`text-sm font-semibold ${business.theme.accentText}`}>Campaign Center</p>
              <h3 className="mt-1 text-xl font-bold">Email, text, and social campaigns</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Draft follow-ups, attach funnel links, and organize campaigns for new leads, stale leads, and social audiences.
              </p>
            </div>
            <Link
              className={`flex items-center justify-center rounded-lg px-4 py-3 text-center text-sm font-semibold text-white shadow-sm ${business.theme.button}`}
              href={`/dashboard/${business.id}/campaigns`}
            >
              Open Campaign Center
            </Link>
          </section>

          <section className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className={`text-sm font-semibold ${business.theme.accentText}`}>Automated Follow-Up Assistant</p>
              <h3 className="mt-1 text-xl font-bold">Text and email follow-up rules</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create playbooks for new leads, stale leads, no-replies, and no-shows, then queue test messages before connecting SMS delivery.
              </p>
            </div>
            <Link
              className={`flex items-center justify-center rounded-lg px-4 py-3 text-center text-sm font-semibold text-white shadow-sm ${business.theme.button}`}
              href={`/dashboard/${business.id}/assistant`}
            >
              Open Assistant
            </Link>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]" id="funnels">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className={`text-sm font-semibold ${business.theme.accentText}`}>Funnel link builder</p>
                  <h3 className="mt-1 text-xl font-bold">Create a custom lead portal</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Build a branded form link for bios, posts, ads, QR codes, and SEO landing pages.
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${business.theme.chip}`}>
                  {business.theme.label} theme
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Funnel name
                  <input className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" defaultValue={business.funnels[0].name} />
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Headline
                  <input className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" defaultValue={business.funnels[0].headline} />
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700">
                  Offer / hook
                  <textarea className="min-h-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" defaultValue={business.funnels[0].offer} />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    Traffic source
                    <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" defaultValue={business.funnels[0].channel}>
                      <option>Instagram bio</option>
                      <option>Facebook ads</option>
                      <option>Google landing page</option>
                      <option>TikTok profile</option>
                      <option>QR code</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-slate-700">
                    Button text
                    <input className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400" defaultValue={business.funnels[0].cta} />
                  </label>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Lead fields</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Name", "Phone", "Email", "Goal", "Service interest", "Preferred time"].map((field) => (
                      <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600" key={field}>
                        <input defaultChecked={business.funnels[0].fields.includes(field)} type="checkbox" />
                        {field}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${business.theme.button}`}>
                    Create funnel link
                  </button>
                  <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50" href={`/f/${business.id}/${business.funnels[0].id}`}>
                    Preview portal
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Active funnel links</h3>
                  <p className="text-sm text-slate-500">Each link saves new leads under {business.name}.</p>
                </div>
                <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  Copy all links
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {business.dbFunnels.map((funnel) => {
                  const fallbackFunnel = business.funnels.find((item) => item.id === funnel.slug);
                  const leadCount = funnel.submissions.length;
                  const visits = Math.max(leadCount * 11, fallbackFunnel?.visits ?? 0);
                  const conversion = visits > 0 ? `${Math.round((leadCount / visits) * 1000) / 10}%` : "0%";

                  return (
                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={funnel.id}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold">{funnel.name}</h4>
                            <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${business.theme.chip}`}>
                              {funnel.status.charAt(0).toUpperCase() + funnel.status.slice(1)}
                            </span>
                          </div>
                          <p className="mt-2 break-all rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-500">
                            fitflowcrm.com/f/{business.id}/{funnel.slug}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">{funnel.channel} · {funnel.headline}</p>
                        </div>
                        <Link className={`shrink-0 rounded-lg px-3 py-2 text-center text-sm font-semibold text-white ${business.theme.button}`} href={`/f/${business.id}/${funnel.slug}`}>
                          Open
                        </Link>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-lg font-bold">{visits}</p>
                          <p className="text-xs text-slate-500">Visits</p>
                        </div>
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-lg font-bold">{leadCount}</p>
                          <p className="text-xs text-slate-500">Leads</p>
                        </div>
                        <div className="rounded-lg bg-white p-2">
                          <p className="text-lg font-bold">{conversion}</p>
                          <p className="text-xs text-slate-500">Conversion</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Week-by-week performance</h3>
                  <p className="text-sm text-slate-500">Only data tied to {business.name} is included here.</p>
                </div>
                <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
                  <button className="rounded-md bg-white px-3 py-1 shadow-sm">Week</button>
                  <button className="px-3 py-1 text-slate-500">Month</button>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {business.weekly.map((week) => (
                  <div className="grid gap-2 sm:grid-cols-[72px_1fr_82px] sm:gap-3" key={week.label}>
                    <p className="text-sm font-medium text-slate-600">{week.label}</p>
                    <div className="space-y-2">
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className={`h-3 rounded-full ${business.theme.bar}`} style={{ width: `${week.leads * 2}%` }} />
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className={`h-3 rounded-full ${business.theme.softBar}`} style={{ width: `${week.contacted * 2}%` }} />
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className="h-3 rounded-full bg-slate-800" style={{ width: `${week.closed * 3}%` }} />
                      </div>
                    </div>
                    <p className="text-left text-sm font-semibold sm:text-right">{week.revenue}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="text-lg font-semibold">Lead source mix</h3>
              <p className="text-sm text-slate-500">Source attribution for this business only.</p>
              <div className="mx-auto my-6 h-44 w-44 rounded-full p-7 sm:h-48 sm:w-48 sm:p-8" style={{ background: business.theme.conic }}>
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-center text-sm font-semibold">
                  {business.stats[0].value}
                  <br />
                  leads
                </div>
              </div>
              <div className="space-y-3">
                {business.sources.map((source) => (
                  <div className="flex items-center justify-between gap-3 text-sm" key={source.label}>
                    <span className="inline-flex items-center gap-2 text-slate-600">
                      <i className={`h-2.5 w-2.5 rounded-full ${source.color}`} />
                      {source.label}
                    </span>
                    <span className="font-semibold">{Math.round((source.value / totalSourceValue) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Lead pipeline</h3>
                  <p className="text-sm text-slate-500">Leads are filtered by business account and vertical.</p>
                </div>
                <Link className={`rounded-lg px-3 py-2 text-center text-sm font-semibold text-white ${business.theme.button}`} href={`/dashboard/${business.id}/leads`}>
                  Manage leads
                </Link>
              </div>

              <div className="mt-4 hidden overflow-hidden rounded-lg border border-slate-200 md:block">
                <div className="grid grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr_0.6fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Lead</span>
                  <span>Service</span>
                  <span>Source</span>
                  <span>Status</span>
                  <span className="text-right">Value</span>
                </div>
                {pipelineLeads.map((lead) => (
                  <div className="grid grid-cols-[1.1fr_0.9fr_0.8fr_0.8fr_0.6fr] border-t border-slate-200 px-4 py-3 text-sm" key={`${lead.name}-${lead.service}`}>
                    <span className="font-medium">{lead.name}</span>
                    <span className="text-slate-600">{lead.service}</span>
                    <span className="text-slate-600">{lead.source}</span>
                    <span>
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${business.theme.chip}`}>
                        {lead.status}
                      </span>
                    </span>
                    <span className="text-right font-semibold">{lead.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:hidden">
                {pipelineLeads.map((lead) => (
                  <article className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={`${lead.name}-${lead.service}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{lead.name}</h4>
                        <p className="mt-1 text-sm text-slate-600">{lead.service}</p>
                      </div>
                      <span className="font-semibold">{lead.value}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600">{lead.source}</span>
                      <span className={`rounded-full border px-2 py-1 ${business.theme.chip}`}>{lead.status}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="text-lg font-semibold">Month-by-month</h3>
              <div className="mt-5 flex h-56 items-end gap-2 sm:gap-3">
                {business.monthly.map((month) => (
                  <div className="flex flex-1 flex-col items-center gap-2" key={month.label}>
                    <div className="flex w-full items-end rounded-md bg-slate-100" style={{ height: 44 + month.leads }}>
                      <div className={`w-full rounded-md ${business.theme.bar}`} style={{ height: `${Math.max(24, month.leads - 42)}px` }} />
                    </div>
                    <p className="text-xs font-semibold">{month.label}</p>
                    <p className="text-xs text-slate-500">{month.revenue}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3" id="operations">
            {operationCards.map((item) => (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5" key={item.title}>
                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                <p className="mt-2 text-2xl font-bold">{item.metric}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                <button className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-white ${business.theme.button}`}>
                  Manage
                </button>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
