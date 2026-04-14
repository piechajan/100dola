"use client";

import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

export default function RouteMapClient({ accentColor }: { accentColor?: string }) {
  return <RouteMap accentColor={accentColor} />;
}
