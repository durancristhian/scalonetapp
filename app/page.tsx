"use client";

import { ShowOff } from "@/components/show-off";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { FC, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const Page: FC = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    /* If we have a valid userId, we redirect the user to the /dashboard */
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, router, userId]);

  return (
    <div className="bg-slate-100 flex flex-col items-center justify-center min-h-dvh p-2">
      <motion.h1
        className="font-semibold text-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        Bienvenidos a&nbsp;
        <span className="font-bold text-slate-950">Scalonet.app</span>
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <ShowOff />
      </motion.div>
      <div className="h-[36px] mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <SignInButton mode="modal">
            <Button size="sm">Ingresar con Google</Button>
          </SignInButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
