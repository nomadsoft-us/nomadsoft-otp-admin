"use client";
import { useFileUploadService } from "@/services/api/services/files";
import { FileEntity } from "@/services/api/types/file-entity";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { styled } from "@mui/material/styles";
import React, { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import IconButton from "@mui/material/IconButton";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export type ImageCropperProps = {
  error?: string;
  onChange: (value: FileEntity | null) => void;
  onBlur: () => void;
  value?: FileEntity;
  disabled?: boolean;
  testId?: string;
  label?: React.ReactNode;
  aspectRatio?: number; // For square crop, this will be 1
};

const ImagePickerContainer = styled("div")(({ theme }) => ({
  display: "flex",
  position: "relative",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  border: "1px dashed",
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  cursor: "pointer",
  "&:hover": { borderColor: theme.palette.text.primary },
}));

const StyledOverlay = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.7)",
  transition: ".5s ease",
  opacity: 0,
  "&:hover": { opacity: 1 },
}));

function ImageCropper(props: ImageCropperProps) {
  const { onChange, aspectRatio = 1 } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fetchFileUpload = useFileUploadService();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create a temporary URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setTempImageUrl(imageUrl);
    setCropDialogOpen(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/jpg": [],
      "image/webp": [],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 10, // 10MB for original image
    disabled: isLoading || props.disabled,
  });

  const getCroppedImage = async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to 600x600
    const outputSize = 600;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Draw the cropped and resized image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleCropComplete = async () => {
    setIsLoading(true);

    try {
      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        setIsLoading(false);
        return;
      }

      // Convert blob to File
      const croppedFile = new File([croppedBlob], "selfie.jpg", {
        type: "image/jpeg",
      });

      // Upload the cropped image
      const { status, data } = await fetchFileUpload(croppedFile);
      if (status === HTTP_CODES_ENUM.CREATED) {
        onChange(data.file);
        setCropDialogOpen(false);
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl("");
      }
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCrop = () => {
    setCropDialogOpen(false);
    URL.revokeObjectURL(tempImageUrl);
    setTempImageUrl("");
  };

  const removeImageHandle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onChange(null);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const cropSize = Math.min(width, height) * 0.9;
    const x = (width - cropSize) / 2;
    const y = (height - cropSize) / 2;

    const newCrop = {
      unit: "px" as const,
      width: cropSize,
      height: cropSize,
      x,
      y,
    };
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  };

  return (
    <>
      <ImagePickerContainer {...getRootProps()}>
        {isDragActive && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                mt: 10,
              }}
              variant="h5"
            >
              {t("common:formInputs.singleImageInput.dropzoneText")}
            </Typography>
          </Box>
        )}
        {props?.value ? (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 400,
              height: 300,
              mx: "auto",
            }}
          >
            <StyledOverlay>
              <IconButton
                disableRipple
                onClick={removeImageHandle}
                color="inherit"
              >
                <ClearOutlinedIcon
                  sx={{ width: 50, height: 50, color: "white" }}
                />
              </IconButton>
            </StyledOverlay>
            <Image
              src={props.value.path}
              alt="Uploaded selfie"
              fill
              style={{
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </Box>
        ) : null}

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            component="label"
            disabled={isLoading}
            data-testid={props.testId}
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading
              ? t("common:loading")
              : props.value
                ? "Change Selfie"
                : "Upload Selfie"}
            <input {...getInputProps()} />
          </Button>
        </Box>

        <Box sx={{ mt: 1 }}>
          <Typography>
            {t("common:formInputs.singleImageInput.dragAndDrop")}
          </Typography>
        </Box>

        {props.error && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ color: "red" }}>{props.error}</Typography>
          </Box>
        )}
      </ImagePickerContainer>

      {/* Crop Dialog */}
      <Dialog
        open={cropDialogOpen}
        onClose={handleCancelCrop}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Crop Your Selfie
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please adjust the square area to frame your face properly
          </Typography>
          {tempImageUrl && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                maxHeight: "60vh",
                overflow: "auto",
              }}
            >
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={tempImageUrl}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </ReactCrop>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCrop} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCropComplete}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Crop & Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function FormImageCropper<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Pick<ControllerProps<TFieldValues, TName>, "name" | "defaultValue"> & {
    disabled?: boolean;
    testId?: string;
    label?: React.ReactNode;
    aspectRatio?: number;
  }
) {
  return (
    <Controller
      name={props.name}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => (
        <ImageCropper
          onChange={field.onChange}
          onBlur={field.onBlur}
          value={field.value}
          error={fieldState.error?.message}
          disabled={props.disabled}
          testId={props.testId}
          label={props.label}
          aspectRatio={props.aspectRatio}
        />
      )}
    />
  );
}

export default FormImageCropper;
