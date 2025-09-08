"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ClipboardEvent,
  ChangeEvent,
} from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { useTranslation } from "@/services/i18n/client";

const OtpContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    gap: theme.spacing(1.5),
  },
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(1),
  },
}));

const OtpCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    margin: theme.spacing(1),
  },
}));

const HiddenInput = styled("input")(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "default",
  fontSize: "1px", // Hide cursor
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  color: "transparent",
  zIndex: 1,
}));

const OtpBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isActive" && prop !== "hasError",
})<{ isActive?: boolean; hasError?: boolean }>(
  ({ theme, isActive, hasError }) => ({
    width: "72px",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.75rem",
    fontWeight: "bold",
    border: `2px solid ${hasError ? theme.palette.error.main : theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    cursor: "text",
    position: "relative",
    color: theme.palette.text.primary,
    [theme.breakpoints.down("md")]: {
      width: "56px",
      height: "56px",
      fontSize: "1.5rem",
    },
    [theme.breakpoints.down("sm")]: {
      width: "40px",
      height: "40px",
      fontSize: "1.25rem",
    },
    ...(isActive && {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    }),
  })
);

export type OtpInputProps = {
  length?: number;
  onComplete: (otp: string) => void;
  onOtpChange?: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
};

export default function OtpInputComponent({
  length = 6,
  onComplete,
  onOtpChange,
  disabled = false,
  error = false,
  autoFocus = false,
}: OtpInputProps) {
  const { t } = useTranslation("otp");
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // WebOTP API support
  useEffect(() => {
    if (!disabled && "OTPCredential" in window) {
      abortController.current = new AbortController();

      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: abortController.current.signal,
        } as CredentialRequestOptions)
        .then((otp: Credential | null) => {
          if (otp && "code" in otp) {
            const code = (otp as { code: string }).code;
            // Only allow numeric input
            const numericValue = code.replace(/[^0-9]/g, "");
            const digits = numericValue.slice(0, length).split("");

            // Fill remaining spots with empty strings
            const newOtp = [
              ...digits,
              ...new Array(length - digits.length).fill(""),
            ];

            setOtp(newOtp);
            setActiveIndex(Math.min(digits.length, length - 1));
            onOtpChange?.(newOtp.join(""));

            // Check if complete
            if (digits.length >= length) {
              onComplete(newOtp.join(""));
            }
          }
        })
        .catch((err) => {
          // Ignore abort errors
          if (err.name !== "AbortError") {
            console.warn(t("otp:errors.webOtpError"), err);
          }
        });
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [disabled, length, onOtpChange, onComplete, t]);

  const handleOtpValue = useCallback(
    (value: string) => {
      // Only allow numeric input
      const numericValue = value.replace(/[^0-9]/g, "");
      const digits = numericValue.slice(0, length).split("");

      // Fill remaining spots with empty strings
      const newOtp = [...digits, ...new Array(length - digits.length).fill("")];

      setOtp(newOtp);
      setActiveIndex(Math.min(digits.length, length - 1));
      onOtpChange?.(newOtp.join(""));

      // Check if complete
      if (digits.length >= length) {
        onComplete(newOtp.join(""));
      }
    },
    [length, onOtpChange, onComplete]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleOtpValue(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value) {
      e.preventDefault();
      const newOtp = [...otp];
      const currentActiveIndex = activeIndex;

      if (currentActiveIndex > 0 && !newOtp[currentActiveIndex]) {
        // Move to previous box and clear it
        newOtp[currentActiveIndex - 1] = "";
        setActiveIndex(currentActiveIndex - 1);
      } else if (newOtp[currentActiveIndex]) {
        // Clear current box
        newOtp[currentActiveIndex] = "";
      }

      setOtp(newOtp);
      onOtpChange?.(newOtp.join(""));
    } else if (e.key === "ArrowLeft" && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (e.key === "ArrowRight" && activeIndex < length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleBoxClick = (index: number) => {
    setActiveIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    handleOtpValue(pasteData);
  };

  return (
    <OtpCard>
      <OtpContainer>
        <HiddenInput
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          value={otp.join("")}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={t("otp:ariaLabels.enterVerificationCode")}
        />
        {otp.map((digit, index) => (
          <OtpBox
            key={index}
            isActive={index === activeIndex}
            hasError={error}
            onClick={() => handleBoxClick(index)}
          >
            {digit}
          </OtpBox>
        ))}
      </OtpContainer>
    </OtpCard>
  );
}
