"use server";

import { revalidatePath } from "next/cache";
import { requireBusinessAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBusiness } from "@/lib/mock-crm";

const estimateByVertical = {
  personal_trainer: 750,
  boutique_gym: 520,
  med_spa: 1250,
};

export async function updateLeadStatus(businessId: string, leadId: string, formData: FormData) {
  await requireBusinessAccess(businessId);

  const status = String(formData.get("status") ?? "new");
  const closedValue = Number(formData.get("closedValue") ?? 0);

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status,
      closedValue: status === "closed" ? closedValue : 0,
      closedAt: status === "closed" ? new Date() : null,
      lostReason: status === "lost" ? String(formData.get("lostReason") ?? "") : null,
    },
  });

  revalidatePath(`/dashboard/${businessId}`);
  revalidatePath(`/dashboard/${businessId}/leads`);
}

export async function createManualLead(businessId: string, formData: FormData) {
  await requireBusinessAccess(businessId);

  const fallback = getBusiness(businessId);

  if (!fallback) {
    throw new Error("Business not found.");
  }

  const fullName = String(formData.get("name") ?? "").trim();
  const [firstName, ...lastName] = fullName.split(" ").filter(Boolean);
  const service = String(formData.get("service") ?? "");

  await prisma.lead.create({
    data: {
      businessId,
      firstName: firstName || "New",
      lastName: lastName.join(" ") || null,
      email: String(formData.get("email") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      source: String(formData.get("source") ?? "Manual"),
      campaign: "Manual entry",
      status: "new",
      service: service || "Lead inquiry",
      estimatedValue: Number(formData.get("estimatedValue") ?? 0) || estimateByVertical[fallback.vertical],
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath(`/dashboard/${businessId}`);
  revalidatePath(`/dashboard/${businessId}/leads`);
}
