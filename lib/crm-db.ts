import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { businesses, getBusiness } from "@/lib/mock-crm";

const defaultEstimateByVertical = {
  personal_trainer: 750,
  boutique_gym: 520,
  med_spa: 1250,
};

const demoPassword = process.env.DEMO_PASSWORD ?? "FitFlow2026!";

export async function ensureDemoData() {
  for (const business of businesses) {
    await prisma.business.upsert({
      where: { id: business.id },
      update: {
        name: business.name,
        owner: business.owner,
        vertical: business.vertical,
        tagline: business.tagline,
        location: business.location,
      },
      create: {
        id: business.id,
        name: business.name,
        owner: business.owner,
        email: `${business.id}@fitflow.local`,
        vertical: business.vertical,
        tagline: business.tagline,
        location: business.location,
      },
    });

    await prisma.user.upsert({
      where: { email: `${business.id}@fitflow.local` },
      update: { name: business.owner, businessId: business.id, passwordHash: hashPassword(demoPassword) },
      create: {
        businessId: business.id,
        name: business.owner,
        email: `${business.id}@fitflow.local`,
        passwordHash: hashPassword(demoPassword),
      },
    });

    for (const funnel of business.funnels) {
      await prisma.funnel.upsert({
        where: { businessId_slug: { businessId: business.id, slug: funnel.id } },
        update: {
          name: funnel.name,
          headline: funnel.headline,
          offer: funnel.offer,
          channel: funnel.channel,
          status: funnel.status.toLowerCase(),
          cta: funnel.cta,
          fields: JSON.stringify(funnel.fields),
          theme: business.vertical,
        },
        create: {
          businessId: business.id,
          slug: funnel.id,
          name: funnel.name,
          headline: funnel.headline,
          offer: funnel.offer,
          channel: funnel.channel,
          status: funnel.status.toLowerCase(),
          cta: funnel.cta,
          fields: JSON.stringify(funnel.fields),
          theme: business.vertical,
        },
      });
    }

    const campaignTemplates = [
      {
        id: `${business.id}-new-lead-follow-up`,
        name: "New lead follow-up",
        channel: "Text",
        audience: "New funnel leads",
        status: "draft",
        subject: null,
        body: `Hi {{firstName}}, this is ${business.owner} from ${business.name}. Thanks for your interest. Want help booking your next step?`,
        cta: "Reply YES to book",
        funnelSlug: business.funnels[0]?.id,
      },
      {
        id: `${business.id}-weekly-offer-email`,
        name: "Weekly offer email",
        channel: "Email",
        audience: "Open leads",
        status: "draft",
        subject: `${business.name}: your next step is ready`,
        body: `Share the current offer, remind leads why it matters, and send them back to the funnel page for ${business.funnels[0]?.name}.`,
        cta: "Book now",
        funnelSlug: business.funnels[0]?.id,
      },
      {
        id: `${business.id}-social-funnel-post`,
        name: "Social funnel post",
        channel: "Social",
        audience: "Instagram and Facebook followers",
        status: "draft",
        subject: null,
        body: `Post a short story about the offer, include proof, and direct people to the funnel link in bio.`,
        cta: "Tap the link in bio",
        funnelSlug: business.funnels[0]?.id,
      },
    ];

    for (const campaign of campaignTemplates) {
      await prisma.campaign.upsert({
        where: { id: campaign.id },
        update: {
          name: campaign.name,
          channel: campaign.channel,
          audience: campaign.audience,
          status: campaign.status,
          subject: campaign.subject,
          body: campaign.body,
          cta: campaign.cta,
          funnelSlug: campaign.funnelSlug,
        },
        create: {
          businessId: business.id,
          ...campaign,
        },
      });
    }

    const automationRules = [
      {
        id: `${business.id}-instant-new-lead-text`,
        name: "Instant new lead text",
        trigger: "new_lead_created",
        channel: "Text",
        delayMinutes: 0,
        audience: "New funnel leads",
        status: "active",
        message: `Hi {{firstName}}, thanks for reaching out to ${business.name}. Want me to help you book your next step?`,
        fallbackMessage: "If they do not reply in 1 hour, send the soft follow-up.",
      },
      {
        id: `${business.id}-one-hour-no-reply`,
        name: "1-hour no-reply follow-up",
        trigger: "lead_no_reply",
        channel: "Text",
        delayMinutes: 60,
        audience: "Uncontacted leads",
        status: "active",
        message: `Quick follow-up, {{firstName}}. I can send available times or answer questions before you book.`,
        fallbackMessage: "Pause once lead is marked contacted, scheduled, closed, or lost.",
      },
      {
        id: `${business.id}-stale-lead-email`,
        name: "3-day stale lead email",
        trigger: "lead_stale_3_days",
        channel: "Email",
        delayMinutes: 4320,
        audience: "Open leads",
        status: "paused",
        message: `Subject: Still interested?\n\nHi {{firstName}}, here is a quick reminder about the offer you requested from ${business.name}.`,
        fallbackMessage: "Move to long-term nurture after this step.",
      },
    ];

    for (const rule of automationRules) {
      await prisma.automationRule.upsert({
        where: { id: rule.id },
        update: {
          name: rule.name,
          trigger: rule.trigger,
          channel: rule.channel,
          delayMinutes: rule.delayMinutes,
          audience: rule.audience,
          status: rule.status,
          message: rule.message,
          fallbackMessage: rule.fallbackMessage,
        },
        create: {
          businessId: business.id,
          ...rule,
        },
      });
    }

    const existingLeads = await prisma.lead.count({ where: { businessId: business.id } });
    if (existingLeads === 0) {
      for (const [index, lead] of business.leads.entries()) {
          const [firstName, ...lastName] = lead.name.split(" ");
          await prisma.lead.upsert({
            where: { id: `${business.id}-seed-lead-${index}` },
            update: {},
            create: {
              id: `${business.id}-seed-lead-${index}`,
              businessId: business.id,
              firstName,
              lastName: lastName.join(" ") || null,
              email: `${firstName.toLowerCase()}@example.com`,
              phone: `555-010${index}`,
              source: lead.source,
              campaign: business.funnels[0]?.name,
              status: lead.status.toLowerCase(),
              service: lead.service,
              estimatedValue: Number(lead.value.replace(/[$,]/g, "")) || defaultEstimateByVertical[business.vertical],
              closedValue: lead.status === "Closed" ? Number(lead.value.replace(/[$,]/g, "")) : 0,
              closedAt: lead.status === "Closed" ? new Date() : null,
            },
          });
      }
    }

    await prisma.reviewConnection.upsert({
      where: { id: `${business.id}-google-reviews` },
      update: {},
      create: {
        id: `${business.id}-google-reviews`,
        businessId: business.id,
        provider: "Google Business Profile",
        rating: Number(business.operations[0].metric.split(" ")[0]) || 0,
        pending: Number(business.operations[0].detail.match(/\d+/)?.[0] ?? 0),
        status: "ready_to_connect",
      },
    });

    for (const source of ["Instagram", "Facebook", "TikTok"]) {
      await prisma.socialConnection.upsert({
        where: { id: `${business.id}-${source.toLowerCase()}` },
        update: {},
        create: {
          id: `${business.id}-${source.toLowerCase()}`,
          businessId: business.id,
          platform: source,
          handle: `@${business.id.replaceAll("-", "")}`,
          unread: source === "Instagram" ? Number(business.operations[1].metric.match(/\d+/)?.[0] ?? 0) : 0,
          status: "ready_to_connect",
        },
      });
    }

    const existingBookings = await prisma.booking.count({ where: { businessId: business.id } });
    if (existingBookings === 0) {
      await prisma.booking.create({
        data: {
          businessId: business.id,
          title: "New lead consult",
          service: business.leads[0]?.service,
          startAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          notes: "Created as a sample booking workflow item.",
        },
      });
    }
  }
}

