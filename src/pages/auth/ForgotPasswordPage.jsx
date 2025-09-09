import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    const success = await forgotPassword(data.email);
    if (success) {
      toast({
        title: 'Success',
        description: 'Password reset instructions have been sent to your email',
      });
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to send reset instructions',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="text-gray-500">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send reset instructions'}
          </Button>
        </form>

        <div className="text-center text-sm">
          Remember your password?{' '}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-500"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
