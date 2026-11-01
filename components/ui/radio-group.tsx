"use client";

import { cn } from "@/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CheckIcon } from "lucide-react";
import * as React from "react";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    variant?: "default" | "button";
  }
>(({ className, variant = "default", children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        variant === "button"
          ? cn(
              buttonVariants({ variant: "ghost" }),
              "min-w-0 px-0 active:bg-accent data-[state=checked]:border data-[state=checked]:border-input data-[state=checked]:bg-background data-[state=checked]:shadow-sm data-[state=checked]:hover:bg-accent",
            )
          : "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {variant === "button" ? (
        children
      ) : (
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <CheckIcon className="h-3.5 w-3.5 text-primary" />
        </RadioGroupPrimitive.Indicator>
      )}
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
