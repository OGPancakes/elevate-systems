"use client";

import {
  Activity,
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
import { useEffect, useMemo, useState } from "react";
import { initialOrders, menuItems as initialMenu } from "@/lib/elevate-orders-data";
import type { CartItem, ChatMessage, MenuCategory, MenuItem, Order, OrderStatus } from "@/lib/elevate-orders-types";

type View = "storefront" | "overview" | "live" | "kitchen" | "orders" | "menu" | "phone" | "customers" | "analytics";

type LiveSession = {
  id: string;
  guest: string;
  channel: "AI chat" | "Online" | "Phone";
  stage: "Browsing menu" | "Chatting with June" | "Reviewing cart" | "Calling";
  detail: string;
  startedAt: string;
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

  useEffect(() => {
    const adminPath = window.location.pathname.includes("elevateorders-admin");
    setIsAdminPath(adminPath);
    if (adminPath) setView("overview");
    setAdminAuthenticated(sessionStorage.getItem("elevate-orders-admin") === "true");
    const storedOrders = localStorage.getItem("elevate-orders-orders");
    const storedMenu = localStorage.getItem("elevate-orders-menu");
    const storedSessions = localStorage.getItem("elevate-orders-sessions");
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    if (storedMenu) setMenu(JSON.parse(storedMenu));
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

  const placeOrder = (customer: { name: string; phone: string; email: string; type: "Pickup" | "Delivery" }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const now = new Date();
    const promise = new Date(now.getTime() + (customer.type === "Delivery" ? 40 : 20) * 60000);
    const order: Order = {
      id: `EO-${1049 + orders.length}`,
      customer: customer.name,
      phone: customer.phone,
      email: customer.email,
      type: customer.type,
      items: cart.map(({ name, quantity, notes }) => ({ name, quantity, notes })),
      total: subtotal * 1.08,
      status: "New",
      placedAt: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      promiseTime: promise.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      source: "Online",
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
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
  const filtered = menu.filter(
    (item) =>
      item.available &&
      (category === "All" || item.category === category) &&
      `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const addWithAnimation = (item: MenuItem) => {
    addItem(item);
    setAddedItem(item.id);
    window.setTimeout(() => setAddedItem(null), 700);
  };

  return (
    <main className="storefront">
      <header className="store-header">
        <button className="brand-logo-button" aria-label="Elevate Orders home">
          <Image className="brand-logo-image" src="/elevate-orders-logo.png" width={170} height={64} alt="Elevate Orders" priority />
        </button>
        <div className="restaurant-name">
          <span className="open-dot" />
          <span><b>Juniper &amp; Stone</b><small>Open today until 9:00 PM</small></span>
        </div>
        <div className="header-actions">
          <a className="call-order-link" href="tel:+15550140198"><Phone size={15} /><span>Call to order</span><b>(555) 014-0198</b></a>
          <button className="text-button" onClick={openDashboard}>Restaurant login</button>
          <button className="cart-button" aria-label={`Open my order, ${itemCount} ${itemCount === 1 ? "item" : "items"}`} onClick={() => setCartOpen(!cartOpen)}>
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
                <span>{item.initials}</span>
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
        <Image className="footer-logo-image" src="/elevate-orders-logo.png" width={170} height={70} alt="Elevate Orders" />
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

function AssistantPanel({ menu, addItem, onActivity, close }: { menu: MenuItem[]; addItem: (item: MenuItem) => void; onActivity: (detail: string) => void; close: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, I’m June. Tell me what you’re in the mood for, and I’ll help build your order." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const suggestions = ["Something spicy", "A filling vegetarian meal", "Lunch under $20"];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    onActivity(`Guest said: "${text.slice(0, 62)}${text.length > 62 ? "..." : ""}"`);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, menu }),
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
      onActivity(`June recommended a menu match for "${text.slice(0, 38)}"`);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "I recommend the Hot Honey Pepperoni with Garlic Knots. It is bold, a little spicy, and comes to $26 before tax." }]);
    } finally {
      setLoading(false);
    }
  };

  const recommendedItem = useMemo(() => {
    const conversation = messages.map((message) => message.content).join(" ").toLowerCase();
    if (conversation.includes("vegetarian")) return menu.find((item) => item.id === "market-bowl");
    if (conversation.includes("spicy")) return menu.find((item) => item.id === "hot-honey-pie");
    return undefined;
  }, [messages, menu]);

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
        </div>
        <div className="messages">
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</div>
          ))}
          {loading && <div className="message assistant typing"><span /><span /><span /></div>}
          {recommendedItem && (
            <div className="recommendation-card">
              <div className="mini-food" style={{ background: recommendedItem.accent }}>{recommendedItem.initials}</div>
              <div><b>{recommendedItem.name}</b><span>{money.format(recommendedItem.price)}</span></div>
              <button onClick={() => addItem(recommendedItem)}><Plus size={16} /> Add</button>
            </div>
          )}
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

function CheckoutModal({ cart, close, placeOrder }: { cart: CartItem[]; close: () => void; placeOrder: (customer: { name: string; phone: string; email: string; type: "Pickup" | "Delivery" }) => void }) {
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", type: "Pickup" as "Pickup" | "Delivery" });
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
          <p>June is double-checking your order and reserving your pickup time.</p>
          <div className="processing-steps"><span className="done"><Check /> Order checked</span><span className="active"><Radio /> Kitchen connected</span><span><Clock3 /> Pickup time reserved</span></div>
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
          <p>The kitchen has your order. We&apos;ll have it ready in about <b>20 minutes</b>.</p>
          <div className="success-ticket"><span>Pickup at</span><b>Juniper &amp; Stone</b><small>18 Oak Street · Text updates sent to {customer.phone}</small></div>
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
        <Image className="login-logo-image" src="/elevate-orders-logo.png" width={280} height={150} alt="Elevate Orders" priority />
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
        <Image className="sidebar-logo-image" src="/elevate-orders-logo.png" width={170} height={78} alt="Elevate Orders" />
        <div className="location-switcher"><span>JS</span><div><b>Juniper &amp; Stone</b><small>18 Oak Street</small></div><ChevronRight size={16} /></div>
        <nav>
          <span className="nav-label">OPERATIONS</span>
          {nav.map((item) => <button className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} key={item.id}><item.icon size={19} /><span>{item.label}</span>{item.count ? <b>{item.count}</b> : null}</button>)}
          <span className="nav-label">BUSINESS</span>
          <button className={view === "customers" ? "active" : ""} onClick={() => setView("customers")}><Users size={19} /><span>Customers</span></button>
          <button className={view === "analytics" ? "active" : ""} onClick={() => setView("analytics")}><TrendingUp size={19} /><span>Analytics</span></button>
        </nav>
        <div className="sidebar-bottom">
          <button><Settings size={19} /><span>Settings</span></button>
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
                  <div className="ticket-header"><div><span>{order.id}</span><h3>{order.customer}</h3></div><div><b>{order.promiseTime}</b><small>{order.type}</small></div></div>
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
  return (
    <>
      <PageHeader eyebrow="PHONE ORDERING" title="Turn every ring into an order.">
        <span className="coming-pill"><Sparkles size={14} /> Voice demo ready</span>
      </PageHeader>
      <section className="phone-hero">
        <div>
          <span className="eyebrow">YOUR AI ORDER LINE</span>
          <h2>(555) 014-0198</h2>
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
        <div className={`phone-device ${testCall ? "ringing" : ""}`}>
          <div className="phone-speaker" />
          <span className="call-status">{testCall ? "INCOMING CALL" : "VOICE CHANNEL READY"}</span>
          <div className="caller-avatar"><PhoneCall /></div>
          <h3>{testCall ? "New customer" : "June is standing by"}</h3>
          <p>{testCall ? "(555) 867-4412" : "Typical answer time: under 2 seconds"}</p>
          {testCall && <div className="waveform">{Array.from({ length: 16 }).map((_, index) => <i key={index} />)}</div>}
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
          <div className="transcript-line june"><span>J</span><p><b>June</b>Thanks for calling Juniper &amp; Stone. Are you ordering for pickup or delivery?</p></div>
          <div className="transcript-line guest"><span>G</span><p><b>Guest</b>Pickup. I want something spicy and a side.</p></div>
          <div className="transcript-line june"><span>J</span><p><b>June</b>The Hot Honey Pepperoni with Garlic Knots is a great match. Your total before tax is $26. Should I add both?</p></div>
        </section>
      </div>
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
