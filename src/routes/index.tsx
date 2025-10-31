import PosSystem from "@/components/pos/pos-system";
import { createFileRoute } from "@tanstack/react-router";

function HomePage() {
  return <PosSystem />;
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
