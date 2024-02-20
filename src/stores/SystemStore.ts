import System from "@/typescript/classes/System"
import { defineStore } from "pinia"

/**
 * In diesem Speicher befindet sich das System, welches wiederrum alle Objektlisten (Knoten, Stäbe, Gelenke....) enthält.
 */
export const useSystemStore = defineStore("systemStore", {
 state: () => ({
  system: new System() as System,
 }),
 getters: {},
})
