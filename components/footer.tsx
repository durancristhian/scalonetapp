import { Feedback } from "@/components/feedback";
import { ShowOff } from "@/components/show-off";

export const Footer = () => {
  return (
    <div className="bg-white border-border border-t">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex h-12 md:h-14 items-center justify-between">
          <Feedback />
          <ShowOff />
        </div>
      </div>
    </div>
  );
};
