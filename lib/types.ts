import { ReactNode } from "react";


export interface ButtonProps {
  textColor: string;
  backgroundColor: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  text?: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "lg" | "md" | "sm";
  isDisabled?: boolean;
  type?: "button" | "submit" | "reset";
  ref?: React.ForwardedRef<HTMLButtonElement>;
}

export interface TabsProps {
  tabs?: "member" | "admin";
}