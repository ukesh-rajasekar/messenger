'use client'

import { FC, ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

interface ToastersProps {
    children: ReactNode
}

const Toasters: FC<ToastersProps> = ({ children }) => {
    return (<>
        <Toaster position='top-center' reverseOrder={false} />{children}
    </>)
}

export default Toasters