"use client";

import { type ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface RevealOnScrollProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}

export default function RevealOnScroll({
    children,
    className,
    delay = 0,
    direction = "up",
}: RevealOnScrollProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    const directionMap = {
        up: { y: 40 },
        down: { y: -40 },
        left: { x: 40 },
        right: { x: -40 },
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, ...directionMap[direction] }}
            animate={
                isInView
                    ? { opacity: 1, x: 0, y: 0 }
                    : { opacity: 0, ...directionMap[direction] }
            }
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay,
            }}
        >
            {children}
        </motion.div>
    );
}
