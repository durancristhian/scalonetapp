import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { type ReactNode } from "react";
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
      icon: <CircleCheckIcon className="h-5 opacity-50 w-5" />,
    });
  };

  const errorAlert: ReturnType<UseAlerts>["errorAlert"] = ({
    title,
    description,
  }) => {
    toast.error(title, {
      description,
      icon: <CircleAlertIcon className="h-5 opacity-50 w-5" />,
    });
  };

  return {
    errorAlert,
    successAlert,
  };
};
