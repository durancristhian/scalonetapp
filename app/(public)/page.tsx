"use client";

import { trackAnalytics } from "@/utils/analytics";
import { Loader } from "@/components/loader";
import { ShowOff } from "@/components/show-off";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";

const Page: FC = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, router, userId]);

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full min-h-[inherit] p-2">
      <Show when="signed-in">
        <Loader />
      </Show>
      <Show when="signed-out">
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
            Tienes lo necesario para ser el{" "}
            <span className="font-bold">Lionel Scaloni</span> entre tus amigos?
          </p>
          <p className="text-balance text-center">
            Demostrá tu habilidad para formar equipos ideales.
          </p>
        </motion.div>
        <div className="min-h-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5, delay: 1.5 }}
          >
            <SignInButton mode="modal">
              <Button onClick={() => trackAnalytics("sign_in_clicked")}>
                Ingresar con Google
              </Button>
            </SignInButton>
          </motion.div>
        </div>
        <footer className="mt-16">
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5, delay: 2 }}
          >
            <ShowOff />
          </motion.div>
        </footer>
      </Show>
    </div>
  );
};

export default Page;
