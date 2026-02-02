'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Terminal, User, Lock, Eye, EyeOff, Check, Building, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';

const loginSchema = z.object({
  account: z.string().min(1, '请输入用户名/账号'),
  password: z.string().min(6, '密码至少6位'),
  tenantCode: z.string().optional(),
  rememberMe: z.boolean(),
}).refine((data) => {
  // If we had a mode here, we could validate tenantCode. 
  // But zod refine is usually better with the full context.
  return true;
}, {
  message: "请输入租户代码",
  path: ["tenantCode"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginMode = 'platform' | 'tenant';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('platform');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      account: '',
      password: '',
      tenantCode: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    const savedAccount = localStorage.getItem('remember_account');
    if (savedAccount) {
      setValue('account', savedAccount);
      setValue('rememberMe', true);
    }
    const savedTenantCode = localStorage.getItem('remember_tenant_code');
    if (savedTenantCode) {
      setValue('tenantCode', savedTenantCode);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);

      let res;
      if (loginMode === 'platform') {
        res = await authService.login({
          account: data.account,
          password: data.password,
        });
      } else {
        if (!data.tenantCode) {
          toast.error('请输入租户代码');
          setLoading(false);
          return;
        }
        res = await authService.tenantLogin({
          username: data.account,
          password: data.password,
          tenantCode: data.tenantCode,
        });
      }

      if (res.accessToken) {
        localStorage.setItem('auth_token', res.accessToken);
        localStorage.setItem('user_info', JSON.stringify(res.user));
        localStorage.setItem('login_mode', loginMode);

        if (data.rememberMe) {
          localStorage.setItem('remember_account', data.account);
          if (loginMode === 'tenant' && data.tenantCode) {
            localStorage.setItem('remember_tenant_code', data.tenantCode);
          }
        } else {
          localStorage.removeItem('remember_account');
          localStorage.removeItem('remember_tenant_code');
        }

        document.cookie = `auth_token=${res.accessToken}; path=/; max-age=${res.expiresIn || 86400}; SameSite=Strict`;

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
      {/* Grid background inherited from globals.css */}

      <div className="w-full max-w-md">
        {/* Terminal window card */}
        <div className="rounded-lg border border-border/40 bg-card shadow-terminal overflow-hidden transition-all duration-300 hover:shadow-primary/5">
          {/* Terminal chrome */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="ml-2 font-mono text-xs text-muted-foreground select-none">
                ~/one-recycle/login --mode {loginMode}
              </span>
            </div>
            <div className="flex bg-background/50 rounded-md p-0.5 border border-border/20">
              <button
                onClick={() => setLoginMode('platform')}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-mono transition-all",
                  loginMode === 'platform' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                PLATFORM
              </button>
              <button
                onClick={() => setLoginMode('tenant')}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-mono transition-all",
                  loginMode === 'tenant' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                TENANT
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8 text-center sm:text-left">
              <div className="sm:mx-0 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform hover:scale-110 duration-300">
                {loginMode === 'platform' ? <Terminal className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
              </div>
              <h1 className="font-mono text-2xl font-bold tracking-tight mb-2">
                <span className="text-syntax-keyword">const</span>{' '}
                <span className="text-syntax-function">auth</span>{' '}
                <span className="text-muted-foreground">=</span>{' '}
                <span className="text-syntax-string">&quot;{loginMode === 'platform' ? '系统管理' : '商家内后台'}&quot;</span>
              </h1>
              <p className="font-mono text-sm text-syntax-comment animate-pulse-slow">
                {'// '}{loginMode === 'platform' ? '请输入管理员凭据以进入系统核心' : '请输入所属租户及员工账号密码'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4">
                {loginMode === 'tenant' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block font-mono text-xs text-syntax-comment mb-1">
                      {'// 租户代码 (TENANT_CODE)'}
                    </label>
                    <div className="relative group min-h-[40px]">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Building className="h-4 w-4" />
                      </div>
                      <Input
                        placeholder="请输入租户识别码"
                        {...register('tenantCode')}
                        className={cn(
                          "pl-10 !bg-background/80 font-mono text-sm border-border/40 focus:border-primary/50",
                          errors.tenantCode && "border-error focus-visible:ring-error"
                        )}
                      />
                    </div>
                    {errors.tenantCode && (
                      <p className="font-mono text-xs text-error mt-1">{errors.tenantCode.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block font-mono text-xs text-syntax-comment mb-1">
                    {'// 账号 (ACCOUNT)'}
                  </label>
                  <div className="relative group min-h-[40px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder={loginMode === 'platform' ? "用户名/手机号" : "员工用户名"}
                      {...register('account')}
                      className={cn(
                        "pl-10 !bg-background/80 font-mono text-sm border-border/40 focus:border-primary/50",
                        errors.account && "border-error focus-visible:ring-error"
                      )}
                    />
                  </div>
                  {errors.account && (
                    <p className="font-mono text-xs text-error mt-1">{errors.account.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-mono text-xs text-syntax-comment mb-1">
                      {'// 密码 (PASSWORD)'}
                    </label>
                    <a href="#" className="font-mono text-[10px] text-primary hover:underline opacity-80 hover:opacity-100 transition-opacity">
                      忘记密码?
                    </a>
                  </div>
                  <div className="relative group min-h-[40px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      {...register('password')}
                      className={cn(
                        "pl-10 pr-10 !bg-background/80 font-mono text-sm border-border/40 focus:border-primary/50",
                        errors.password && "border-error focus-visible:ring-error"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="font-mono text-xs text-error mt-1">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <Checkbox
                    id="remember"
                    checked={watch('rememberMe')}
                    onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
                    className="bg-muted/10 border-border/40 data-[state=checked]:bg-primary transition-all"
                  />
                  <label
                    htmlFor="remember"
                    className="font-mono text-[11px] text-muted-foreground group-hover:text-foreground cursor-pointer select-none transition-colors"
                  >
                    记住登录状态
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-mono py-6 shadow-lg shadow-primary/10 active:translate-y-[1px] transition-all"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    EXECUTE LOGIN
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="font-mono text-[10px] text-center text-syntax-comment leading-relaxed">
                {'// 登录即代表您同意 One Recycle '}
                <br />
                <a href="#" className="text-primary hover:underline underline-offset-2">服务条款 (Terms)</a>
                {' & '}
                <a href="#" className="text-primary hover:underline underline-offset-2">隐私政策 (Privacy)</a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom status */}
        <div className="mt-6 flex items-center justify-center gap-4 font-mono text-[10px] text-syntax-comment uppercase tracking-widest opacity-60">
          <span>v1.2.4-stable</span>
          <span className="w-1 h-1 rounded-full bg-syntax-comment" />
          <span className="text-syntax-string">system:active</span>
          <span className="w-1 h-1 rounded-full bg-syntax-comment" />
          <span>one-recycle core</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 font-mono text-[10px] text-syntax-comment/20 pointer-events-none hidden lg:block select-none">
        0x7F 0x45 0x4C 0x46 0x02 0x01 0x01 0x00
      </div>
    </div>
  );
}
