import { AssistantPage } from "./assistant-page";
import { BusinessOverview } from "./business-overview";
import type { Business } from "@orca-blitz/shared";

interface BusinessPageProps {
  page: string;
  business?: Business | null;
}

export function BusinessPage({ page, business }: BusinessPageProps) {
  const parts = page.split(":");
  const featureId = parts[1];

  return (
    <div className="relative h-full">
      {featureId === "assistant" ? (
        <AssistantPage businessId={parts[0]} />
      ) : business ? (
        <div className="p-6 overflow-y-auto h-full">
          <div className="mx-auto max-w-4xl">
            <BusinessOverview business={business} />
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
