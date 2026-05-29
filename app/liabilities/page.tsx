import { redirect } from "next/navigation";

// Liabilities now live under the Vault. Kept as a redirect for old links.
export default function LiabilitiesRedirect() {
  redirect("/vault/liabilities");
}