export async function getBusinessWorkspace(businessId: string) {
  await ensureDemoData();
  const fallback = getBusiness(businessId);

  if (!fallback) {
    return undefined;
  }

  const [business, leads, funnels, campaigns, automations, queuedMessages, bookings, reviews, socials] = await Promise.all([
    prisma.business.findUnique({ where: { id: businessId } }),
    prisma.lead.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
    prisma.funnel.findMany({
      where: { businessId },
      include: { submissions: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.campaign.findMany({ where: { businessId }, orderBy: { createdAt: "asc" } }),
    prisma.automationRule.findMany({
      where: { businessId },
      include: { queuedMessages: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.queuedMessage.findMany({ where: { businessId }, orderBy: { scheduledAt: "asc" } }),
    prisma.booking.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } }),
    prisma.reviewConnection.findMany({ where: { businessId } }),
    prisma.socialConnection.findMany({ where: { businessId } }),
  ]);

  if (!business) {
    return undefined;
  }

  const totalLeads = leads.length;
  const contacted = leads.filter((lead) => ["contacted", "scheduled", "closed"].includes(lead.status)).length;
  const closed = leads.filter((lead) => lead.status === "closed");
  const lost = leads.filter((lead) => lead.status === "lost").length;
  const closedRevenue = closed.reduce((sum, lead) => sum + lead.closedValue, 0);
  const potentialRevenue = leads
    .filter((lead) => lead.status !== "closed" && lead.status !== "lost")
    .reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const closeRate = totalLeads > 0 ? Math.round((closed.length / totalLeads) * 100) : 0;

  return {
    ...fallback,
    name: business.name,
    owner: business.owner,
    tagline: business.tagline ?? fallback.tagline,
    location: business.location ?? fallback.location,
    stats: [
      { label: "Leads collected", value: String(totalLeads), helper: "Stored in the CRM database" },
      { label: "Contacted", value: String(contacted), helper: `${totalLeads ? Math.round((contacted / totalLeads) * 100) : 0}% response coverage` },
      { label: "Closed revenue", value: formatCurrency(closedRevenue), helper: `${closed.length} leads won` },
      { label: "Potential value", value: formatCurrency(potentialRevenue), helper: "Open pipeline value" },
      { label: "Leads lost", value: String(lost), helper: "Marked lost in workflow" },
      { label: "Close rate", value: `${closeRate}%`, helper: "Closed leads / total leads" },
    ],
    dbLeads: leads,
    dbFunnels: funnels,
    dbCampaigns: campaigns,
    dbAutomations: automations,
    dbQueuedMessages: queuedMessages,
    dbBookings: bookings,
    dbReviews: reviews,
    dbSocials: socials,
  };
}

export function formatCurrency(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value >= 10000 ? 1 : 2).replace(/\.0$/, "")}K`;
  }

  return `$${Math.round(value)}`;
}
