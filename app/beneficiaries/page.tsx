import { redirect } from "next/navigation";

// Renamed to /people (the page manages all roles, not just beneficiaries).
// Kept as a redirect so existing links/bookmarks still resolve.
export default function BeneficiariesRedirect() {
  redirect("/people");
}
