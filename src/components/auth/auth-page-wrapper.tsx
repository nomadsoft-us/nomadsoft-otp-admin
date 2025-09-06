"use client";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { PropsWithChildren } from "react";

const AuthBackground = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2.5),
  background: `
    radial-gradient(
      ellipse 120% 80% at 70% 20%,
      rgba(255, 20, 147, 0.15),
      transparent 50%
    ),
    radial-gradient(
      ellipse 100% 60% at 30% 10%,
      rgba(0, 255, 255, 0.12),
      transparent 60%
    ),
    radial-gradient(
      ellipse 90% 70% at 50% 0%,
      rgba(138, 43, 226, 0.18),
      transparent 65%
    ),
    radial-gradient(
      ellipse 110% 50% at 80% 30%,
      rgba(255, 215, 0, 0.08),
      transparent 40%
    ),
    #000000
  `,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "inherit",
    zIndex: -1,
  },
}));

export default function AuthPageWrapper({ children }: PropsWithChildren) {
  return <AuthBackground>{children}</AuthBackground>;
}
