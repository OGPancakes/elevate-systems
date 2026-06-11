export type MenuCategory = "Sandwiches" | "Pizza" | "Bowls" | "Sides" | "Drinks";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  popular?: boolean;
  vegetarian?: boolean;
  available: boolean;
  accent: string;
  initials: string;
  image: string;
  ingredients: string[];
  allergens: string[];
  glutenFree?: boolean;
};

export type CartItem = MenuItem & {
  quantity: number;
  notes?: string;
};

export type OrderStatus = "New" | "Preparing" | "Ready" | "Completed";

export type Order = {
  id: string;
  customer: string;
  phone: string;
  email?: string;
  type: "Pickup" | "Delivery";
  address?: string;
  notes?: string;
  allergyNotes?: string;
  items: { name: string; quantity: number; notes?: string }[];
  total: number;
  status: OrderStatus;
  placedAt: string;
  promiseTime: string;
  source: "Online" | "AI Assistant";
};

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};
