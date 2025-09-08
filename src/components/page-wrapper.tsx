"use client";

import Box from "@mui/material/Box";
import { PropsWithChildren } from "react";
import { useColorScheme } from "@mui/material/styles";

export default function PageWrapper({ children }: PropsWithChildren) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        background: isDark
          ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.25), transparent 70%), #000000"
          : "linear-gradient(120deg, #d5c5ff 0%, #a7f3d0 50%, #f0f0f0 100%)",
      }}
    >
      {children}
    </Box>
  );
}
