import type { Metadata } from "next";
import PanelHeading from "@murree/shared/components/ui/PanelHeading";
import DashboardStats from "./_components/DashboardStats";
import LiveOrdersTable from "./_components/LiveOrdersTable";

export const metadata: Metadata = {
  title: "Admin Dashboard — MurreeFoods.com",
};

// Login ke peeche wala page: wajah app/(panel)/layout.tsx mein likhi hai
export const instant = false;

export default function AdminDashboard() {
  return (
    <>
      <PanelHeading label="Admin" title="Dashboard" />

      {/* Cards + 7 din ke charts, asli orders se */}
      <DashboardStats />

      <div className="mt-6">
        <LiveOrdersTable />
      </div>
    </>
  );
}
