"use client";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CookingPot,
  Headphones,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  PackageCheck,
  PanelLeftClose,
  Phone,
  PhoneCall,
  Plus,
  Radio,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { initialOrders, menuItems as initialMenu } from "@/lib/elevate-orders-data";
import type { CartItem, ChatMessage, MenuCategory, MenuItem, Order, OrderStatus } from "@/lib/elevate-orders-types";

type View = "storefront" | "overview" | "live" | "kitchen" | "orders" | "menu" | "phone" | "customers" | "analytics" | "settings";

type LiveSession = {
  id: string;
  guest: string;
  channel: "AI chat" | "Online" | "Phone";
  stage: "Browsing menu" | "Chatting with June" | "Reviewing cart" | "Calling";
  detail: string;
  startedAt: string;
};

type VoiceEvent = {
  id: string;
  callSid: string;
  from: string;
  status: string;
  detail: string;
  createdAt: string;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const categories: Array<"All" | MenuCategory> = ["All", "Sandwiches", "Pizza", "Bowls", "Sides", "Drinks"];

export default function Home() {
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [view, setView] = useState<View>("storefront");
  const [menu, setMenu] = useState(initialMenu);
  const [orders, setOrders] = useState(initialOrders);
  const [sessions, setSessions] = useState<LiveSession[]>([
    { id: "session-demo-1", guest: "Guest 184", channel: "AI chat", stage: "Chatting with June", detail: "Looking for a spicy dinner under $30", startedAt: "Just now" },
    { id: "session-demo-2", guest: "Caller ending 4412", channel: "Phone", stage: "Calling", detail: "AI phone host is confirming a pickup order", startedAt: "1 min ago" },
    { id: "session-demo-3", guest: "Guest 097", channel: "Online", stage: "Reviewing cart", detail: "2 items · $26.00", startedAt: "3 min ago" },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [allergyNotes, setAllergyNotes] = useState("");

  useEffect(() => {
    const adminPath = window.location.pathname.includes("elevateorders-admin");
    setIsAdminPath(adminPath);
    if (adminPath) setView("overview");
    setAdminAuthenticated(sessionStorage.getItem("elevate-orders-admin") === "true");
    const storedOrders = localStorage.getItem("elevate-orders-orders");
    const storedMenu = localStorage.getItem("elevate-orders-menu");
    const storedSessions = localStorage.getItem("elevate-orders-sessions");
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    if (storedMenu) {
      const savedMenu = JSON.parse(storedMenu) as MenuItem[];
      setMenu(initialMenu.map((defaultItem) => ({
        ...defaultItem,
        ...(savedMenu.find((item) => item.id === defaultItem.id) ?? {}),
        image: defaultItem.image,
      })));
    }
    if (storedSessions) setSessions(JSON.parse(storedSessions));
    setDataLoaded(true);
    const sync = (event: StorageEvent) => {
      if (event.key === "elevate-orders-orders" && event.newValue) setOrders(JSON.parse(event.newValue));
      if (event.key === "elevate-orders-menu" && event.newValue) setMenu(JSON.parse(event.newValue));
      if (event.key === "elevate-orders-sessions" && event.newValue) setSessions(JSON.parse(event.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem("elevate-orders-orders", JSON.stringify(orders));
  }, [dataLoaded, orders]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem("elevate-orders-menu", JSON.stringify(menu));
  }, [dataLoaded, menu]);

  useEffect(() => {
    if (!dataLoaded) return;
    localStorage.setItem("elevate-orders-sessions", JSON.stringify(sessions));
  }, [dataLoaded, sessions]);

  useEffect(() => {
    if (!isAdminPath) return;
    let active = true;

    const syncVoiceEvents = async () => {
      try {
        const response = await fetch("/api/voice/events", { cache: "no-store" });
        const data = await response.json() as { events?: VoiceEvent[] };
        if (!active || !data.events?.length) return;
        const callSessions = Array.from(
          data.events.reduce((calls, event) => {
            if (!calls.has(event.callSid)) {
              calls.set(event.callSid, {
                id: `twilio-${event.callSid}`,
                guest: event.from,
                channel: "Phone",
                stage: "Calling",
                detail: event.detail,
                startedAt: new Date(event.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              } satisfies LiveSession);
            }
            return calls;
          }, new Map<string, LiveSession>()),
        ).map(([, session]) => session);
        setSessions((current) => [
          ...callSessions,
          ...current.filter((session) => !session.id.startsWith("twilio-")),
        ].slice(0, 12));
      } catch {
        // Keep the rest of the demo available if the voice event feed is offline.
      }
    };

    syncVoiceEvents();
    const timer = window.setInterval(syncVoiceEvents, 2000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isAdminPath]);

  const updateSession = (session: LiveSession) => {
    setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)].slice(0, 12));
  };

  const addItem = (item: MenuItem) => {
    setCart((current) => {
      const found = current.find((cartItem) => cartItem.id === item.id);
      if (found) {
        return current.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, amount: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const placeOrder = (customer: {
    name: string;
    phone: string;
    email: string;
    type: "Pickup" | "Delivery";
    address: string;
    notes: string;
    allergyNotes: string;
  }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const now = new Date();
    const promise = new Date(now.getTime() + (customer.type === "Delivery" ? 40 : 20) * 60000);
    const order: Order = {
      id: `EO-${1049 + orders.length}`,
      customer: customer.name,
      phone: customer.phone,
      email: customer.email,
      type: customer.type,
      address: customer.type === "Delivery" ? customer.address : undefined,
      notes: customer.notes || undefined,
      allergyNotes: customer.allergyNotes || undefined,
      items: cart.map(({ name, quantity, notes }) => ({ name, quantity, notes })),
      total: subtotal * 1.08,
      status: "New",
      placedAt: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      promiseTime: promise.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      source: "Online",
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
    setOrderNotes("");
    setAllergyNotes("");
  };

  if (isAdminPath && !adminAuthenticated) {
    return <AdminLogin onSuccess={() => {
      sessionStorage.setItem("elevate-orders-admin", "true");
      setAdminAuthenticated(true);
      setView("overview");
    }} />;
  }

  if (!isAdminPath) {
    return (
      <>
        <Storefront
          menu={menu}
          cart={cart}
          addItem={addItem}
          updateQuantity={updateQuantity}
          openAssistant={() => {
            setAssistantOpen(true);
            updateSession({
              id: "current-ai-guest",
              guest: "Live web guest",
              channel: "AI chat",
              stage: "Chatting with June",
              detail: "June greeted the guest and is waiting for a craving",
              startedAt: "Just now",
            });
          }}
          openCheckout={() => setCheckoutOpen(true)}
          openDashboard={() => { window.location.href = "/elevateorders-admin"; }}
        />
        {assistantOpen && (
          <AssistantPanel
            menu={menu}
            addItem={addItem}
            allergyNotes={allergyNotes}
            setAllergyNotes={setAllergyNotes}
            openCheckout={() => {
              setAssistantOpen(false);
              setCheckoutOpen(true);
            }}
            onActivity={(detail) => updateSession({
              id: "current-ai-guest",
              guest: "Live web guest",
              channel: "AI chat",
              stage: "Chatting with June",
              detail,
              startedAt: "Just now",
            })}
            close={() => setAssistantOpen(false)}
          />
        )}
        {checkoutOpen && (
          <CheckoutModal
            cart={cart}
            initialNotes={orderNotes}
            initialAllergyNotes={allergyNotes}
            close={() => setCheckoutOpen(false)}
            placeOrder={placeOrder}
          />
        )}
      </>
    );
  }

  return (
    <OperationsShell view={view} setView={setView} orderCount={orders.filter((order) => order.status !== "Completed").length} sessionCount={sessions.length}>
      {view === "overview" && <Overview orders={orders} sessions={sessions} setView={setView} />}
      {view === "live" && <LiveActivity sessions={sessions} orders={orders} />}
      {view === "kitchen" && <Kitchen orders={orders} setOrders={setOrders} />}
      {view === "orders" && <Orders orders={orders} />}
      {view === "menu" && <MenuManager menu={menu} setMenu={setMenu} />}
      {view === "phone" && <PhoneSetup />}
      {view === "customers" && <Customers orders={orders} />}
      {view === "analytics" && <Analytics orders={orders} />}
      {view === "settings" && <RestaurantSettings />}
    </OperationsShell>
  );
}

function Storefront({
  menu,
  cart,
  addItem,
  updateQuantity,
  openAssistant,
  openCheckout,
  openDashboard,
}: {
  menu: MenuItem[];
  cart: CartItem[];
  addItem: (item: MenuItem) => void;
  updateQuantity: (id: string, amount: number) => void;
  openAssistant: () => void;
  openCheckout: () => void;
  openDashboard: () => void;
}) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [cartPulse, setCartPulse] = useState(false);
  const filtered = menu.filter(
    (item) =>
      item.available &&
      (category === "All" || item.category === category) &&
      `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const previousItemCount = useRef(itemCount);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  useEffect(() => {
    if (itemCount > previousItemCount.current) {
      setCartPulse(true);
      const timer = window.setTimeout(() => setCartPulse(false), 700);
      previousItemCount.current = itemCount;
      return () => window.clearTimeout(timer);
    }
    previousItemCount.current = itemCount;
  }, [itemCount]);
  const addWithAnimation = (item: MenuItem) => {
    addItem(item);
    setAddedItem(item.id);
    window.setTimeout(() => setAddedItem(null), 700);
  };

  return (
    <main className="storefront">
      <header className="store-header">
        <button className="brand-logo-button" aria-label="Elevate Orders home">
          <Image className="brand-logo-image" src="/elevate-orders-logo-transparent.png" width={170} height={64} alt="Elevate Orders" priority />
        </button>
        <div className="restaurant-name">
          <span className="open-dot" />
          <span><b>Juniper &amp; Stone</b><small>Open today until 9:00 PM</small></span>
        </div>
        <div className="header-actions">
          <a className="call-order-link" href="tel:+15550140198"><Phone size={15} /><span>Call to order</span><b>(555) 014-0198</b></a>
          <button className="text-button" onClick={openDashboard}>Restaurant login</button>
          <button className={`cart-button ${cartPulse ? "cart-pulse" : ""}`} aria-label={`Open my order, ${itemCount} ${itemCount === 1 ? "item" : "items"}`} onClick={() => setCartOpen(!cartOpen)}>
            <ShoppingBag size={18} />
            <span>My order</span>
            <b>{itemCount}</b>
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> MADE FRESH. ORDERED EASY.</span>
          <h1>Good food,<br /><em>without the wait.</em></h1>
          <p>Local ingredients, bold flavors, and your favorites made to order. Pickup in about 20 minutes.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>
              Explore the menu <ArrowRight size={17} />
            </button>
            <button className="assistant-link" onClick={openAssistant}>
              <span><Bot size={20} /></span>
              <span><b>Not sure what to get?</b><small>Order with our AI assistant</small></span>
            </button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="plate">
            <div className="plate-inner">
              <span className="ingredient tomato one" />
              <span className="ingredient tomato two" />
              <span className="ingredient green one" />
              <span className="ingredient green two" />
              <span className="ingredient grain one" />
              <span className="ingredient grain two" />
              <span className="ingredient protein" />
              <span className="sauce" />
            </div>
          </div>
          <span className="leaf leaf-one">⌁</span>
          <span className="leaf leaf-two">⌁</span>
          <div className="pickup-card"><Clock3 size={18} /><span><b>Ready in 20 min</b><small>Pickup at 18 Oak Street</small></span></div>
        </div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <div><span className="eyebrow">OUR MENU</span><h2>Made for right now.</h2></div>
          <div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the menu" /></div>
        </div>
        <div className="category-tabs">
          {categories.map((item) => (
            <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>
          ))}
        </div>
        <div className="menu-grid">
          {filtered.map((item) => (
            <article className="menu-card" key={item.id}>
              <div className="food-visual" style={{ "--food-accent": item.accent } as React.CSSProperties}>
                <Image src={item.image} alt={item.name} fill sizes="(max-width: 760px) 100vw, 33vw" />
                {item.popular && <b>Popular</b>}
              </div>
              <div className="menu-card-body">
                <div className="menu-card-title"><h3>{item.name}</h3><strong>{money.format(item.price)}</strong></div>
                <p>{item.description}</p>
                <div className="menu-card-footer">
                  <span>{item.vegetarian ? "Vegetarian" : item.category}</span>
                  <button className={addedItem === item.id ? "added" : ""} onClick={() => addWithAnimation(item)} aria-label={`Add ${item.name}`}>
                    {addedItem === item.id ? <Check size={18} /> : <Plus size={18} />}
                    <span className="add-burst" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-banner">
        <div className="ai-orb"><Sparkles size={28} /></div>
        <div><span className="eyebrow">YOUR PERSONAL ORDER GUIDE</span><h2>Tell us what you&apos;re craving.</h2><p>Our AI assistant knows the whole menu, dietary details, and the best pairings.</p></div>
        <button className="ai-banner-button" onClick={openAssistant}><span>Start an order</span> <MessageCircle size={18} /></button>
      </section>

      <footer className="store-footer">
        <Image className="footer-logo-image" src="/elevate-orders-logo-transparent.png" width={170} height={70} alt="Elevate Orders" />
        <p>Thoughtful ordering technology for neighborhood restaurants.</p>
        <span>Powered by Elevate Systems</span>
      </footer>

      {cartOpen && (
        <aside className="cart-drawer">
          <div className="drawer-header"><div><span className="eyebrow">YOUR ORDER</span><h2>Almost yours.</h2></div><button onClick={() => setCartOpen(false)}><X /></button></div>
          <div className="cart-items">
            {cart.length === 0 && <div className="empty-state"><ShoppingBag /><h3>Your bag is empty</h3><p>Add something delicious from the menu.</p></div>}
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div><b>{item.name}</b><span>{money.format(item.price)}</span></div>
                <div className="quantity"><button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button></div>
              </div>
            ))}
          </div>
          {cart.length > 0 && <div className="cart-total"><div><span>Subtotal</span><b>{money.format(subtotal)}</b></div><small>Taxes calculated at checkout</small><button className="primary-button" onClick={openCheckout}>Checkout <ArrowRight size={17} /></button></div>}
        </aside>
      )}
    </main>
  );
}

function AssistantPanel({
  menu,
  addItem,
  allergyNotes,
  setAllergyNotes,
  openCheckout,
  onActivity,
  close,
}: {
  menu: MenuItem[];
  addItem: (item: MenuItem) => void;
  allergyNotes: string;
  setAllergyNotes: (notes: string) => void;
  openCheckout: () => void;
  onActivity: (detail: string) => void;
  close: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, I’m June. Tell me what you’re in the mood for, and I’ll help build your order." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState<MenuItem[]>([]);
  const [itemsAdded, setItemsAdded] = useState(false);
  const [bundleAdded, setBundleAdded] = useState(false);
  const [addedRecommendation, setAddedRecommendation] = useState<string | null>(null);
  const suggestions = ["Something spicy", "A filling vegetarian meal", "A meaty meal under $20", "Lunch under $20"];

  const ingredientAnswer = (text: string) => {
    const lower = text.toLowerCase();
    const item = menu.find((menuItem) => lower.includes(menuItem.name.toLowerCase()))
      ?? menu.find((menuItem) => menuItem.name.toLowerCase().split(" ").some((word) => word.length > 4 && lower.includes(word)));
    if (!item || !/\b(ingredient|allergen|allergy|contain|gluten|dairy|egg|nut|soy|sesame)\b/i.test(text)) return undefined;

    const allergens = item.allergens.length ? item.allergens.join(", ") : "no listed major allergens";
    return `${item.name} is made with ${item.ingredients.join(", ")}. Listed allergens: ${allergens}. ${
      item.glutenFree ? "It does not contain a listed gluten ingredient" : "It is not listed as gluten-free"
    }, but the restaurant must still confirm cross-contact safety for any allergy.`;
  };

  const captureAllergy = (text: string) => {
    if (!/\b(allerg(?:y|ic)|celiac|cannot have|can't have|avoid|intoleran)\b/i.test(text)) return;
    const known = ["gluten", "dairy", "milk", "egg", "peanut", "tree nut", "soy", "sesame", "wheat", "shellfish"];
    const found = known.filter((allergen) => text.toLowerCase().includes(allergen));
    const label = found.length ? found.join(", ").toUpperCase() : "GUEST-REPORTED";
    const note = `${label} ALLERGY / DIETARY ALERT - confirm ingredients and prevent cross-contact with the guest.`;
    setAllergyNotes(note);
    onActivity(`June captured an allergy alert: ${label}`);
  };

  const addRecommendedBundle = () => {
    if (!recommendedItems.length) return;
    recommendedItems.forEach(addItem);
    setItemsAdded(true);
    setBundleAdded(true);
    setMessages((current) => [...current, {
      role: "assistant",
      content: `Done. I added ${recommendedItems.map((item) => item.name).join(" and ")} to your order. You can review the cart or head straight to checkout.`,
    }]);
    onActivity(`June added ${recommendedItems.length} item${recommendedItems.length > 1 ? "s" : ""} to the guest's cart`);
    window.setTimeout(() => {
      setRecommendedItems([]);
      setBundleAdded(false);
    }, 650);
  };

  const chooseItems = (text: string, responseText = "") => {
    const latest = text.toLowerCase();
    const response = responseText.toLowerCase();
    const mentioned = menu.filter((item) => response.includes(item.name.toLowerCase()));
    if (mentioned.length) return mentioned.slice(0, 3);

    if (latest.includes("spicy")) return menu.filter((item) => ["hot-honey-pie", "garlic-knots"].includes(item.id));
    if (latest.includes("vegetarian") || latest.includes("veggie") || latest.includes("no meat")) {
      return menu.filter((item) => ["market-bowl", "blood-orange"].includes(item.id));
    }
    if (latest.includes("meat") || latest.includes("chicken") || latest.includes("filling")) {
      return menu.filter((item) => ["chicken-bowl", "blood-orange"].includes(item.id));
    }
    if (latest.includes("pizza")) return menu.filter((item) => ["hot-honey-pie", "garlic-knots"].includes(item.id));
    if (latest.includes("sandwich") || latest.includes("lunch") || latest.includes("under 20") || latest.includes("$20")) {
      return menu.filter((item) => ["turkey-club", "blood-orange"].includes(item.id));
    }
    return menu.filter((item) => ["italian-stack", "crispy-potatoes"].includes(item.id));
  };

  const buildMealResponse = (latestText: string, conversationText: string) => {
    const latest = latestText.toLowerCase();
    const hasBudget = /under\s*\$?20|\$20|less than\s*\$?20/.test(conversationText.toLowerCase());
    const pick = (ids: string[]) => menu.filter((item) => ids.includes(item.id));

    if (latest.includes("spicy")) {
      const items = pick(["hot-honey-pie", "garlic-knots"]);
      return { items, message: "For something spicy, I’d pair the Hot Honey Pepperoni with Garlic Knots. It is bold, savory, and $26 before tax. Would you like me to add both?" };
    }
    if (latest.includes("vegetarian") || latest.includes("veggie") || latest.includes("no meat")) {
      const items = latest.includes("pizza") ? pick(["garden-pie"]) : pick(["market-bowl", "blood-orange"]);
      return { items, message: latest.includes("pizza")
        ? "The Garden Pie is a colorful vegetarian choice at $18. Would you like me to add it?"
        : "The Market Veggie Bowl with a Blood Orange Soda is filling, vegetarian, and $17.50 before tax. Would you like me to add both?" };
    }
    if (latest.includes("meat") || latest.includes("chicken") || latest.includes("filling")) {
      const items = hasBudget || latest.includes("under") ? pick(["chicken-bowl", "blood-orange"]) : pick(["italian-stack", "crispy-potatoes"]);
      return { items, message: hasBudget || latest.includes("under")
        ? "For a filling meat option under $20, I’d pair the Charred Chicken Bowl with a Blood Orange Soda for $18.75 before tax. Would you like me to add both?"
        : "For a hearty meat-forward meal, I’d pair The Italian Stack with Crispy Potatoes for $21 before tax. Would you like me to add both?" };
    }
    if (latest.includes("under 20") || latest.includes("$20") || latest.includes("lunch")) {
      const items = pick(["turkey-club", "blood-orange"]);
      return { items, message: "The Roasted Turkey Club with a Blood Orange Soda makes a complete lunch for $17.25 before tax. Would you like me to add both?" };
    }
    if (latest.includes("pizza")) {
      const items = pick(["hot-honey-pie", "garlic-knots"]);
      return { items, message: "The Hot Honey Pepperoni and Garlic Knots are a guest-favorite pizza pairing at $26 before tax. Should I add both?" };
    }
    return undefined;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    onActivity(`Guest said: "${text.slice(0, 62)}${text.length > 62 ? "..." : ""}"`);
    setInput("");
    setItemsAdded(false);
    captureAllergy(text);

    const confirmation = /^(yes|yeah|yep|sure|okay|ok|add|do it|sounds good|i'll take|ill take|that works)/i.test(text.trim())
      || /\b(add both|add them|add it|place the order|checkout)\b/i.test(text);
    if (confirmation && recommendedItems.length) {
      addRecommendedBundle();
      return;
    }

    const conversationText = nextMessages.filter((message) => message.role === "user").map((message) => message.content).join(" ");
    const ingredients = ingredientAnswer(text);
    if (ingredients) {
      setRecommendedItems([]);
      setMessages((current) => [...current, { role: "assistant", content: ingredients }]);
      return;
    }
    const mealResponse = buildMealResponse(text, conversationText);
    if (mealResponse) {
      setRecommendedItems(mealResponse.items);
      setMessages((current) => [...current, { role: "assistant", content: mealResponse.message }]);
      onActivity(`June built a ${mealResponse.items.length}-item meal for the guest`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, menu }),
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
      setRecommendedItems(chooseItems(text, data.message));
      onActivity(`June recommended a menu match for "${text.slice(0, 38)}"`);
    } catch {
      const matches = chooseItems(text);
      setRecommendedItems(matches);
      setMessages((current) => [...current, { role: "assistant", content: `I would go with ${matches.map((item) => item.name).join(" and ")}. Would you like me to add ${matches.length > 1 ? "both" : "it"} to your order?` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-backdrop" onMouseDown={close}>
      <aside className="assistant-panel" onMouseDown={(event) => event.stopPropagation()}>
        <div className="assistant-header">
          <div className="assistant-avatar"><Bot /></div>
          <div><b>Order with June</b><span><i /> AI menu assistant</span></div>
          <button onClick={close}><X /></button>
        </div>
        <div className="assistant-intro">
          <span className="eyebrow"><Sparkles size={13} /> PERSONALIZED FOR YOU</span>
          <h2>What sounds good?</h2>
          <p>Ask about ingredients, dietary needs, or let me build your whole meal.</p>
          {allergyNotes && <div className="assistant-allergy"><AlertTriangle size={15} /><span><b>Allergy alert saved</b>{allergyNotes}</span></div>}
        </div>
        <div className="messages">
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</div>
          ))}
          {loading && <div className="message assistant typing"><span /><span /><span /></div>}
          {recommendedItems.length > 0 && (
            <div className="recommendation-stack">
              {recommendedItems.map((item) => (
                <div className="recommendation-card" key={item.id}>
                  <Image className="recommendation-image" src={item.image} alt="" width={52} height={52} />
                  <div><b>{item.name}</b><span>{money.format(item.price)}</span></div>
                  <button className={addedRecommendation === item.id ? "added" : ""} onClick={() => {
                    addItem(item);
                    setItemsAdded(true);
                    setAddedRecommendation(item.id);
                    window.setTimeout(() => setAddedRecommendation(null), 700);
                  }}>{addedRecommendation === item.id ? <Check size={16} /> : <Plus size={16} />} {addedRecommendation === item.id ? "Added" : "Add"}</button>
                </div>
              ))}
              <div className="recommendation-total">
                <span>Suggested total</span>
                <b>{money.format(recommendedItems.reduce((sum, item) => sum + item.price, 0))}</b>
              </div>
              <button className={`add-meal-button ${bundleAdded ? "added" : ""}`} onClick={addRecommendedBundle}>
                {bundleAdded ? <Check size={16} /> : <Plus size={16} />} {bundleAdded ? "Meal added" : "Add suggested meal"}
              </button>
            </div>
          )}
          {itemsAdded && <button className="assistant-checkout" onClick={openCheckout}>Review and checkout <ArrowRight size={16} /></button>}
        </div>
        <div className="suggestion-chips">
          {suggestions.map((suggestion) => <button onClick={() => sendMessage(suggestion)} key={suggestion}>{suggestion}</button>)}
        </div>
        <form className="chat-input" onSubmit={(event) => { event.preventDefault(); sendMessage(input); }}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tell June what you’re craving..." />
          <button aria-label="Send message" disabled={!input.trim() || loading}><Send size={18} /></button>
        </form>
        <small className="ai-disclaimer">AI can make mistakes. Please confirm allergy information with the restaurant.</small>
      </aside>
    </div>
  );
}

function CheckoutModal({
  cart,
  initialNotes,
  initialAllergyNotes,
  close,
  placeOrder,
}: {
  cart: CartItem[];
  initialNotes: string;
  initialAllergyNotes: string;
  close: () => void;
  placeOrder: (customer: {
    name: string;
    phone: string;
    email: string;
    type: "Pickup" | "Delivery";
    address: string;
    notes: string;
    allergyNotes: string;
  }) => void;
}) {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    type: "Pickup" as "Pickup" | "Delivery",
    address: "",
    notes: initialNotes,
    allergyNotes: initialAllergyNotes,
  });
  const [stage, setStage] = useState<"form" | "processing" | "success">("form");
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setStage("processing");
    window.setTimeout(() => {
      placeOrder(customer);
      setStage("success");
    }, 1800);
  };

  if (stage === "processing") {
    return (
      <div className="modal-backdrop">
        <div className="checkout-modal checkout-processing">
          <div className="order-loader"><span /><span /><span /><CookingPot /></div>
          <span className="eyebrow">SENDING TO THE KITCHEN</span>
          <h2>Making it official...</h2>
          <p>June is double-checking your order and reserving your {customer.type.toLowerCase()} time.</p>
          <div className="processing-steps"><span className="done"><Check /> Order checked</span><span className="active"><Radio /> Kitchen connected</span><span><Clock3 /> {customer.type} time reserved</span></div>
        </div>
      </div>
    );
  }

  if (stage === "success") {
    return (
      <div className="modal-backdrop celebration-backdrop">
        <div className="confetti">{Array.from({ length: 18 }).map((_, index) => <i key={index} />)}</div>
        <div className="checkout-modal checkout-success">
          <div className="success-ring"><Check /></div>
          <span className="eyebrow">ORDER RECEIVED</span>
          <h2>You&apos;re all set, {customer.name.split(" ")[0]}!</h2>
          <p>The kitchen has your order. {customer.type === "Delivery" ? <>We&apos;ll send it out in about <b>40 minutes</b>.</> : <>We&apos;ll have it ready in about <b>20 minutes</b>.</>}</p>
          <div className="success-ticket"><span>{customer.type === "Delivery" ? "Delivering to" : "Pickup at"}</span><b>{customer.type === "Delivery" ? customer.address : "Juniper & Stone"}</b><small>{customer.type === "Delivery" ? "Juniper & Stone" : "18 Oak Street"} · Text updates sent to {customer.phone}</small></div>
          <button className="primary-button" onClick={close}>Back to the menu <Sparkles size={17} /></button>
        </div>
      </div>
    );
  }
  return (
    <div className="modal-backdrop">
      <form className="checkout-modal checkout-enter" onSubmit={submit}>
        <div className="drawer-header"><div><span className="eyebrow">CHECKOUT</span><h2>Where should we send it?</h2></div><button type="button" onClick={close}><X /></button></div>
        <div className="fulfillment-toggle">
          {(["Pickup", "Delivery"] as const).map((type) => <button type="button" className={customer.type === type ? "active" : ""} onClick={() => setCustomer({ ...customer, type })} key={type}>{type}</button>)}
        </div>
        <label>Full name<input required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Jordan Lee" /></label>
        <div className="form-row">
          <label>Phone<input required value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="(555) 123-4567" /></label>
          <label>Email<input type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="jordan@email.com" /></label>
        </div>
        {customer.type === "Delivery" && (
          <label className="delivery-address"><span><MapPin size={14} /> Delivery address</span><input required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="123 Main Street, Apt 4B" /></label>
        )}
        <label>Order notes<textarea value={customer.notes} onChange={(event) => setCustomer({ ...customer, notes: event.target.value })} placeholder="Gate code, substitutions, or kitchen requests" /></label>
        <label className="allergy-field"><span><AlertTriangle size={14} /> Allergies or dietary restrictions</span><textarea value={customer.allergyNotes} onChange={(event) => setCustomer({ ...customer, allergyNotes: event.target.value })} placeholder="Example: Gluten allergy - please prevent cross-contact" /></label>
        <div className="checkout-summary"><span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span><span>Total with tax <b>{money.format(subtotal * 1.08)}</b></span></div>
        <button className="primary-button" type="submit">Place order <Check size={18} /></button>
        <p className="checkout-note">Demo checkout. Payment processing is planned for a future release.</p>
      </form>
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().toLowerCase() === "chef" && password === "food!") {
      onSuccess();
      return;
    }
    setError(true);
  };
  return (
    <main className="admin-login">
      <div className="login-glow glow-one" />
      <div className="login-glow glow-two" />
      <form className="login-card" onSubmit={submit}>
        <Image className="login-logo-image" src="/elevate-orders-logo-transparent.png" width={280} height={150} alt="Elevate Orders" priority />
        <span className="eyebrow">RESTAURANT COMMAND CENTER</span>
        <h1>Welcome to service.</h1>
        <p>Sign in to watch guests order, manage the kitchen, and keep every channel moving.</p>
        <label>Team name<input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(false); }} placeholder="chef" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(false); }} placeholder="food!" /></label>
        {error && <div className="login-error">That sign-in did not match. Try chef / food!</div>}
        <button className="primary-button" type="submit">Enter dashboard <ArrowRight size={17} /></button>
        <small>Demo access: <b>chef</b> / <b>food!</b></small>
      </form>
    </main>
  );
}

function OperationsShell({ view, setView, orderCount, sessionCount, children }: { view: View; setView: (view: View) => void; orderCount: number; sessionCount: number; children: React.ReactNode }) {
  const nav = [
    { id: "overview" as View, label: "Overview", icon: LayoutDashboard },
    { id: "live" as View, label: "Live activity", icon: Activity, count: sessionCount },
    { id: "kitchen" as View, label: "Kitchen display", icon: CookingPot, count: orderCount },
    { id: "orders" as View, label: "Orders", icon: ListChecks },
    { id: "menu" as View, label: "Menu", icon: MenuIcon },
    { id: "phone" as View, label: "Phone ordering", icon: PhoneCall },
  ];
  return (
    <main className="ops-shell">
      <aside className="ops-sidebar">
        <Image className="sidebar-logo-image" src="/elevate-orders-logo-transparent.png" width={170} height={78} alt="Elevate Orders" />
        <div className="location-switcher"><span>JS</span><div><b>Juniper &amp; Stone</b><small>18 Oak Street</small></div><ChevronRight size={16} /></div>
        <nav>
          <span className="nav-label">OPERATIONS</span>
          {nav.map((item) => <button className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} key={item.id}><item.icon size={19} /><span>{item.label}</span>{item.count ? <b>{item.count}</b> : null}</button>)}
          <span className="nav-label">BUSINESS</span>
          <button className={view === "customers" ? "active" : ""} onClick={() => setView("customers")}><Users size={19} /><span>Customers</span></button>
          <button className={view === "analytics" ? "active" : ""} onClick={() => setView("analytics")}><TrendingUp size={19} /><span>Analytics</span></button>
          <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}><Settings size={19} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => { window.location.href = "/elevateorders"; }}><Store size={19} /><span>View storefront</span></button>
          <div className="user-card"><span>CH</span><div><b>Chef</b><small>Restaurant admin</small></div><PanelLeftClose size={17} /></div>
        </div>
      </aside>
      <section className="ops-content">{children}</section>
    </main>
  );
}

