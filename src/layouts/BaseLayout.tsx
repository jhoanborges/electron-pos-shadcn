import React from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import NavigationMenu from "@/components/template/NavigationMenu";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DragWindowRegion title="electron-shadcn" />
      <NavigationMenu />
      <main className="flex-1 overflow-auto p-2">{children}</main>
    </div>
  );
}
