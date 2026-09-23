import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // in sviluppo il telefono sulla stessa rete (hotspot o wifi) può aprire il server del Mac
  allowedDevOrigins: ["172.20.10.*", "192.168.*.*"],
};

export default nextConfig;
