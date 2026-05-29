import { redirect } from "next/navigation";

// "About you" / basic information now lives in the Profile page — My Estate is
// for the net-worth inventory, not identity. Kept as a redirect for old links.
export default function AboutRedirect() {
  redirect("/profile");
}
