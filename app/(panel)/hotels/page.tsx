import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import HotelsManager from "../_components/HotelsManager";

export const metadata: Metadata = { title: "Hotels — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminHotelsPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Hotels" />
      <HotelsManager />
    </>
  );
}
