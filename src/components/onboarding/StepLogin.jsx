"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { supabase } from "@/lib/supabase-browser";


export function StepLogin () {
   const router = useRouter()

   const [nome,setNome] = useState("")
   const [email, setEmail]= useState("")
   const [senha, setSenha]= useState("")
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

  async function handleContinue(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try{
        const {error: loginError} = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        })  
        if(loginError) throw loginError
        
        router.push('/dashboard')
     } catch (err){
        setError(err.message ?? "E-mail ou senha incorretos.")
     } finally{
        setLoading(false)
     }





  }

return(
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
    
          <div className="relative z-10 w-full max-w-md animate-fade-up">
            <Logo className="justify-center mb-6" />
    
            <h2 className="font-sora font-bold text-2xl text-gray-900 text-center mb-2">
              Login
            </h2>
            
    
           
    
            {error && (
              <div className="bg-danger-50 border border-danger-400/30 rounded-xl px-4 py-3 mb-4">
                <p className="text-sm text-danger-600">⚠️ {error}</p>
              </div>
            )}
    
            <form onSubmit={handleContinue} className="space-y-3">
              
              <input
                type="email"
                placeholder="Seu e-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-brand-400 transition-colors font-dm"
              />
              <input
                type="password"
                placeholder="Criar senha (mín. 8 caracteres)"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-brand-400 transition-colors font-dm"
              />
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full justify-center"
              >
                Login
              </Button>
            </form>
             <p className="text-center text-xs text-gray-400 mt-4">
          Não tem conta?{" "}
          <span
            onClick={() => router.push("/onboarding")}
            className="text-brand-500 cursor-pointer hover:text-brand-600 transition-colors"
          >
            Criar conta grátis
          </span>
        </p>
    
        </div>
        </div>
      );























}