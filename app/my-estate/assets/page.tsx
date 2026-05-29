import { redirect } from "next/navigation";

// Inventory now lives under the Vault ("wallet"). Kept as a redirect for old links.
export default function Redirect() {
  redirect("/vault/assets");
}
