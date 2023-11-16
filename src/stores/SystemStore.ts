import System from '@/typescript/classes/System'
import {defineStore} from 'pinia'

export const useSystemStore = defineStore('systemStore',{
    state: () => ({
        system:new System() as System
    })
})