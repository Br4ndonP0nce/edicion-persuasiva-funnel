import { redirect } from "next/navigation";

export default async function TestRedirectPage() {
  console.log("🧪 Test redirect to Google");
  redirect("https://google.com");
  return null;
}