// Re-mounts on every public route change, so each page fades and rises in.
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
