import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import LiveOrdersTable from "../_components/LiveOrdersTable";

export const metadata: Metadata = { title: "Orders — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminOrdersPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Orders" />
      <LiveOrdersTable full />
    </>
  );
}
