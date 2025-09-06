"use client";

import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";

const GlassmorphismCard = styled(Card)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "24px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transform: "translateY(0)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "2px",
    background: "linear-gradient(90deg, transparent, #06b6d4, transparent)",
    transition: "left 0.5s ease",
  },

  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",

    "&::before": {
      left: "100%",
    },
  },

  [theme.breakpoints.down("sm")]: {
    borderRadius: "20px",
  },
}));

export default GlassmorphismCard;
