import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import SettingsForm from "../_components/SettingsForm";

export const metadata: Metadata = { title: "Settings — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminSettingsPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Settings" />
      <SettingsForm />
    </>
  );
}
