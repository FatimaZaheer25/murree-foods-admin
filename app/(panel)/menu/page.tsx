import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import MenuManager from "../_components/MenuManager";

export const metadata: Metadata = { title: "Menu — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminMenuPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Menu" />
      <MenuManager />
    </>
  );
}
