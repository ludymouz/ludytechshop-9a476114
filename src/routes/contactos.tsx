import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/contactos")({
  beforeLoad: () => {
    throw redirect({ to: "/contacto" });
  },
});
