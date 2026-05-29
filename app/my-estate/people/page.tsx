import { redirect } from "next/navigation";

// People management consolidated onto the full-featured /people page (all 6
// roles, stats, validation, status). This wizard-era stub now redirects there.
export default function MyEstatePeopleRedirect() {
  redirect("/people");
}
