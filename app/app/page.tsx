import { redirect } from "next/navigation";

// Workspace home — for now, route straight to Find Issues.
// In a future phase this can become a true dashboard with saved searches,
// recent activity, suggested issues, etc.
export default function AppHome() {
  redirect("/app/search");
}
