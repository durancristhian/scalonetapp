import { Feedback } from "@/components/feedback";
import { LicenseLink } from "@/components/license-link";
import { ShowOff } from "@/components/show-off";

export const Footer = () => {
  return (
    <footer className="bg-white border-border border-t">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col min-[480px]:flex-row gap-x-4 gap-y-1 min-h-12 md:min-h-14 items-center justify-center min-[480px]:justify-between py-1">
          <div className="flex items-center gap-2">
            <Feedback />
            <LicenseLink />
          </div>
          <ShowOff popoverSeparation />
        </div>
      </div>
    </footer>
  );
};
