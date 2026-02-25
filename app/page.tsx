import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LandingPageWrapper } from "./landing-client";

export default async function Home() {
  const session = await auth();

  // If the user has a valid session (e.g., from the 7-day NextAuth cookie)
  // redirect them directly to the dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return <LandingPageWrapper />;
}
