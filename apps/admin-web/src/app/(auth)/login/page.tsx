'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Terminal, User, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/authService';
import { useAuth } from '@/components/AuthContext';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';

const DEFAULT_TENANT_CODE = 'DEFAULT';

const loginSchema = z.object({
  account: z.string().min(1, '请输入用户名/账号'),
  password: z.string().min(6, '密码至少6位'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      account: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    const savedAccount = localStorage.getItem('remember_account');
    if (savedAccount) {
      setValue('account', savedAccount);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);

      const res = await authService.tenantLogin({
        username: data.account,
        password: data.password,
        tenantCode: DEFAULT_TENANT_CODE,
      }, { showError: false });

      if (res.accessToken) {
        login(res.accessToken, res.user, res.refreshToken);
        localStorage.setItem('login_mode', 'tenant');
        localStorage.setItem('tenant_code', DEFAULT_TENANT_CODE);

        if (data.rememberMe) {
          localStorage.setItem('remember_account', data.account);
        } else {
          localStorage.removeItem('remember_account');
        }

        toast.success('登录成功');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background text-foreground selection:bg-primary/30">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border/40 bg-card shadow-terminal overflow-hidden transition-all duration-300 hover:shadow-primary/5">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="ml-2 font-mono text-xs text-muted-foreground select-none">
                ~/one-recycle/login
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="font-mono">租户: {DEFAULT_TENANT_CODE}</span>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8 text-center sm:text-left">
              <div className="sm:mx-0 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform hover:scale-110 duration-300">
                <Terminal className="h-6 w-6" />
              </div>
              <h1 className="font-mono text-2xl font-bold tracking-tight mb-2">
                <span className="text-syntax-keyword">const</span>{' '}
                <span className="text-syntax-function">auth</span>{' '}
                <span className="text-muted-foreground">=</span>{' '}
                <span className="text-syntax-string">&quot;商家管理后台&quot;</span>
              </h1>
              <p className="font-mono text-sm text-syntax-comment animate-pulse-slow">
                {'// '}请输入员工账号密码登录
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-mono text-xs text-syntax-comment mb-1">
                    {'// 用户名 (USERNAME)'}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="请输入用户名"
                      {...register('account')}
                      className={cn(
                        "h-11 pl-10 font-mono bg-background/50 border-border/40 focus:border-primary focus:ring-1 focus:ring-primary transition-all",
                        errors.account && "border-error focus-visible:ring-error"
                      )}
                    />
                  </div>
                  {errors.account && (
                    <p className="font-mono text-xs text-error mt-1">{errors.account.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-xs text-syntax-comment mb-1">
                    {'// 密码 (PASSWORD)'}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      {...register('password')}
                      className={cn(
                        "h-11 pl-10 pr-10 font-mono bg-background/50 border-border/40 focus:border-primary focus:ring-1 focus:ring-primary transition-all",
                        errors.password && "border-error focus-visible:ring-error"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="font-mono text-xs text-error mt-1">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  {...register('rememberMe')}
                  className="h-4 w-4 border-border/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="rememberMe"
                  className="font-mono text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  记住账号
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-mono text-sm bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {'// 验证中...'}
                  </>
                ) : (
                  '>> 执行登录'
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            OneRecycle v1.0.0 | 租户代码: {DEFAULT_TENANT_CODE}
          </p>
        </div>
      </div>
    </div>
  );
}
