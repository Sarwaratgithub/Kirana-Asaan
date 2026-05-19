import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Store, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(4, "PIN must be at least 4 digits"),
});

export default function LoginPage() {
  const { login, isLoggingIn, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    return null;
  }

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login(values);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto bg-primary p-6 rounded-[2.5rem] w-24 h-24 flex items-center justify-center shadow-2xl shadow-primary/20 mb-8 transition-transform active:scale-95 duration-500">
            <Store className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tighter uppercase">
            Kirana Asaan
          </h1>
          <p className="text-slate-400 mt-2 font-medium italic">
            "Apni dukaan, ab digital!"
          </p>
        </div>

        <div className="space-y-6 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Mobile Number Likhein"
                          type="tel" 
                          className="h-16 pl-6 pr-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="font-bold text-xs px-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <Input
                        placeholder="4-Digit PIN"
                        type="password"
                        maxLength={4}
                        className="h-16 bg-white border-2 border-slate-100 rounded-2xl text-center text-xl font-black tracking-[0.5em] focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-bold text-xs px-2 text-center" />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 btn-3d rounded-2xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Chal raha hai...
                    </>
                  ) : (
                    "Chalain (Login)"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] pt-12">
          Powered by Kirana Asaan
        </p>
      </div>
    </div>
  );
}
