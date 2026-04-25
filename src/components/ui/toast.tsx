// import * as React from "react";
// import * as ToastPrimitives from "@radix-ui/react-toast";
// import { cva, type VariantProps } from "class-variance-authority";
// import { X } from "lucide-react";

// import { cn } from "@/lib/utils";

// const ToastProvider = ToastPrimitives.Provider;

// const ToastViewport = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitives.Viewport>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Viewport
//     ref={ref}
//     className={cn(
//       "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
//       className,
//     )}
//     {...props}
//   />
// ));
// ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// const toastVariants = cva(
//   "group pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-hidden rounded-xl border border-white/10 px-4 py-3 pr-8 shadow-2xl backdrop-blur-xl bg-black/60 text-white transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
//   {
//     variants: {
//       variant: {
//         default: "border bg-background text-foreground",
//         destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//     },
//   },
// );

// const Toast = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitives.Root>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
// >(({ className, variant, ...props }, ref) => {
//   return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />;
// });
// Toast.displayName = ToastPrimitives.Root.displayName;

// const ToastAction = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitives.Action>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Action
//     ref={ref}
//     className={cn(
//       "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
//       className,
//     )}
//     {...props}
//   />
// ));
// ToastAction.displayName = ToastPrimitives.Action.displayName;

// const ToastClose = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitives.Close>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Close
//     ref={ref}
//     className={cn(
//       "absolute right-2 top-2 rounded-md p-1 text-white/50 opacity-0 transition hover:text-white group-hover:opacity-100",
//       className,

//     )}
//     toast-close=""
//     {...props}
//   >
//     <X className="h-4 w-4" />
//   </ToastPrimitives.Close>
// ));
// ToastClose.displayName = ToastPrimitives.Close.displayName;

// const ToastTitle = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitives.Title>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold tracking-tight", className)} {...props} />
// ));
// ToastTitle.displayName = ToastPrimitives.Title.displayName;

// const ToastDescription = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitives.Description>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Description ref={ref} className={cn("text-xs text-white/80 leading-relaxed", className)} {...props} />
// ));
// ToastDescription.displayName = ToastPrimitives.Description.displayName;

// type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

// type ToastActionElement = React.ReactElement<typeof ToastAction>;

// export {
//   type ToastProps,
//   type ToastActionElement,
//   ToastProvider,
//   ToastViewport,
//   Toast,
//   ToastTitle,
//   ToastDescription,
//   ToastClose,
//   ToastAction,
// };




// *****************************************
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/* =========================
   PROVIDER
========================= */
const ToastProvider = ToastPrimitives.Provider;

/* =========================
   CENTER VIEWPORT (MAIN FIX)
========================= */
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/* =========================
   TOAST UI (PROFESSIONAL LOOK)
========================= */
const toastVariants = cva(
  `
  group pointer-events-auto relative
  flex items-start gap-3
  w-full max-w-sm

  px-4 py-3
  rounded-xl

  border border-white/10
  bg-black/70 backdrop-blur-2xl
  text-white

  shadow-2xl

  transition-all duration-300
  data-[state=open]:animate-in
  data-[state=closed]:animate-out
  data-[state=open]:fade-in-0
  data-[state=closed]:fade-out-0
  data-[state=open]:zoom-in-95
  data-[state=closed]:zoom-out-95
  `,
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "bg-red-600/90 text-white border-red-400/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/* =========================
   ROOT
========================= */
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
  VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

/* =========================
   ACTION BUTTON
========================= */
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 items-center justify-center rounded-md border border-white/10 px-3 text-xs font-medium hover:bg-white/10 transition",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

/* =========================
   CLOSE BUTTON
========================= */
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 p-1 rounded-md text-white/40 hover:text-white transition",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

/* =========================
   TEXT
========================= */
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold tracking-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs text-white/70 leading-relaxed", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

/* =========================
   TYPES EXPORT
========================= */
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};