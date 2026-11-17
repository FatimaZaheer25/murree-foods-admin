import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import RidersManager from "../_components/RidersManager";

export const metadata: Metadata = { title: "Riders — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminRidersPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Riders" />
      <RidersManager />
    </>
  );
}
