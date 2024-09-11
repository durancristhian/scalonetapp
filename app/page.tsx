"use client";

import { Loader } from "@/components/loader";
import { ShowOff } from "@/components/show-off";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";

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
    <div className="flex flex-col gap-4 items-center justify-center h-full min-h-[inherit] p-2">
      <SignedIn>
        <Loader />
      </SignedIn>
      <SignedOut>
        <div className="mb-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5, delay: 0.5 }}
          >
            <h1 className="font-bold text-4xl text-balance text-center">
              ¡Arma equipos como un campeón!
            </h1>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeInOut", duration: 0.5, delay: 1 }}
        >
          <p className="text-balance text-center">
            Tienes lo necesario para ser el&nbsp;
            <span className="font-bold">Lionel Scaloni</span>&nbsp;entre tus
            amigos?
          </p>
          <p className="text-balance text-center">
            Demostrá tu habilidad para formar equipos ideales.
          </p>
        </motion.div>
        <div className="h-[36px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5, delay: 1.5 }}
          >
            <SignInButton mode="modal">
              <Button>Ingresar con Google</Button>
            </SignInButton>
          </motion.div>
        </div>
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5, delay: 2 }}
          >
            <ShowOff />
          </motion.div>
        </div>
      </SignedOut>
    </div>
  );
};

export default Page;
