/**
 * Builds the cn class-name helper for the shadcn components.
 * Components import it from @/lib/utils.
 */
import { createCn } from "cn/config"

// The text scale in globals.css adds size names that cn does not know.
// Without them cn reads text-label as a color and drops it next to text-red.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["label", "meta", "row", "body", "lead", "stat", "score", "headline"] }],
    },
  },
})
