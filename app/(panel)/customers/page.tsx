import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import CustomersTable from "../_components/CustomersTable";

export const metadata: Metadata = { title: "Customers — Admin · MurreeFoods.com" };

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminCustomersPage() {
  return (
    <>
      <PanelHeading label="Admin" title="Customers" />
      <CustomersTable />
    </>
  );
}
