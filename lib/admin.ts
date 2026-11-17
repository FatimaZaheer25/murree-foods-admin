import { api } from "@murree/shared/lib/api";
import type {
  AdminCategory,
  AdminCustomer,
  AdminFood,
  AdminHotel,
  AdminOrder,
  AdminOrdersPage,
  AdminOrderTab,
  AdminRider,
  AdminRidersPage,
  AdminSettings,
  AnalyticsReport,
  ContactMessage,
  DashboardStats,
  MessagesPage,
  PaymentsRange,
  PaymentsReport,
  RiderOption,
  RiderStatus,
  VehicleType,
} from "@murree/shared/types";

// Admin panel ki calls. Backend har ek par admin role check karta hai

type HotelInput = { name: string; area: string; landmark?: string; isActive?: boolean };
type HotelResponse = { success: true; message: string; hotel: AdminHotel };
type SettingsResponse = { success: true; settings: AdminSettings };

export const listHotels = () => api<{ success: true; hotels: AdminHotel[] }>("/admin/hotels");

export const createHotel = (body: HotelInput) => api<HotelResponse>("/admin/hotels", { method: "POST", body });

export const updateHotel = (id: string, body: Partial<HotelInput>) =>
  api<HotelResponse>(`/admin/hotels/${id}`, { method: "PATCH", body });

export const deleteHotel = (id: string) => api<{ success: true; message: string }>(`/admin/hotels/${id}`, { method: "DELETE" });

export const getAdminSettings = () => api<SettingsResponse>("/admin/settings");

export const updateAdminSettings = (body: AdminSettings) =>
  api<SettingsResponse & { message: string }>("/admin/settings", { method: "PATCH", body });

// ================= ORDERS =================
type OrderResponse = { success: true; message: string; order: AdminOrder };

export const listAdminOrders = ({ status, q, page }: { status: AdminOrderTab; q?: string; page: number }) => {
  const params = new URLSearchParams({ status, page: String(page) });
  if (q) params.set("q", q);
  return api<{ success: true } & AdminOrdersPage>(`/admin/orders?${params}`);
};

export const updateOrderStatus = (orderNumber: string, status: "Preparing" | "Out for Delivery" | "Delivered") =>
  api<OrderResponse>(`/admin/orders/${encodeURIComponent(orderNumber)}/status`, { method: "PATCH", body: { status } });

export const cancelAdminOrder = (orderNumber: string, reason: string) =>
  api<OrderResponse>(`/admin/orders/${encodeURIComponent(orderNumber)}/cancel`, { method: "POST", body: { reason } });

// ================= MENU =================
// Slug backend naam se banata hai, is liye bhejte nahi
export type FoodInput = Omit<AdminFood, "slug">;
type FoodResponse = { success: true; message: string; food: AdminFood };

export const listAdminFoods = () =>
  api<{ success: true; foods: AdminFood[]; categories: AdminCategory[] }>("/admin/foods");

export const createFood = (body: FoodInput) => api<FoodResponse>("/admin/foods", { method: "POST", body });

export const updateFood = (slug: string, body: Partial<FoodInput>) =>
  api<FoodResponse>(`/admin/foods/${encodeURIComponent(slug)}`, { method: "PATCH", body });

// ================= REPORTS =================
export const getDashboardStats = () => api<{ success: true } & DashboardStats>("/admin/stats/dashboard");

export const getAnalytics = (days: 7 | 30 | 90) => api<{ success: true } & AnalyticsReport>(`/admin/stats/analytics?days=${days}`);

export const listCustomers = ({ q, page }: { q?: string; page: number }) => {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  return api<{ success: true; customers: AdminCustomer[]; total: number; page: number; totalPages: number }>(`/admin/customers?${params}`);
};

export const getPayments = ({ range, page }: { range: PaymentsRange; page: number }) =>
  api<{ success: true } & PaymentsReport>(`/admin/payments?range=${range}&page=${page}`);

// ================= RIDERS =================
export type RiderAction = "approve" | "reject" | "suspend" | "reactivate";
export type RiderEdit = { name?: string; phone?: string; vehicleType?: VehicleType; registration?: string };
type RiderResponse = { success: true; message: string; rider: AdminRider };

export const listRiders = ({ status, q, page }: { status: RiderStatus; q?: string; page: number }) => {
  const params = new URLSearchParams({ status, page: String(page) });
  if (q) params.set("q", q);
  return api<{ success: true } & AdminRidersPage>(`/admin/riders?${params}`);
};

export const changeRiderStatus = (id: string, action: RiderAction, reason?: string) =>
  api<RiderResponse>(`/admin/riders/${id}/status`, { method: "PATCH", body: { action, reason } });

export const updateRider = (id: string, body: RiderEdit) =>
  api<RiderResponse>(`/admin/riders/${id}`, { method: "PATCH", body });

export const listRiderOptions = () => api<{ success: true; riders: RiderOption[] }>("/admin/riders/options");

// riderId null: rider hatao
export const assignOrderRider = (orderNumber: string, riderId: string | null) =>
  api<{ success: true; message: string; order: AdminOrder }>(`/admin/orders/${encodeURIComponent(orderNumber)}/rider`, {
    method: "PATCH",
    body: { riderId },
  });

// ================= MESSAGES =================
export const listMessages = ({ status, page }: { status: "new" | "resolved" | "all"; page: number }) =>
  api<{ success: true } & MessagesPage>(`/admin/messages?status=${status}&page=${page}`);

export const setMessageResolved = (id: string, resolved: boolean) =>
  api<{ success: true; message: string; contactMessage: ContactMessage }>(`/admin/messages/${id}`, {
    method: "PATCH",
    body: { resolved },
  });
