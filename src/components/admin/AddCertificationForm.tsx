'use client';

import { useRef, useState, useTransition } from 'react';
import { User } from '@prisma/client';
import { createCertification } from '@/app/actions';
import {
  Shield,
  FileText,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Search,
  Crown,
  User as UserIcon,
} from 'lucide-react';

export default function AddCertificationForm({ users }: { users: User[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPortalMasters, setSelectedPortalMasters] = useState<User[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        setStatus('idle');

        // Add selected portal master IDs to form data
        selectedPortalMasters.forEach((user) => {
          formData.append('portalMasterIds', user.id);
        });

        await createCertification(formData);
        formRef.current?.reset();
        setSelectedPortalMasters([]);
        setSearchTerm('');
        setStatus('success');
        setTimeout(() => setStatus('idle'), 3000);
      } catch (error) {
        setStatus('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to create certification'
        );
      }
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addPortalMaster = (user: User) => {
    if (!selectedPortalMasters.find((pm) => pm.id === user.id)) {
      setSelectedPortalMasters((prev) => [...prev, user]);
    }
    setSearchTerm('');
  };

  const removePortalMaster = (userId: string) => {
    setSelectedPortalMasters((prev) => prev.filter((pm) => pm.id !== userId));
  };

  const getRoleIcon = (role: string) => {
    return role === 'ADMIN' ? (
      <Crown className="h-3 w-3 text-amber-600" />
    ) : (
      <UserIcon className="h-3 w-3 text-blue-600" />
    );
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Add New Certification
          </h2>
          <p className="text-sm text-slate-600">
            Create a new certification type for employee tracking
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">
              Certification created successfully!
            </p>
            <p className="text-green-700 text-sm">
              The new certification is now available in the system.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">
              Failed to create certification
            </p>
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-6">
        {/* Certification Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-slate-700"
          >
            Certification Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g., BOSIET, HUET, First Aid"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-slate-900 placeholder-slate-500"
              required
              disabled={isPending}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-slate-700"
          >
            Description
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="e.g., Basic Offshore Safety Induction and Emergency Training - Required for all offshore personnel"
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-slate-900 placeholder-slate-500 resize-none"
              required
              disabled={isPending}
            />
          </div>
        </div>

        {/* Portal Masters Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-600" />
            <label className="block text-sm font-semibold text-slate-700">
              Portal Masters
            </label>
            <span className="text-xs text-slate-500">(Optional)</span>
          </div>

          <p className="text-sm text-slate-600">
            Portal Masters can manage this certification and its employee
            assignments.
          </p>

          {/* Selected Portal Masters */}
          {selectedPortalMasters.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Selected Portal Masters:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedPortalMasters.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm font-medium text-slate-700">
                        {user.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePortalMaster(user.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      disabled={isPending}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Search and Selection */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search users to add as Portal Masters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white text-slate-900 placeholder-slate-500"
              disabled={isPending}
            />
          </div>

          {/* User Dropdown */}
          {searchTerm && (
            <div className="border border-slate-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => addPortalMaster(user)}
                    disabled={
                      selectedPortalMasters.find((pm) => pm.id === user.id) !==
                        undefined || isPending
                    }
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    {selectedPortalMasters.find((pm) => pm.id === user.id) && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500">
                  No users found matching "{searchTerm}"
                </div>
              )}
            </div>
          )}

          {users.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                No users available to assign as Portal Masters. Create users
                first to assign them to certifications.
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">
                About Portal Masters
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Can manage employee assignments for this certification
                </li>
                <li>• Can view certification status and expiration dates</li>
                <li>• Can approve renewal requests (if applicable)</li>
                <li>• Admins have access to all certifications by default</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-green-700"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Certification...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Certification
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
