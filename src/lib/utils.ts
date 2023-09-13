import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...input: ClassValue[]){
    return twMerge(clsx(input))
     
}

export function chatLinkConstructor(id1:string, id2:string) {
    const sortedIds =  [id1, id2].sort()
     return sortedIds.join('--')
}