import { LoaderCircleIcon } from "lucide-react";

export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <LoaderCircleIcon className="animate-spin h-10 opacity-50 w-10" />
    </div>
  );
};
