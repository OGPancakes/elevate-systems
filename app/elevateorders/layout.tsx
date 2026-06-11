import "./orders.css";

export default function ElevateOrdersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="orders-app-root">{children}</div>;
}
