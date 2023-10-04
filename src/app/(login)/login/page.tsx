'use client';

import GoogleIcon from '@/assets/google';
import Button from '@/components/ui/Button';
import ThoodhanIcon from '@/assets/thoodhan';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Login() {
   const [isLoading, setIsLoading] = useState<boolean>(false);

   async function logInWithGoogle() {
      setIsLoading(true);
      try {
         const res = await signIn('google');
         console.log(res, 'sign in result');
      } catch (e) {
         toast.error('something went wrong, try again later!');
      } finally {
         setIsLoading(false);
      }
   }
   return (
      <>
         <div className='flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
            <div className='w-full flex flex-col items-center maz-w-md space-y-8'>
               <div className='flex flex-col items-center gap-8'>
                  <ThoodhanIcon className='h-8 w-auto text-indigo-600' />
                  <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
                     Sign in to your account
                  </h2>
               </div>
               <Button
                  isLoading={isLoading}
                  className='max-w-sm mx-auto w-full'
                  onClick={logInWithGoogle}>
                  {isLoading ? null : <GoogleIcon />}
                  {'Google'}
               </Button>
            </div>
         </div>
      </>
   );
}