function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div><div className="page-actions">{children}</div></header>;
}

function Overview({ orders, sessions, setView }: { orders: Order[]; sessions: LiveSession[]; setView: (view: View) => void }) {
  const active = orders.filter((order) => order.status !== "Completed");
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  return (
    <>
      <PageHeader eyebrow="THURSDAY, JUNE 11" title="Good morning, Chef.">
        <span className="live-status"><i /> Store accepting orders</span>
        <button className="outline-button" onClick={() => setView("storefront")}>View storefront <ArrowRight size={16} /></button>
      </PageHeader>
      <div className="metric-grid">
        <Metric icon={CircleDollarSign} label="Today’s sales" value={money.format(revenue)} detail="+14.2% from last Wednesday" tone="sage" />
        <Metric icon={ShoppingBag} label="Orders today" value={`${orders.length + 34}`} detail="8 from the AI assistant" tone="orange" />
        <Metric icon={Clock3} label="Average prep time" value="18 min" detail="2 min faster than average" tone="blue" />
        <Metric icon={Users} label="New customers" value="12" detail="31% of today’s guests" tone="purple" />
      </div>
      <div className="overview-grid">
        <section className="ops-card active-orders">
          <div className="card-heading"><div><span className="eyebrow">LIVE</span><h2>Active orders</h2></div><button onClick={() => setView("kitchen")}>Kitchen display <ArrowRight size={15} /></button></div>
          {active.map((order) => (
            <div className="overview-order" key={order.id}>
              <span className={`status-dot ${order.status.toLowerCase()}`} />
              <div><b>{order.id}</b><small>{order.customer} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items</small></div>
              <span className={`status-pill ${order.status.toLowerCase()}`}>{order.status}</span>
              <div className="order-time"><b>{order.promiseTime}</b><small>{order.type}</small></div>
              <ChevronRight size={17} />
            </div>
          ))}
        </section>
        <section className="ops-card assistant-performance">
          <div className="card-heading"><div><span className="eyebrow">AI ASSISTANT</span><h2>June is working.</h2></div><div className="assistant-avatar small"><Bot /></div></div>
          <div className="ai-stat"><strong>8</strong><span>orders assisted today</span></div>
          <div className="progress-label"><span>Conversion rate</span><b>64%</b></div>
          <div className="progress"><span style={{ width: "64%" }} /></div>
          <div className="mini-stats"><div><b>$28.40</b><span>Avg. assisted order</span></div><div><b>4.9/5</b><span>Guest rating</span></div></div>
          <div className="insight"><Sparkles size={17} /><p><b>Today’s insight</b>Guests asking June for pairings add a side 38% more often.</p></div>
        </section>
      </div>
      <section className="ops-card live-preview">
        <div className="card-heading"><div><span className="eyebrow"><Radio size={12} /> HAPPENING NOW</span><h2>Guests moving toward an order</h2></div><button onClick={() => setView("live")}>See live activity <ArrowRight size={15} /></button></div>
        <div className="live-preview-grid">
          {sessions.slice(0, 3).map((session) => <LiveSessionCard session={session} key={session.id} />)}
        </div>
      </section>
      <section className="ops-card quick-actions">
        <div className="card-heading"><div><span className="eyebrow">SHORTCUTS</span><h2>Keep things moving.</h2></div></div>
        <div>
          <button onClick={() => setView("kitchen")}><span><CookingPot /></span><b>Open kitchen display</b><small>Manage active tickets</small><ArrowRight /></button>
          <button onClick={() => setView("menu")}><span><MenuIcon /></span><b>Update availability</b><small>86% of menu available</small><ArrowRight /></button>
          <button><span><Headphones /></span><b>Test AI assistant</b><small>Preview the guest experience</small><ArrowRight /></button>
        </div>
      </section>
    </>
  );
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: React.ElementType; label: string; value: string; detail: string; tone: string }) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><Icon /></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function Kitchen({ orders, setOrders }: { orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const columns: OrderStatus[] = ["New", "Preparing", "Ready"];
  const advance = (order: Order) => {
    const next: Record<OrderStatus, OrderStatus> = { New: "Preparing", Preparing: "Ready", Ready: "Completed", Completed: "Completed" };
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: next[item.status] } : item));
  };
  return (
    <>
      <PageHeader eyebrow="KITCHEN DISPLAY" title="Service in motion.">
        <span className="live-status"><i /> Live</span>
        <span className="current-time"><Clock3 size={17} /> 11:47 AM</span>
      </PageHeader>
      <div className="kitchen-summary">
        <div><b>{orders.filter((order) => order.status !== "Completed").length}</b><span>active orders</span></div>
        <div><b>18 min</b><span>average prep</span></div>
        <div><b>20 min</b><span>pickup promise</span></div>
      </div>
      <div className="kitchen-board">
        {columns.map((status) => {
          const columnOrders = orders.filter((order) => order.status === status);
          return (
            <section className={`kitchen-column ${status.toLowerCase()}`} key={status}>
              <div className="column-heading"><span><i /> {status}</span><b>{columnOrders.length}</b></div>
              {columnOrders.map((order) => (
                <article className="ticket" key={order.id}>
                  <div className="ticket-header"><div><span>{order.id}</span><h3>{order.customer}</h3>{order.address && <small><MapPin size={9} /> {order.address}</small>}</div><div><b>{order.promiseTime}</b><small>{order.type}</small></div></div>
                  {order.allergyNotes && <div className="ticket-alert"><AlertTriangle size={16} /><span><b>ALLERGY ALERT</b>{order.allergyNotes}</span></div>}
                  {order.notes && <div className="ticket-order-note"><b>ORDER NOTE</b><span>{order.notes}</span></div>}
                  <div className="ticket-items">
                    {order.items.map((item, index) => <div key={`${item.name}-${index}`}><b>{item.quantity}×</b><span>{item.name}{item.notes && <small>{item.notes}</small>}</span></div>)}
                  </div>
                  <div className="ticket-footer"><span className="source-pill">{order.source === "AI Assistant" && <Sparkles size={12} />}{order.source}</span><button onClick={() => advance(order)}>{status === "New" ? "Start order" : status === "Preparing" ? "Mark ready" : "Complete"} <ArrowRight size={15} /></button></div>
                </article>
              ))}
              {columnOrders.length === 0 && <div className="column-empty"><PackageCheck /><span>No orders here</span></div>}
            </section>
          );
        })}
      </div>
    </>
  );
}

