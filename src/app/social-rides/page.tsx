import { redirect } from "next/navigation";

// /social-rides nemá vlastní přehled — obsah komunity žije na /community.
// Konkrétní města zůstávají na /social-rides/[mesto].
export default function SocialRidesIndex() {
  redirect("/community");
}
