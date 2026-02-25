"use client";

import { useRef, type ReactNode } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export default function MagneticButton({
    children,
    className,
    onClick,
    variant = "primary",
    size = "md",
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(springY, [-20, 20], [5, -5]);
    const rotateY = useTransform(springX, [-20, 20], [-5, 5]);

    function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        x.set((e.clientX - cx) * 0.3);
        y.set((e.clientY - cy) * 0.3);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const variants: Record<string, string> = {
        primary:
            "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
        outline:
            "border border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800",
        ghost:
            "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
    };

    const sizes: Record<string, string> = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            ref={ref}
            className={cn(
                "relative cursor-pointer rounded-full font-medium tracking-tight transition-colors duration-200",
                "active:scale-[0.98] active:-translate-y-[1px]",
                variants[variant],
                sizes[size],
                className
            )}
            style={{
                x: springX,
                y: springY,
                rotateX,
                rotateY,
                transformPerspective: 600,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            whileTap={{ scale: 0.97 }}
        >
            {children}
        </motion.button>
    );
}
