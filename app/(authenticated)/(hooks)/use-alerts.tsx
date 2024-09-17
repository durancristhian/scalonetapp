import { ReactNode } from "react";
import { toast } from "sonner";

type AlertProps = {
  title: ReactNode;
  description?: ReactNode;
};

type UseAlerts = () => {
  errorAlert: (alertProps: AlertProps) => void;
  successAlert: (alertProps: AlertProps) => void;
};

export const useAlerts: UseAlerts = () => {
  const successAlert: ReturnType<UseAlerts>["successAlert"] = ({
    title,
    description,
  }) => {
    toast.success(title, {
      description,
    });
  };

  const errorAlert: ReturnType<UseAlerts>["errorAlert"] = ({
    title,
    description,
  }) => {
    toast.error(title, {
      description,
    });
  };

  return {
    errorAlert,
    successAlert,
  };
};
