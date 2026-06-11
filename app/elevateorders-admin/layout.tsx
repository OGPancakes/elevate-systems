import "../elevateorders/orders.css";

export default function ElevateOrdersAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="orders-app-root">{children}</div>;
}
