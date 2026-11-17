import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import PaymentsView from "../_components/PaymentsView";

export const metadata: Metadata = { title: "Payments — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminPaymentsPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Payments" />
      <PaymentsView />
    </>
  );
}
