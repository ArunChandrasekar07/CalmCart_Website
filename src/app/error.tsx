"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState, Page } from "@/components/ui/States";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Page>
      <EmptyState emoji="🫖" title="Something went wrong" body="That didn't load properly. Try again in a moment." action={<Button onClick={reset}>Try again</Button>} />
    </Page>
  );
}
