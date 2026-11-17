"use client";

import {
  Bike,
  ChartColumn,
  CreditCard,
  Hotel,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingBag,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import PanelShell, { type PanelNavItem } from "@murree/shared/components/ui/PanelShell";
import type { OrderAlertSource } from "@murree/shared/components/ui/NewOrderAlerts";
import { listAdminOrders } from "@/lib/admin";

// Har tab ka apna URL
const nav: PanelNavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/riders", label: "Riders", icon: Bike },
  { href: "/hotels", label: "Hotels", icon: Hotel },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Naye orders ki ghanti: "Confirmed" orders (abhi aaye, kitchen ne shuru nahi kiya)
const orderAlerts: OrderAlertSource = {
  load: () =>
    listAdminOrders({ status: "active", page: 1 }).then(({ orders }) =>
      orders.filter((order) => order.status === "Confirmed").map((order) => order.id)
    ),
  href: "/orders",
  label: "New order",
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <PanelShell nav={nav} note="Operations panel" logoutTo="/login" alerts={orderAlerts}>
      {children}
    </PanelShell>
  );
}
