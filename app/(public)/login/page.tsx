// import Image from 'next/image'
import { LoginForm } from '@/features/auth'
import Image from "next/image";


export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-6">
        <Image
          src="/images/Logo.png"
          alt="Group Logo"
          width={280}
          height={60}
          priority
          className="h-auto w-40 sm:w-56"
        />
        <LoginForm />
      </div>
    </main>
  )
}