function Orders({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("");
  const filtered = orders.filter((order) => `${order.id} ${order.customer} ${order.phone}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="ORDER MANAGEMENT" title="Every order, in one place.">
        <button className="primary-button"><Plus size={17} /> New manual order</button>
      </PageHeader>
      <section className="ops-card orders-table-card">
        <div className="table-tools"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders or customers" /></div><div className="table-filters"><button className="active">All orders</button><button>Today</button><button>AI assisted</button></div></div>
        <div className="orders-table">
          <div className="table-row table-head"><span>Order</span><span>Customer</span><span>Items</span><span>Type</span><span>Total</span><span>Status</span><span /></div>
          {filtered.map((order) => (
            <div className="table-row" key={order.id}>
              <span><b>{order.id}</b><small>{order.placedAt}</small></span>
              <span><b>{order.customer}</b><small>{order.phone}</small></span>
              <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
              <span>{order.type}</span>
              <span><b>{money.format(order.total)}</b></span>
              <span><i className={`status-pill ${order.status.toLowerCase()}`}>{order.status}</i></span>
              <button><ChevronRight size={17} /></button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Customers({ orders }: { orders: Order[] }) {
  const customers = Array.from(
    orders.reduce((people, order) => {
      const current = people.get(order.phone);
      people.set(order.phone, {
        name: order.customer,
        phone: order.phone,
        email: order.email || "Not collected yet",
        orders: (current?.orders || 0) + 1,
        spent: (current?.spent || 0) + order.total,
        lastOrder: order.placedAt,
      });
      return people;
    }, new Map<string, { name: string; phone: string; email: string; orders: number; spent: number; lastOrder: string }>()),
  ).map(([, customer]) => customer);

  return (
    <>
      <PageHeader eyebrow="CUSTOMER DIRECTORY" title="Know who keeps coming back.">
        <button className="primary-button"><Plus size={17} /> Add customer</button>
      </PageHeader>
      <div className="metric-grid customer-metrics">
        <Metric icon={Users} label="Known customers" value={`${customers.length + 428}`} detail="18 added this week" tone="sage" />
        <Metric icon={UserRound} label="Returning guests" value="61%" detail="+7% over last month" tone="purple" />
        <Metric icon={CircleDollarSign} label="Average lifetime value" value="$184" detail="Across pickup and delivery" tone="orange" />
        <Metric icon={MessageCircle} label="SMS reachable" value="94%" detail="Ready for future notifications" tone="blue" />
      </div>
      <section className="ops-card customer-card">
        <div className="card-heading"><div><span className="eyebrow">RECENT GUESTS</span><h2>Customer profiles</h2></div></div>
        <div className="customer-list">
          {customers.map((customer, index) => (
            <article className="customer-row" key={customer.phone}>
              <span className="customer-avatar">{customer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
              <div><b>{customer.name}</b><small>{customer.phone} · {customer.email}</small></div>
              <span><b>{customer.orders}</b><small>orders</small></span>
              <span><b>{money.format(customer.spent)}</b><small>lifetime spend</small></span>
              <span><b>{customer.lastOrder}</b><small>last order</small></span>
              <button aria-label={`Open ${customer.name}`}><ChevronRight size={17} /></button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function Analytics({ orders }: { orders: Order[] }) {
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const channels = [
    { label: "Online storefront", value: 58, amount: revenue * 0.58 },
    { label: "AI assistant", value: 34, amount: revenue * 0.34 },
    { label: "Phone ordering", value: 8, amount: revenue * 0.08 },
  ];
  const days = [44, 61, 52, 78, 66, 92, 84];

  return (
    <>
      <PageHeader eyebrow="BUSINESS ANALYTICS" title="See what is driving service.">
        <button className="outline-button">Last 7 days <ChevronRight size={16} /></button>
      </PageHeader>
      <div className="metric-grid">
        <Metric icon={CircleDollarSign} label="Gross sales" value={money.format(revenue + 1842)} detail="+14.2% week over week" tone="sage" />
        <Metric icon={ShoppingBag} label="Completed orders" value={`${orders.length + 146}`} detail="+22 assisted by June" tone="orange" />
        <Metric icon={TrendingUp} label="Average order" value="$31.48" detail="+$3.10 from recommendations" tone="blue" />
        <Metric icon={UserRound} label="Conversion rate" value="68%" detail="+9% with AI assistance" tone="purple" />
      </div>
      <div className="analytics-grid">
        <section className="ops-card sales-chart">
          <div className="card-heading"><div><span className="eyebrow">SALES TREND</span><h2>A strong week in motion.</h2></div><b>$6,284</b></div>
          <div className="chart-bars">
            {days.map((height, index) => <div key={height + index}><span style={{ height: `${height}%` }} /><small>{["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"][index]}</small></div>)}
          </div>
        </section>
        <section className="ops-card channel-card">
          <div className="card-heading"><div><span className="eyebrow">ORDER CHANNELS</span><h2>Where orders begin</h2></div></div>
          <div className="channel-breakdown">
            {channels.map((channel) => (
              <div key={channel.label}>
                <div><span>{channel.label}</span><b>{channel.value}%</b></div>
                <i><span style={{ width: `${channel.value}%` }} /></i>
                <small>{money.format(channel.amount + 420)} attributed revenue</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function LiveSessionCard({ session }: { session: LiveSession }) {
  const Icon = session.channel === "Phone" ? PhoneCall : session.channel === "AI chat" ? Bot : ShoppingBag;
  return (
    <article className="live-session-card">
      <div className={`session-channel ${session.channel.toLowerCase().replace(" ", "-")}`}><Icon /></div>
      <div className="session-main">
        <div><b>{session.guest}</b><span className="live-pulse"><i /> Live</span></div>
        <strong>{session.stage}</strong>
        <p>{session.detail}</p>
      </div>
      <div className="session-meta"><span>{session.channel}</span><small>{session.startedAt}</small></div>
    </article>
  );
}

function LiveActivity({ sessions, orders }: { sessions: LiveSession[]; orders: Order[] }) {
  return (
    <>
      <PageHeader eyebrow="LIVE GUEST ACTIVITY" title="See the order before it lands.">
        <span className="live-status"><i /> Updating live</span>
      </PageHeader>
      <div className="live-hero-card">
        <div><Radio /><span><b>{sessions.length}</b> active guests</span></div>
        <p>Watch AI chats, online carts, and phone calls as guests move toward checkout. New orders appear in the kitchen automatically.</p>
        <div className="channel-counts"><span><Bot /> {sessions.filter((session) => session.channel === "AI chat").length} AI chats</span><span><ShoppingBag /> {sessions.filter((session) => session.channel === "Online").length} web carts</span><span><PhoneCall /> {sessions.filter((session) => session.channel === "Phone").length} calls</span></div>
      </div>
      <div className="live-activity-layout">
        <section className="ops-card live-feed">
          <div className="card-heading"><div><span className="eyebrow">ACTIVE NOW</span><h2>Guest sessions</h2></div></div>
          <div className="live-session-list">{sessions.map((session) => <LiveSessionCard session={session} key={session.id} />)}</div>
        </section>
        <section className="ops-card conversion-stream">
          <div className="card-heading"><div><span className="eyebrow">RECENT CONVERSIONS</span><h2>Orders landing</h2></div></div>
          {orders.slice(0, 5).map((order) => (
            <div className="conversion-item" key={order.id}>
              <span className="conversion-check"><Check /></span>
              <div><b>{order.id} · {order.customer}</b><small>{order.source} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items</small></div>
              <strong>{money.format(order.total)}</strong>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function PhoneSetup() {
  const [testCall, setTestCall] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voiceEvents, setVoiceEvents] = useState<VoiceEvent[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch("/api/voice/events", { cache: "no-store" });
        const data = await response.json() as { events?: VoiceEvent[] };
        setVoiceEvents(data.events ?? []);
      } catch {
        setVoiceEvents([]);
      }
    };
    loadEvents();
    const timer = window.setInterval(loadEvents, 2000);
    return () => window.clearInterval(timer);
  }, []);

  const latestCall = voiceEvents[0];
  return (
    <>
      <PageHeader eyebrow="PHONE ORDERING" title="Turn every ring into an order.">
        <span className="coming-pill"><Sparkles size={14} /> Voice demo ready</span>
      </PageHeader>
      <section className="phone-hero">
        <div>
          <span className="eyebrow">YOUR AI ORDER LINE</span>
          <h2>(908) 639-5394</h2>
          <p>June answers naturally, knows the current menu, confirms modifiers, collects customer details, and sends finished orders straight to the kitchen.</p>
          <div className="phone-actions">
            <button className="primary-button" onClick={() => setTestCall(true)}><PhoneCall size={17} /> Simulate incoming call</button>
            <button className="outline-button" onClick={async () => {
              await navigator.clipboard.writeText(`${window.location.origin}/api/voice/incoming`);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            }}>{copied ? "Webhook copied" : "Copy webhook URL"}</button>
          </div>
        </div>
        <div className={`phone-device ${testCall || latestCall?.status === "ringing" ? "ringing" : ""}`}>
          <div className="phone-speaker" />
          <span className="call-status">{latestCall ? latestCall.status.toUpperCase() : testCall ? "INCOMING CALL" : "VOICE CHANNEL READY"}</span>
          <div className="caller-avatar"><PhoneCall /></div>
          <h3>{latestCall ? latestCall.from : testCall ? "New customer" : "June is standing by"}</h3>
          <p>{latestCall ? latestCall.detail : testCall ? "(555) 867-4412" : "Typical answer time: under 2 seconds"}</p>
          {(latestCall || testCall) && <div className="waveform">{Array.from({ length: 16 }).map((_, index) => <i key={index} />)}</div>}
          <button onClick={() => setTestCall(!testCall)}>{testCall ? "End demo call" : "Start demo call"}</button>
        </div>
      </section>
      <div className="phone-setup-grid">
        <section className="ops-card setup-checklist">
          <div className="card-heading"><div><span className="eyebrow">GO-LIVE CHECKLIST</span><h2>Connect a real number</h2></div></div>
          <div className="setup-step complete"><span><Check /></span><div><b>Menu and hours connected</b><p>June uses the same availability as online ordering.</p></div></div>
          <div className="setup-step"><span>2</span><div><b>Purchase or port a Twilio number</b><p>Choose a local voice-enabled number for the restaurant.</p></div></div>
          <div className="setup-step"><span>3</span><div><b>Connect the voice webhook</b><p>Point incoming calls to the deployed Elevate Orders voice endpoint.</p></div></div>
          <div className="setup-step"><span>4</span><div><b>Enable live order storage</b><p>Connect Supabase so every channel shares durable orders and customer records.</p></div></div>
        </section>
        <section className="ops-card call-transcript">
          <div className="card-heading"><div><span className="eyebrow">SAMPLE CALL</span><h2>What guests hear</h2></div></div>
          {voiceEvents.slice(0, 4).map((event) => (
            <div className="transcript-line live-call-line" key={event.id}><span><PhoneCall size={13} /></span><p><b>{event.from}</b>{event.detail}</p></div>
          ))}
          <div className="transcript-line june"><span>J</span><p><b>June</b>Thanks for calling Juniper &amp; Stone. Are you ordering for pickup or delivery?</p></div>
          <div className="transcript-line guest"><span>G</span><p><b>Guest</b>Pickup. I want something spicy and a side.</p></div>
          <div className="transcript-line june"><span>J</span><p><b>June</b>The Hot Honey Pepperoni with Garlic Knots is a great match. Your total before tax is $26. Should I add both?</p></div>
        </section>
      </div>
    </>
  );
}

function RestaurantSettings() {
  const [settings, setSettings] = useState({
    restaurant: "Juniper & Stone",
    address: "18 Oak Street",
    phone: "(908) 639-5394",
    pickupMinutes: "20",
    acceptingOrders: true,
    aiAssistant: true,
    emailReceipts: true,
    soundAlerts: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("elevate-orders-settings");
    if (stored) setSettings((current) => ({ ...current, ...JSON.parse(stored) }));
  }, []);

  const toggle = (key: "acceptingOrders" | "aiAssistant" | "emailReceipts" | "soundAlerts") => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  };

  return (
    <>
      <PageHeader eyebrow="RESTAURANT SETTINGS" title="Make Elevate Orders yours.">
        <button className="primary-button" onClick={() => {
          localStorage.setItem("elevate-orders-settings", JSON.stringify(settings));
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2200);
        }}><Check size={17} /> {saved ? "Settings saved" : "Save changes"}</button>
      </PageHeader>
      <div className="settings-layout">
        <section className="ops-card settings-card">
          <div className="card-heading"><div><span className="eyebrow">STOREFRONT</span><h2>Restaurant details</h2></div></div>
          <div className="settings-fields">
            <label>Restaurant name<input value={settings.restaurant} onChange={(event) => setSettings({ ...settings, restaurant: event.target.value })} /></label>
            <label>Pickup address<input value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} /></label>
            <label>Ordering phone<input value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} /></label>
            <label>Default pickup time<div className="input-suffix"><input type="number" min="5" value={settings.pickupMinutes} onChange={(event) => setSettings({ ...settings, pickupMinutes: event.target.value })} /><span>minutes</span></div></label>
          </div>
        </section>
        <section className="ops-card settings-card">
          <div className="card-heading"><div><span className="eyebrow">ORDER FLOW</span><h2>Channels and alerts</h2></div></div>
          <div className="settings-toggles">
            {[
              ["acceptingOrders", "Accept online orders", "Customers can place new pickup and delivery orders."],
              ["aiAssistant", "AI ordering assistant", "June can recommend food and add confirmed items to carts."],
              ["emailReceipts", "Email confirmations", "Send customers a receipt after checkout."],
              ["soundAlerts", "Kitchen sound alerts", "Play an alert when a new order reaches the dashboard."],
            ].map(([key, title, description]) => (
              <button className="setting-toggle" onClick={() => toggle(key as "acceptingOrders" | "aiAssistant" | "emailReceipts" | "soundAlerts")} key={key}>
                <span><b>{title}</b><small>{description}</small></span>
                <i className={settings[key as keyof typeof settings] ? "on" : ""}><span /></i>
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="settings-danger">
        <div><b>Demo restaurant reset</b><p>Clear locally saved orders, menu availability, customer sessions, and settings.</p></div>
        <button onClick={() => {
          ["elevate-orders-orders", "elevate-orders-menu", "elevate-orders-sessions", "elevate-orders-settings"].forEach((key) => localStorage.removeItem(key));
          window.location.reload();
        }}>Reset demo data</button>
      </section>
    </>
  );
}

function MenuManager({ menu, setMenu }: { menu: MenuItem[]; setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>> }) {
  const [category, setCategory] = useState<"All" | MenuCategory>("All");
  const filtered = menu.filter((item) => category === "All" || item.category === category);
  const toggle = (id: string) => setMenu((current) => current.map((item) => item.id === id ? { ...item, available: !item.available } : item));
  return (
    <>
      <PageHeader eyebrow="MENU MANAGEMENT" title="Your menu, your way.">
        <button className="outline-button">Import menu</button>
        <button className="primary-button"><Plus size={17} /> Add item</button>
      </PageHeader>
      <div className="menu-stats">
        <div><strong>{menu.length}</strong><span>Total items</span></div><div><strong>{menu.filter((item) => item.available).length}</strong><span>Available now</span></div><div><strong>{menu.filter((item) => !item.available).length}</strong><span>Unavailable</span></div><div><strong>{new Set(menu.map((item) => item.category)).size}</strong><span>Categories</span></div>
      </div>
      <section className="ops-card menu-manager">
        <div className="manager-heading"><div className="category-tabs compact">{categories.map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><div className="search-box"><Search size={17} /><input placeholder="Search menu" /></div></div>
        <div className="manager-list">
          {filtered.map((item) => (
            <div className={`manager-item ${!item.available ? "unavailable" : ""}`} key={item.id}>
              <div className="mini-food" style={{ background: item.accent }}>{item.initials}</div>
              <div className="manager-item-info"><b>{item.name}</b><small>{item.description}</small><span>{item.category}{item.popular && " · Popular"}</span></div>
              <strong>{money.format(item.price)}</strong>
              <label className="availability-switch"><input type="checkbox" checked={item.available} onChange={() => toggle(item.id)} /><span /><b>{item.available ? "Available" : "Unavailable"}</b></label>
              <button className="edit-button">Edit</button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
