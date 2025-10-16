import { useReducedMotion } from "framer-motion";
import { fadeUp } from "./animations";

export function useSafeVariants() {
  const reduce = useReducedMotion();
  return reduce ? { hidden: {}, visible: {} } : fadeUp;
}
