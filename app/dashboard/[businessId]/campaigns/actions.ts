"use server";

import { revalidatePath } from "next/cache";
import { requireBusinessAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createCampaign(businessId: string, formData: FormData) {
  await requireBusinessAccess(businessId);

  await prisma.campaign.create({
    data: {
      businessId,
      name: String(formData.get("name") ?? "Untitled campaign"),
      channel: String(formData.get("channel") ?? "Email"),
      audience: String(formData.get("audience") ?? "Open leads"),
      status: "draft",
      subject: String(formData.get("subject") ?? "") || null,
      body: String(formData.get("body") ?? ""),
      cta: String(formData.get("cta") ?? "Book now"),
      funnelSlug: String(formData.get("funnelSlug") ?? "") || null,
    },
  });

  revalidatePath(`/dashboard/${businessId}`);
  revalidatePath(`/dashboard/${businessId}/campaigns`);
}

export async function updateCampaignStatus(businessId: string, campaignId: string, formData: FormData) {
  await requireBusinessAccess(businessId);

  const status = String(formData.get("status") ?? "draft");

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status,
      sentAt: status === "sent" ? new Date() : null,
    },
  });

  revalidatePath(`/dashboard/${businessId}`);
  revalidatePath(`/dashboard/${businessId}/campaigns`);
}
