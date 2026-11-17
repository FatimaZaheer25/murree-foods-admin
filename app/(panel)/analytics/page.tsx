import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import AnalyticsView from "../_components/AnalyticsView";

export const metadata: Metadata = { title: "Analytics — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminAnalyticsPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Analytics" />
      <AnalyticsView />
    </>
  );
}
