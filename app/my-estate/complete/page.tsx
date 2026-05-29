import { redirect } from "next/navigation";

// The linear "setup complete" page is retired — My Estate is a persistent
// management area now. Redirect any old links to the dashboard.
export default function MyEstateCompleteRedirect() {
  redirect("/");
}
