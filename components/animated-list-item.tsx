"use client";

import { motion } from "framer-motion";
import { FC, PropsWithChildren } from "react";

type AnimatedListItemProps = {
  listIndex: number;
};

export const AnimatedListItem: FC<PropsWithChildren<AnimatedListItemProps>> = ({
  children,
  listIndex,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: listIndex * 0.15 }}
    >
      {children}
    </motion.div>
  );
};
