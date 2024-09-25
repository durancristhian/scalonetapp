"use client";

import { motion } from "framer-motion";
import { FC, PropsWithChildren } from "react";

const Template: FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default Template;
