import { ShowOff } from "@/components/show-off";

export const Footer = () => {
  return (
    <div className="bg-slate-100 border-t border-slate-300">
      <div className="h-10 px-2 md:px-4">
        <div className="flex h-full items-center justify-center">
          <ShowOff />
        </div>
      </div>
    </div>
  );
};
