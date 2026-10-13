import { defineStore } from "pinia"
import { EINHEITEN } from "@/typescript/einheiten"

/**
 * Einheitendefinitionen für die Oberfläche. Die Definitionen selbst liegen in
 * "typescript/einheiten.ts", damit die Modellklassen ohne Pinia auskommen.
 */
export const useEinheitenStore = defineStore("einheitenStore", {
 state: () => ({ ...EINHEITEN }),
})
