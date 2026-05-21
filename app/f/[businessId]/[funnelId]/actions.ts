"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBusiness } from "@/lib/mock-crm";

const estimateByVertical = {
  personal_trainer: 750,
  boutique_gym: 520,
  med_spa: 1250,
};

export async function submitFunnelLead(businessId: string, funnelSlug: string, formData: FormData) {
  const funnel = await prisma.funnel.findUnique({
    where: { businessId_slug: { businessId, slug: funnelSlug } },
    include: { business: true },
  });
  const fallback = getBusiness(businessId);

  if (!funnel || !fallback) {
    throw new Error("Funnel not found.");
  }

  const payload = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  );
  const fullName = String(formData.get("Name") ?? "").trim();
  const [firstName, ...lastNameParts] = fullName.split(" ").filter(Boolean);
  const service =
    String(formData.get("Service interest") ?? "") ||
    String(formData.get("Class interest") ?? "") ||
    String(formData.get("Treatment interest") ?? "") ||
    String(formData.get("Goal") ?? "") ||
    funnel.name;

  const lead = await prisma.lead.create({
    data: {
      businessId,
      firstName: firstName || "New",
      lastName: lastNameParts.join(" ") || null,
      email: String(formData.get("Email") ?? "") || null,
      phone: String(formData.get("Phone") ?? "") || null,
      source: funnel.channel,
      campaign: funnel.name,
      status: "new",
      service,
      notes: JSON.stringify(payload),
      funnelId: funnel.id,
      estimatedValue: estimateByVertical[fallback.vertical],
    },
  });

  await prisma.funnelSubmission.create({
    data: {
      funnelId: funnel.id,
      businessId,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      source: funnel.channel,
      payload: JSON.stringify(payload),
    },
  });

  const preferredTime =
    String(formData.get("Preferred training time") ?? "") ||
    String(formData.get("Preferred day") ?? "") ||
    String(formData.get("Preferred appointment window") ?? "");

  if (preferredTime) {
    await prisma.booking.create({
      data: {
        businessId,
        leadId: lead.id,
        title: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
        service,
        status: "requested",
        notes: `Preferred time: ${preferredTime}`,
      },
    });
  }

  redirect(`/f/${businessId}/${funnelSlug}/thank-you`);
}
