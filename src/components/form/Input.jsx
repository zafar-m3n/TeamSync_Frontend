import { forwardRef } from "react";
import clsx from "clsx";

const base =
  "block w-full rounded-md border bg-white px-3 py-2 text-sm text-text placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed";

const Input = forwardRef(function Input({ multiline = false, invalid = false, rows = 4, className, ...props }, ref) {
  const classes = clsx(base, invalid ? "border-red-600" : "border-gray-300", className);

  if (multiline) {
    return <textarea ref={ref} rows={rows} className={clsx(classes, "resize-y")} {...props} />;
  }

  return <input ref={ref} className={classes} {...props} />;
});

export default Input;
