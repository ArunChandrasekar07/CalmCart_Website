import { EmptyState, Page } from "@/components/ui/States";

export default function NotFound() {
  return <Page><EmptyState emoji="🧭" title="We couldn't find that page" body="The link may be old, or the product may no longer be available." action={{ href: "/", label: "Back to CalmCart" }} /></Page>;
}
