import React from "react";
import Button from "@mui/material/Button";

export default function PrimaryButton({ children, variant = "contained", color = "primary", ...rest }) {
  return (
    <Button variant={variant} color={color} {...rest}>
      {children}
    </Button>
  );
}