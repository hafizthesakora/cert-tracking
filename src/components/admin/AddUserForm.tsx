'use client';

import { useRef, useState, useTransition } from 'react';
import { Role } from '@prisma/client';
import { createUser } from '@/app/actions';
import {
  User,
  Mail,
  Shield,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

export default function AddUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        setStatus('idle');
        await createUser(formData);
        formRef.current?.reset();
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000); // Clear success message after 3s
      } catch (error) {
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to create user'
        );
      }
    });
  };

  const getRoleDisplayName = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'PORTAL_MASTER':
        return 'Portal Master';
      case 'EMPLOYEE':
        return 'Employee';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-amber-600" />;
      case 'PORTAL_MASTER':
        return <UserPlus className="h-4 w-4 text-indigo-600" />;
      case 'EMPLOYEE':
        return <User className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <UserPlus className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
          <p className="text-sm text-slate-600">
            Create a new user account with assigned role
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">
              User created successfully!
            </p>
            <p className="text-green-700 text-sm">
              The new user can now log in with their credentials.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Failed to create user</p>
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-6">
        {/* Full Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-slate-700"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter full name"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-500"
              required
              disabled={isPending}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-slate-700"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="user@example.com"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 placeholder-slate-500"
              required
              disabled={isPending}
            />
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label
            htmlFor="role"
            className="block text-sm font-semibold text-slate-700"
          >
            Assign Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Shield className="h-4 w-4 text-slate-400" />
            </div>
            <select
              id="role"
              name="role"
              className="w-full pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 appearance-none cursor-pointer"
              required
              defaultValue=""
              disabled={isPending}
            >
              <option value="" disabled className="text-slate-500">
                Select a role...
              </option>
              {Object.values(Role).map((role) => (
                <option key={role} value={role} className="py-2">
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Role Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(Role).map((role) => (
            <div
              key={role}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                {getRoleIcon(role)}
                <span className="text-sm font-semibold text-slate-700">
                  {getRoleDisplayName(role)}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {role === 'ADMIN'
                  ? 'Full system access and user management.'
                  : role === 'PORTAL_MASTER'
                  ? 'Manages specific certifications and renewals.'
                  : 'Can view own certifications and request renewals.'}
              </p>
            </div>
          ))}
        </div>

        {/* Default Password Info */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800 mb-1">
                Default Password Information
              </h4>
              <p className="text-sm text-amber-700 mb-2">
                New users will be assigned a default password that they must
                change upon first login.
              </p>
              <div className="flex items-center gap-2 p-2 bg-amber-100 rounded border border-amber-300">
                <span className="text-xs text-amber-800">
                  Default Password:
                </span>
                <code className="text-sm font-mono font-bold text-amber-900 bg-amber-200 px-2 py-1 rounded">
                  {showPassword ? 'password123' : '••••••••••••'}
                </code>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-amber-600 hover:text-amber-800 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating User...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
