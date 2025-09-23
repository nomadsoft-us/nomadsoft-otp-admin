"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "@/services/i18n/client";
import useAuth from "@/services/auth/use-auth";

export default function SignupCompleteContent() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, isLoaded } = useAuth();
  const [countdown, setCountdown] = useState(5);

  // Check if we've already reloaded based on URL parameter
  const urlParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const hasReloaded = urlParams.get("reload") === "done";

  useEffect(() => {
    // If we haven't reloaded yet, do it now
    if (!hasReloaded) {
      // Force a hard page reload to refresh all auth state
      setTimeout(() => {
        window.location.href = "/signup-complete?reload=done";
      }, 100);
    }
  }, [hasReloaded]);

  useEffect(() => {
    // If no user after reload, redirect to sign-in
    if (isLoaded && !user && hasReloaded) {
      router.push("/sign-in");
      return;
    }

    // Only start countdown after auth is loaded with a verified user
    if (isLoaded && user && hasReloaded) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Navigate to home
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoaded, user, hasReloaded, router]);

  if (!hasReloaded || !isLoaded) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6">Completing registration...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 4,
          textAlign: "center",
        }}
      >
        <CheckCircleIcon
          sx={{
            fontSize: 100,
            color: "success.main",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": {
                transform: "scale(0.95)",
                opacity: 0.7,
              },
              "50%": {
                transform: "scale(1.05)",
                opacity: 1,
              },
              "100%": {
                transform: "scale(0.95)",
                opacity: 0.7,
              },
            },
          }}
        />

        <Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
            }}
          >
            Congratulations!
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Your account has been successfully created
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Welcome to {t("app-name")}! Your identity has been verified and your
            account is now active.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress
            variant="determinate"
            value={(5 - countdown) * 20}
            size={60}
            thickness={4}
            sx={{
              color: "primary.main",
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Redirecting to home in {countdown} seconds...
          </Typography>
        </Box>

        <Box
          sx={{
            p: 3,
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderRadius: 2,
            border: "1px solid rgba(99, 102, 241, 0.2)",
            maxWidth: 400,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            You can now access all features of the platform. Your verified
            status ensures a secure and trusted experience.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
