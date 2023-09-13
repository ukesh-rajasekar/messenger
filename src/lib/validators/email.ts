import {z} from 'zod'

export const emailValidator = z.object({
    email: z.string().email()
})

export const idValidator = z.object({
    id: z.string()
})