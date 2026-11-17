import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import MessagesManager from "../_components/MessagesManager";

export const metadata: Metadata = { title: "Messages — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminMessagesPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Messages" />
      <MessagesManager />
    </>
  );
}
