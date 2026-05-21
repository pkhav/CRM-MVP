export type Vertical = "personal_trainer" | "boutique_gym" | "med_spa";

export type BusinessDashboard = {
  id: string;
  name: string;
  owner: string;
  vertical: Vertical;
  tagline: string;
  location: string;
  theme: {
    label: string;
    shell: string;
    hero: string;
    card: string;
    chip: string;
    button: string;
    accentText: string;
    bar: string;
    softBar: string;
    conic: string;
  };
  stats: Array<{ label: string; value: string; helper: string }>;
  weekly: Array<{ label: string; leads: number; contacted: number; closed: number; revenue: string }>;
  monthly: Array<{ label: string; leads: number; revenue: string }>;
  sources: Array<{ label: string; value: number; color: string }>;
  leads: Array<{ name: string; source: string; status: string; value: string; service: string }>;
  operations: Array<{ title: string; metric: string; detail: string }>;
  funnels: Array<{
    id: string;
    name: string;
    headline: string;
    offer: string;
    channel: string;
    status: "Published" | "Draft";
    visits: number;
    leads: number;
    conversion: string;
    fields: string[];
    cta: string;
  }>;
};

const themes: Record<Vertical, BusinessDashboard["theme"]> = {
  personal_trainer: {
    label: "Personal trainer",
    shell: "bg-pink-50",
    hero: "bg-pink-950",
    card: "border-pink-200 bg-pink-50 text-pink-950",
    chip: "border-pink-200 bg-pink-100 text-pink-800",
    button: "bg-pink-700 hover:bg-pink-800",
    accentText: "text-pink-700",
    bar: "bg-pink-500",
    softBar: "bg-pink-200",
    conic: "conic-gradient(#ec4899 0 42%, #f9a8d4 42% 66%, #38bdf8 66% 82%, #10b981 82% 94%, #334155 94% 100%)",
  },
  boutique_gym: {
    label: "Boutique gym",
    shell: "bg-sky-50",
    hero: "bg-sky-950",
    card: "border-sky-200 bg-sky-50 text-sky-950",
    chip: "border-sky-200 bg-sky-100 text-sky-800",
    button: "bg-sky-700 hover:bg-sky-800",
    accentText: "text-sky-700",
    bar: "bg-sky-500",
    softBar: "bg-sky-200",
    conic: "conic-gradient(#0ea5e9 0 38%, #7dd3fc 38% 64%, #ec4899 64% 78%, #10b981 78% 92%, #334155 92% 100%)",
  },
  med_spa: {
    label: "Med spa",
    shell: "bg-emerald-50",
    hero: "bg-emerald-950",
    card: "border-emerald-200 bg-emerald-50 text-emerald-950",
    chip: "border-emerald-200 bg-emerald-100 text-emerald-800",
    button: "bg-emerald-700 hover:bg-emerald-800",
    accentText: "text-emerald-700",
    bar: "bg-emerald-500",
    softBar: "bg-emerald-200",
    conic: "conic-gradient(#10b981 0 44%, #34d399 44% 68%, #0ea5e9 68% 82%, #ec4899 82% 94%, #334155 94% 100%)",
  },
};

