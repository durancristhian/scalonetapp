import { BugIcon, PartyPopperIcon } from "lucide-react";
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
    toast(title, {
      description,
      icon: <PartyPopperIcon className="h-4 opacity-50 w-4" />,
    });
  };

  const errorAlert: ReturnType<UseAlerts>["errorAlert"] = ({
    title,
    description,
  }) => {
    toast(title, {
      description,
      icon: <BugIcon className="h-4 opacity-50 w-4" />,
    });
  };

  return {
    errorAlert,
    successAlert,
  };
};
