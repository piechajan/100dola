import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-auth";
import { sendEventFeedbackRequest } from "@/lib/email";

// Pošle ZKUŠEBNÍ dotazníkový e-mail na e-mail přihlášeného admina (Jan).
export async function POST() {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await sendEventFeedbackRequest({
    eventTitle: "Malaga fall ride I (ZKUŠEBNÍ)",
    eventDate: "23.–29. října",
    eventLocation: "Málaga, Španělsko",
    leadName: "Jan",
    leadEmail: admin.email,
    feedbackUrl: "https://www.100dola.com/community/event/malaga-fall-ride-1/zpetna-vazba",
  });

  return NextResponse.json({ ok: true, sentTo: admin.email });
}
