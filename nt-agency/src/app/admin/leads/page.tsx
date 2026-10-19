import { Suspense } from "react";
import { Spinner } from "@/components/ui";
import { LeadsView } from "./LeadsView";

export const metadata = { title: "Leads" };

// LeadsView reads useSearchParams, which needs a Suspense boundary.
export default function LeadsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LeadsView />
    </Suspense>
  );
}
