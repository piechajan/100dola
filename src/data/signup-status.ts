// Stavy přihlášky na akci (admin workflow). Sdílené mezi adminem a API.

export const SIGNUP_STATUSES = [
  "new",
  "processing",
  "offer_sent",
  "paid",
  "pending",
  "cancelled",
] as const;

export type SignupStatus = (typeof SIGNUP_STATUSES)[number];

export const SIGNUP_STATUS_META: Record<SignupStatus, { label: string; bg: string; fg: string }> = {
  new: { label: "Nová", bg: "#EEF1F8", fg: "#5A6480" },
  processing: { label: "Nabídka se zpracovává", bg: "#FEF3C7", fg: "#92400E" },
  offer_sent: { label: "Nabídka poslána", bg: "#DBEAFE", fg: "#1E40AF" },
  paid: { label: "Zaplaceno", bg: "#D1FAE5", fg: "#065F46" },
  pending: { label: "Nedořešeno", bg: "#FEE2E2", fg: "#991B1B" },
  cancelled: { label: "Zrušeno", bg: "#F0F2FA", fg: "#9AA3C2" },
};
