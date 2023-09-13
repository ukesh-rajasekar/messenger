import { FC } from 'react'
import Button from '../../components/ui/Button'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface pageProps {
  
}

const page: FC<pageProps> = async ({}) => {
  const session = await getServerSession(authOptions)

  return <><div>
    {session?.user.id}
    </div>
    <br/>
     <div>
     {session?.user.name}
     </div></>
}

export default page