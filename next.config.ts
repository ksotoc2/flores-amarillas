import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  // Requerido para GitHub Pages en repos de proyecto (no usuario).
  // URL final: https://ksotoc2.github.io/flores-amarillas
  basePath: "/flores-amarillas",

  // Necesario para que los chunks JS/CSS carguen correctamente
  // desde la sub-ruta de GitHub Pages.
  assetPrefix: "/flores-amarillas/",

  // Mejora la compatibilidad con servidores de archivos estáticos
  // como GitHub Pages (evita 404 en rutas sin barra final).
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
