import type React from "react";
import type { ReactNode } from "react";

export type ModalOptions = {
  title?: ReactNode;
  customTitle?: ReactNode;
  children?: ReactNode;
  primaryButton?: {
    text: string;
    onClick: () => void;
  };
  banner?: React.ReactNode;
  showParticle?: boolean;
  showLogo?: boolean | React.ReactNode;
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
  reverse?: boolean;
  custom?: React.ElementType;
  buttonLayout?: 'horizontal' | 'vertical';
  dismissable?: boolean;
};

export type ErrorModalOptions = {
  message: string;
  type: "announcement" | "error";
  dismissable?: boolean;
};

export type ModalOption = ModalOptions | ErrorModalOptions;

export type ModalOptionOrNull = null | ModalOptions | ErrorModalOptions;
