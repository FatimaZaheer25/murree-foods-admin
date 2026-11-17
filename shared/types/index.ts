export type Food = {
    slug: string;
    name: string;
    category: string;
    description: string;
    longDescription: string; // detail page ke liye
    price: number;
    time: number; // minutes
    rating: number;
    reviewCount: number;
    badge: string;
    image: string;
    gallery?: string[]; // detail page ki extra photos (sirf kuch khaanon ki)
    popular: boolean;
    vegetarian: boolean;
    spicy: boolean;
  };

export type CategorySummary = {
    name: string;
    slug: string;
    image: string;
    items: number; // is category mein kitni dishes
  };

export type HotelOption = { name: string; area: string; landmark?: string };

export type Locations = { hotels: HotelOption[]; areas: string[] };

export type Fees = { freeDeliveryThreshold: number; deliveryFee: number; serviceFee: number };

export type AdminHotel = { id: string; name: string; area: string; landmark: string; isActive: boolean };

// Help & Contact page aur footer. Khali string = woh option nahi dikhta
export type ContactInfo = {
  contactWhatsapp: string;
  contactPhone: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
};

// Orders lena: band/khula switch, roz ke auqaat ("HH:MM", dono khali = 24 ghante), kam az kam raqam
export type OrderRules = { minOrderAmount: number; acceptingOrders: boolean; openTime: string; closeTime: string };

export type AdminSettings = Fees & ContactInfo & OrderRules & { riderPayPerDelivery: number; areas: string[] };

// Abhi orders le rahe hain? message: band ho to customer ko kya dikhana hai
export type StoreStatus = { open: boolean; message: string; openTime: string; closeTime: string };

export type OrderReview = { stars: number; comment?: string; at: string };

// Admin "Messages" tab: Help & Contact form ke paigham
export type MessageStatus = "new" | "resolved";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  orderNumber: string | null;
  message: string;
  registered: boolean; // login kar ke bheja
  status: MessageStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
};

export type MessagesPage = {
  messages: ContactMessage[];
  counts: Record<MessageStatus | "all", number>;
  page: number;
  totalPages: number;
};

export type OrderStatus = "Confirmed" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";

// Order ki "tasveer" (snapshot): us waqt ka naam aur price save hota hai,
// taake baad mein foods.ts badle to purana order na badle
export type Order = {
    id: string; // jaise "MF-10512"
    date: string; // ISO tareekh
    status: OrderStatus;
    cancelReason?: string; // sirf Cancelled order mein: admin ki likhi wajah
    cancelledBy?: "admin" | "customer";
    review?: OrderReview; // deliver hone ke baad customer ki rating
    items: { slug?: string; name: string; price: number; quantity: number }[]; // price = ek item ki keemat; slug: Reorder ke liye
    subtotal?: number; // ye teen purane orders mein na hon to bhi page chale
    deliveryFee?: number;
    serviceFee?: number;
    total: number;
    customer: string;
    phone: string;
    location: string; // jaise "Pine View Guest House · Room 8"
    area?: string;
    instructions?: string;
    rider?: string; // customer ko pehla naam, admin ko poora naam
    riderVehicle?: string;
    riderPhone?: string; // customer ko sirf jab rider raste mein ho
    paymentMethod: "Cash on Delivery" | "Online Payment";
  };

// Admin ko order + kab kya hua
export type AdminOrder = Order & { history: { status: OrderStatus; at: string }[]; riderId?: string };

// Order Manage mein rider chunne ke liye
export type RiderOption = { id: string; name: string; vehicleType: VehicleType; online: boolean; activeOrder: string | null };

export type AdminOrderTab = "all" | "active" | "delivered" | "cancelled";

export type AdminOrdersPage = {
    orders: AdminOrder[];
    total: number;
    page: number;
    totalPages: number;
    counts: Record<AdminOrderTab, number>;
  };

// Admin ko dish poori milti hai, chhupi hui samait
export type AdminFood = Food & { gallery: string[]; isAvailable: boolean };

export type AdminCategory = { name: string; slug: string; isActive: boolean };

// Login user, jaisa backend bhejta hai
export type AuthUser = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: "customer" | "admin" | "rider";
    rider?: RiderInfo; // sirf rider account par
  };

export type VehicleType = "Bike" | "Motorcycle" | "Scooter" | "Car";

export type RiderStatus = "pending" | "approved" | "rejected" | "suspended";

// Rider ki maloomat (CNIC kabhi nahi: woh browser se bahar jata hi nahi)
export type RiderInfo = {
    status: RiderStatus;
    vehicleType: VehicleType;
    registration: string;
    reason?: string; // reject ya suspend ki wajah
  };

// Admin ke Riders tab ki ek line
export type AdminRider = RiderInfo & {
    id: string;
    name: string;
    email: string;
    phone: string;
    joined: string;
    statusChangedAt?: string;
    deliveriesToday: number;
    online: boolean;
    activeOrder: string | null;
    rating: number | null;
  };

export type AdminRidersPage = {
    riders: AdminRider[];
    total: number;
    page: number;
    totalPages: number;
    counts: Record<RiderStatus, number>;
  };
// ================= ADMIN REPORTS =================
// Ek din: us din place hue orders (Cancelled ke bina) aur us din deliver hue orders ka revenue
export type DayStats = { date: string; orders: number; revenue: number; delivered: number };

export type DashboardStats = {
    today: { date: string; orders: number; revenue: number; delivered: number };
    yesterday: { orders: number };
    active: { orders: number; amount: number };
    riders: { approved: number; online: number };
    week: DayStats[];
  };

export type AnalyticsReport = {
    days: number;
    totals: { orders: number; revenue: number; delivered: number; averageOrder: number; cancelled: number; cancelRate: number };
    daily: DayStats[];
    topDishes: { slug: string; name: string; quantity: number; revenue: number }[];
    byArea: { area: string; orders: number; revenue: number }[];
  };

export type AdminCustomer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    spent: number;
    lastOrder: string | null;
    joined: string;
  };

export type PaymentsRange = "today" | "7" | "30";

export type PaymentsReport = {
    range: PaymentsRange;
    summary: Record<"collected" | "pending" | "cancelled", { amount: number; count: number }>;
    payments: { id: string; date: string; customer: string; amount: number; method: string; rider: string | null }[];
    riders: { id: string; name: string; deliveries: number; earnings: number; cash: number }[];
    total: number;
    page: number;
    totalPages: number;
  };

// ================= RIDER PANEL =================
// Available Orders ki ek line (lene se pehle customer ka phone nahi)
export type AvailableOrder = {
    id: string;
    placedAt: string;
    status: OrderStatus;
    customer: string;
    location: string;
    area: string;
    type: string;
    items: number;
    amount: number;
  };

// Rider ki li hui delivery
export type ActiveDelivery = {
    id: string;
    status: OrderStatus;
    customer: string;
    phone: string;
    type: string;
    place: string;
    details: string;
    area: string;
    instructions: string;
    items: { name: string; quantity: number }[];
    total: number;
    paymentMethod: string;
    assignedAt?: string;
    pickedUpAt?: string;
  };

export type RiderTotals = { completed: number; earnings: number; cash: number };

export type RiderSummary = {
    online: boolean;
    payPerDelivery: number;
    today: RiderTotals & { assigned: number };
    week: RiderTotals;
    active: ActiveDelivery | null;
    notice: { id: string; reason: string } | null; // admin ne li hui delivery cancel kar di
  };

export type DeliveryRow = {
    id: string;
    customer: string;
    location: string;
    type: string;
    amount: number;
    status: OrderStatus;
    time: string;
    riderPay: number;
  };
