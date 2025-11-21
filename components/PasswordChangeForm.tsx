import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { updateCurrentUserPassword } from '../lib/auth';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { toast } from 'sonner';

const PasswordChangeForm: React.FC<{onPasswordChanged?: () => void}> = ({onPasswordChanged}) => {
  const { user, updateUserInContext } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to change your password.");
      return;
    }

    setIsLoading(true);
    const result = await updateCurrentUserPassword(user.id, newPassword);
    if (result.success) {
      setNewPassword('');
      setConfirmPassword('');
      // Fix: The `updateCurrentUserPassword` function does not return the updated user object.
      // We will construct the updated user object manually and update the auth context.
      const updatedUser = { ...user, password: newPassword };
      updateUserInContext(updatedUser);
      onPasswordChanged?.();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          disabled={isLoading}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  );
};

export default PasswordChangeForm;