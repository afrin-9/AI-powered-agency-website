// Re-mounts on every admin route change: the sidebar stays put while the page content animates in.
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