export const businesses: BusinessDashboard[] = [
  {
    id: "jeffs-training",
    name: "Jeff's Personal Training",
    owner: "Jeff Carter",
    vertical: "personal_trainer",
    tagline: "Transformation challenge leads, consult follow-up, and package revenue.",
    location: "Austin, TX",
    theme: themes.personal_trainer,
    stats: [
      { label: "Leads collected", value: "74", helper: "+21% vs last week" },
      { label: "Contacted", value: "58", helper: "78% response coverage" },
      { label: "Closed revenue", value: "$12.6K", helper: "19 training packages sold" },
      { label: "Potential value", value: "$18.9K", helper: "Open consult pipeline" },
      { label: "Leads lost", value: "8", helper: "Mostly no-show consults" },
      { label: "Close rate", value: "26%", helper: "+3 pts vs last month" },
    ],
    weekly: [
      { label: "Apr 20", leads: 12, contacted: 10, closed: 3, revenue: "$1.8K" },
      { label: "Apr 27", leads: 17, contacted: 14, closed: 4, revenue: "$2.7K" },
      { label: "May 04", leads: 18, contacted: 15, closed: 5, revenue: "$3.2K" },
      { label: "May 11", leads: 27, contacted: 19, closed: 7, revenue: "$4.9K" },
    ],
    monthly: [
      { label: "Jan", leads: 43, revenue: "$7K" },
      { label: "Feb", leads: 52, revenue: "$8K" },
      { label: "Mar", leads: 61, revenue: "$10K" },
      { label: "Apr", leads: 68, revenue: "$11K" },
      { label: "May", leads: 74, revenue: "$12K" },
    ],
    sources: [
      { label: "Instagram", value: 42, color: "bg-pink-500" },
      { label: "Google SEO", value: 24, color: "bg-emerald-500" },
      { label: "TikTok", value: 16, color: "bg-sky-400" },
      { label: "Referral", value: 10, color: "bg-amber-500" },
      { label: "Facebook", value: 8, color: "bg-slate-700" },
    ],
    leads: [
      { name: "Chris Patel", source: "Instagram", status: "Contacted", value: "$650", service: "12-week coaching" },
      { name: "Natalie Rowe", source: "Google SEO", status: "Scheduled", value: "$1,100", service: "Strength consult" },
      { name: "Marcus Hill", source: "TikTok", status: "New", value: "$475", service: "Fat-loss program" },
      { name: "Priya Shah", source: "Referral", status: "Closed", value: "$1,800", service: "Private training pack" },
    ],
    operations: [
      { title: "Google reviews", metric: "4.9 avg rating", detail: "3 new reviews mention transformation results." },
      { title: "Social inbox", metric: "18 messages", detail: "Challenge replies and consult questions need follow-up." },
      { title: "Booking calendar", metric: "9 consults", detail: "Assessment calls and trial sessions booked this week." },
    ],
    funnels: [
      {
        id: "six-week-reset",
        name: "6-week reset challenge",
        headline: "Build strength and drop body fat in 6 weeks",
        offer: "Free movement screen plus nutrition kickoff call",
        channel: "Instagram bio",
        status: "Published",
        visits: 842,
        leads: 74,
        conversion: "8.8%",
        fields: ["Name", "Phone", "Email", "Goal", "Preferred training time"],
        cta: "Claim my free assessment",
      },
      {
        id: "summer-strength",
        name: "Summer strength consult",
        headline: "Get a custom strength plan before summer",
        offer: "$49 intro consult credited toward your first package",
        channel: "Facebook ads",
        status: "Draft",
        visits: 0,
        leads: 0,
        conversion: "0%",
        fields: ["Name", "Phone", "Fitness goal", "Injury notes"],
        cta: "Book my consult",
      },
    ],
  },
  {
    id: "bluebird-boutique-gym",
    name: "Bluebird Boutique Gym",
    owner: "Mia Thompson",
    vertical: "boutique_gym",
    tagline: "Trial passes, class pack leads, membership follow-up, and retention signals.",
    location: "Scottsdale, AZ",
    theme: themes.boutique_gym,
    stats: [
      { label: "Leads collected", value: "116", helper: "+14% vs last week" },
      { label: "Contacted", value: "86", helper: "74% response coverage" },
      { label: "Closed revenue", value: "$16.8K", helper: "31 memberships sold" },
      { label: "Potential value", value: "$27.5K", helper: "Trials and open offers" },
      { label: "Leads lost", value: "14", helper: "Expired trial passes" },
      { label: "Close rate", value: "34%", helper: "+5 pts vs last month" },
    ],
    weekly: [
      { label: "Apr 20", leads: 21, contacted: 15, closed: 6, revenue: "$3.1K" },
      { label: "Apr 27", leads: 29, contacted: 20, closed: 8, revenue: "$4.2K" },
      { label: "May 04", leads: 26, contacted: 22, closed: 8, revenue: "$4.5K" },
      { label: "May 11", leads: 40, contacted: 29, closed: 9, revenue: "$5.0K" },
    ],
    monthly: [
      { label: "Jan", leads: 74, revenue: "$12K" },
      { label: "Feb", leads: 83, revenue: "$14K" },
      { label: "Mar", leads: 96, revenue: "$17K" },
      { label: "Apr", leads: 108, revenue: "$21K" },
      { label: "May", leads: 116, revenue: "$16K" },
    ],
    sources: [
      { label: "Google SEO", value: 38, color: "bg-emerald-500" },
      { label: "Instagram", value: 26, color: "bg-sky-500" },
      { label: "Facebook", value: 14, color: "bg-amber-500" },
      { label: "TikTok", value: 14, color: "bg-pink-500" },
      { label: "Referral", value: 8, color: "bg-slate-700" },
    ],
    leads: [
      { name: "Sofia Martin", source: "TikTok", status: "New", value: "$420", service: "Trial pass" },
      { name: "Evan Brooks", source: "Google SEO", status: "Scheduled", value: "$1,250", service: "Founders membership" },
      { name: "Lena Ortiz", source: "Instagram", status: "Contacted", value: "$650", service: "Class pack" },
      { name: "Ray Kim", source: "Facebook", status: "Closed", value: "$1,500", service: "Annual membership" },
    ],
    operations: [
      { title: "Google reviews", metric: "4.7 avg rating", detail: "6 class experience reviews waiting for replies." },
      { title: "Social inbox", metric: "29 messages", detail: "Trial pass questions from Instagram and Facebook." },
      { title: "Booking calendar", metric: "18 consults", detail: "Intro classes and member tours scheduled." },
    ],
    funnels: [
      {
        id: "free-trial-pass",
        name: "Free trial class pass",
        headline: "Try Bluebird for free this week",
        offer: "One complimentary class plus a tour of the studio",
        channel: "Google landing page",
        status: "Published",
        visits: 1210,
        leads: 116,
        conversion: "9.6%",
        fields: ["Name", "Phone", "Email", "Class interest", "Preferred day"],
        cta: "Get my free class",
      },
      {
        id: "founders-membership",
        name: "Founders membership offer",
        headline: "Lock in founding member pricing",
        offer: "First month discounted for new members who join this week",
        channel: "Instagram story",
        status: "Published",
        visits: 694,
        leads: 52,
        conversion: "7.5%",
        fields: ["Name", "Phone", "Membership goal", "Current studio"],
        cta: "Reserve my rate",
      },
    ],
  },
  {
    id: "glowline-med-spa",
    name: "Glowline Med Spa",
    owner: "Dr. Elena Ruiz",
    vertical: "med_spa",
    tagline: "Treatment inquiries, review growth, booking calendars, and high-value consults.",
    location: "Miami, FL",
    theme: themes.med_spa,
    stats: [
      { label: "Leads collected", value: "142", helper: "+18% vs last week" },
      { label: "Contacted", value: "104", helper: "73% response coverage" },
      { label: "Closed revenue", value: "$31.4K", helper: "36 treatments sold" },
      { label: "Potential value", value: "$48.7K", helper: "Open aesthetic consults" },
      { label: "Leads lost", value: "11", helper: "Price-shopping objections" },
      { label: "Close rate", value: "38%", helper: "+6 pts vs last month" },
    ],
    weekly: [
      { label: "Apr 20", leads: 26, contacted: 19, closed: 8, revenue: "$6.2K" },
      { label: "Apr 27", leads: 33, contacted: 24, closed: 9, revenue: "$7.4K" },
      { label: "May 04", leads: 35, contacted: 27, closed: 9, revenue: "$8.1K" },
      { label: "May 11", leads: 48, contacted: 34, closed: 10, revenue: "$9.7K" },
    ],
    monthly: [
      { label: "Jan", leads: 92, revenue: "$21K" },
      { label: "Feb", leads: 108, revenue: "$24K" },
      { label: "Mar", leads: 121, revenue: "$27K" },
      { label: "Apr", leads: 133, revenue: "$34K" },
      { label: "May", leads: 142, revenue: "$31K" },
    ],
    sources: [
      { label: "Google SEO", value: 44, color: "bg-emerald-500" },
      { label: "Instagram", value: 24, color: "bg-sky-500" },
      { label: "Referral", value: 16, color: "bg-slate-700" },
      { label: "Facebook", value: 10, color: "bg-amber-500" },
      { label: "TikTok", value: 6, color: "bg-pink-500" },
    ],
    leads: [
      { name: "Maya Johnson", source: "Google SEO", status: "Scheduled", value: "$1,200", service: "Injectables consult" },
      { name: "Andre Lewis", source: "Facebook", status: "Closed", value: "$2,400", service: "Body contouring" },
      { name: "Camila Reyes", source: "Instagram", status: "Contacted", value: "$850", service: "Hydrafacial package" },
      { name: "Jordan Lee", source: "Referral", status: "New", value: "$1,600", service: "Laser treatment" },
    ],
    operations: [
      { title: "Google reviews", metric: "4.8 avg rating", detail: "12 unanswered reviews queued for response." },
      { title: "Social inbox", metric: "38 messages", detail: "Treatment DMs and before-after content replies." },
      { title: "Booking calendar", metric: "21 consults", detail: "Upcoming injection, facial, and laser appointments." },
    ],
    funnels: [
      {
        id: "injectables-consult",
        name: "Injectables consult funnel",
        headline: "Refresh your look with a private consult",
        offer: "Free treatment plan for Botox, filler, or skin rejuvenation",
        channel: "SEO service page",
        status: "Published",
        visits: 1594,
        leads: 142,
        conversion: "8.9%",
        fields: ["Name", "Phone", "Email", "Treatment interest", "Preferred appointment window"],
        cta: "Request my consult",
      },
      {
        id: "summer-skin",
        name: "Summer skin package",
        headline: "Get glowing skin before summer events",
        offer: "Hydrafacial package quote and same-week booking options",
        channel: "TikTok profile",
        status: "Draft",
        visits: 0,
        leads: 0,
        conversion: "0%",
        fields: ["Name", "Phone", "Skin concern", "Event date"],
        cta: "Build my glow plan",
      },
    ],
  },
];

export function getBusiness(id: string) {
  return businesses.find((business) => business.id === id);
}

export function getFunnel(businessId: string, funnelId: string) {
  const business = getBusiness(businessId);
  const funnel = business?.funnels.find((item) => item.id === funnelId);

  if (!business || !funnel) {
    return undefined;
  }

  return { business, funnel };
}
