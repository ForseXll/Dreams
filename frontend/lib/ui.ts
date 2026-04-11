import { cva } from "class-variance-authority";
import { cn } from "./utils";

// Re-export cn for convenience
export { cn };

/* ============================================
   Modern UI Component Classes
   Using OKLCH color system and semantic tokens
   ============================================ */

// Animation utility classes
export const animateClasses = {
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  scaleIn: "animate-scaleIn",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
};

// Micro-interaction transitions
export const transitionClasses = {
  fast: "transition-all duration-150 ease-out",
  normal: "transition-all duration-250 ease-out",
  slow: "transition-all duration-350 ease-out",
  bounce: "transition-all duration-300 ease-bounce",
};

// Hover effect classes
export const hoverClasses = {
  lift: "hover:-translate-y-1 hover:shadow-lg",
  scale: "hover:scale-[1.02]",
  glow: "hover:shadow-[0_0_20px_rgba(var(--color-accent),0.3)]",
  brightness: "hover:brightness-110",
};

/* ============================================
   Card Components
   ============================================ */

export const cardVariants = cva(
  "rounded-xl border bg-[var(--color-surface-elevated)] overflow-hidden transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "border-[var(--color-border)] shadow-sm hover:shadow-md",
        elevated: "border-[var(--color-border-strong)] shadow-md hover:shadow-lg hover:-translate-y-1",
        ghost: "border-transparent bg-transparent hover:bg-[var(--color-surface-alt)]",
        interactive: "border-[var(--color-border)] shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/* ============================================
   Button Components
   ============================================ */

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-light)] active:scale-95",
        secondary: "bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] active:scale-95",
        accent: "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-light)] active:scale-95",
        ghost: "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] active:scale-95",
        destructive: "bg-[var(--color-danger)] text-[var(--color-danger-foreground)] hover:bg-[var(--color-danger-light)] active:scale-95",
        outline: "bg-transparent border-2 border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] hover:border-[var(--color-accent)] active:scale-95",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

/* ============================================
   Input Components
   ============================================ */

export const inputVariants = cva(
  "flex w-full rounded-lg border bg-[var(--color-surface-elevated)] px-3 py-2 text-sm transition-all duration-200 ease-out placeholder:text-[var(--color-text-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-[var(--color-border)] focus:border-[var(--color-accent)]",
        error: "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
        success: "border-[var(--color-success)] focus:border-[var(--color-success)]",
      },
      size: {
        sm: "h-8",
        md: "h-10",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/* ============================================
   Badge Components
   ============================================ */

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-surface-alt)] text-[var(--color-text)] border border-[var(--color-border)]",
        primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
        accent: "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
        success: "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
        warning: "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
        danger: "bg-[var(--color-danger)] text-[var(--color-danger-foreground)]",
        info: "bg-[var(--color-info)] text-[var(--color-info-foreground)]",
        outline: "border border-[var(--color-border)] text-[var(--color-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/* ============================================
   Layout Components
   ============================================ */

export const containerClass = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

export const pageClass = "min-h-screen bg-[var(--color-surface)] text-[var(--color-text)]";

export const sectionClass = "grid gap-8";

export const headerClass = "border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 backdrop-blur-xl sticky top-0 z-50";

/* ============================================
   Typography Classes
   ============================================ */

export const typographyClasses = {
  // Fluid typography using clamp()
  h1: "text-[clamp(2.4rem,5vw+1rem,4rem)] font-bold tracking-tight leading-tight",
  h2: "text-[clamp(2rem,4vw+0.5rem,3.2rem)] font-bold tracking-tight leading-tight",
  h3: "text-[clamp(1.6rem,3vw+0.5rem,2.4rem)] font-semibold tracking-tight leading-snug",
  h4: "text-[clamp(1.4rem,2vw+0.3rem,2rem)] font-semibold tracking-tight leading-snug",
  body: "text-[clamp(1.4rem,1vw+1rem,1.6rem)] leading-relaxed",
  small: "text-[clamp(1.2rem,0.8vw+0.8rem,1.4rem)] leading-relaxed",
  muted: "text-[var(--color-text-muted)]",
  subtle: "text-[var(--color-text-subtle)]",
};

/* ============================================
   Skeleton Loading
   ============================================ */

export const skeletonClass = "animate-pulse rounded-lg bg-[var(--color-surface-alt)]";

/* ============================================
   Status Message Classes
   ============================================ */

export const statusVariants = cva(
  "rounded-xl border p-6 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
        success: "border-[var(--color-success)] bg-[var(--color-success-light)]",
        warning: "border-[var(--color-warning)] bg-[var(--color-warning-light)]",
        error: "border-[var(--color-danger)] bg-[var(--color-danger-light)]",
        info: "border-[var(--color-info)] bg-[var(--color-info-light)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/* ============================================
   Bento Grid Layout
   ============================================ */

export const bentoGridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr";

export const bentoItemClass = {
  default: "col-span-1",
  wide: "col-span-1 md:col-span-2",
  tall: "row-span-2",
  large: "col-span-1 md:col-span-2 row-span-2",
};

/* ============================================
   Form Classes
   ============================================ */

export const formClasses = {
  group: "space-y-2",
  label: "block text-sm font-semibold text-[var(--color-text)]",
  helper: "text-sm text-[var(--color-text-muted)]",
  error: "text-sm text-[var(--color-danger)]",
  fieldset: "space-y-6 disabled:opacity-50",
};

/* ============================================
   Legacy Classes (Backward Compatibility)
   ============================================ */

// Keep these for existing components that use them
export const panelClass = cardVariants({ variant: "default" });

export const primaryButtonClass = buttonVariants({ variant: "primary" });

export const secondaryButtonClass = buttonVariants({ variant: "secondary" });

export const destructiveButtonClass = buttonVariants({ variant: "destructive" });

export const quietButtonClass = buttonVariants({ variant: "ghost" });

export const inputClass = inputVariants({ variant: "default" });

export const sectionHeaderClass = "grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end";

export const sectionTitleClass = typographyClasses.h1;

export const sectionDescriptionClass = `m-0 max-w-[52rem] ${typographyClasses.body} ${typographyClasses.muted}`;

export const statCardClass = cardVariants({ variant: "default", size: "sm" });

export const mutedSurfaceClass = "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4";

export const metaLabelClass = "m-0 text-sm font-semibold tracking-wide text-[var(--color-text-muted)]";

export const formClass = `${cardVariants({ variant: "default" })} p-7`;

export const fieldsetClass = formClasses.fieldset;

export const formLabelClass = formClasses.label;

export const formHeadingClass = typographyClasses.h2;

export const formHelperClass = formClasses.helper;

export const formStatusClass = "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 text-sm text-[var(--color-text-muted)]";

export const successStatusClass = "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 text-sm text-[var(--color-text)]";
