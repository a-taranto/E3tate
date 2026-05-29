// My Estate sections are navigated from the main sidebar's "My Estate" group,
// and each page renders its own <Header>. The root layout already provides the
// page container/padding, so this layout is a simple pass-through (it only keeps
// the /my-estate route group intact).
export default function MyEstateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
