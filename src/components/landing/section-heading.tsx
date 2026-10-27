import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  id,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p
        className={cn(
          "flex items-center gap-3 font-mono text-xs tracking-wide text-muted-foreground uppercase",
          align === "center" && "justify-center",
        )}
      >
        <span className="text-primary">{index}</span>
        <span aria-hidden="true" className="h-px w-6 bg-border" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-4 font-display text-4xl leading-[1.08] font-normal tracking-tight text-balance text-foreground sm:text-5xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
