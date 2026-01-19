import { useCallback, useState } from 'react';

import { authClient } from '@/lib/auth/client';
import type { MeUser } from '@/lib/hooks/useMe';
import type { Role, UserRow } from '@/lib/users/types';
import { updateUserRequest } from '@/src/features/users/api/updateUser';

type BannerState = { type: 'success' | 'error'; message: string } | null;

interface UseUsersPageStateParams {
  user: MeUser | null;
  refreshMe: () => Promise<unknown>;
  refreshUsers: () => Promise<void>;
}

export const useUsersPageState = ({
  user,
  refreshMe,
  refreshUsers,
}: UseUsersPageStateParams) => {
  const [banner, setBanner] = useState<BannerState>(null);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openEditModal = useCallback((target: UserRow) => {
    setSelectedUser(target);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  }, []);

  const handleSaveUser = useCallback(
    async (id: string, payload: { name: string; role: Role }) => {
      await updateUserRequest(id, payload);
      setBanner({ type: 'success', message: 'User updated successfully.' });
      await refreshUsers();
    },
    [refreshUsers]
  );

  const handleSignIn = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/`,
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    await refreshMe();
    await refreshUsers();
  }, [refreshMe, refreshUsers]);

  const clearBanner = useCallback(() => {
    setBanner(null);
  }, []);

  return {
    ui: {
      banner,
      dialogOpen,
      selectedUser,
      canEdit: user?.role === 'ADMIN',
    },
    actions: {
      openEditModal,
      handleDialogOpenChange,
      handleSaveUser,
      handleSignIn,
      handleSignOut,
      clearBanner,
    },
  };
};
