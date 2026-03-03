// import Image from 'next/image'
import { LoginForm } from '@/features/auth'
import Image from "next/image";


export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Image
          src="/images/logo.svg"
          alt="Group Logo"
          width={320}
          height={10}
          priority
        />
        <LoginForm />
      </div>
    </main>
  )
}
