import { useCallback, useMemo, useState } from 'react';

import { authClient } from '@/lib/auth/client';
import type { MeUser } from '@/lib/hooks/useMe';
import type { MovementRole } from '@/src/features/movements/hooks/useMovementsQuery';

export interface MovementFormState {
  type: MovementRole;
  amount: string;
  concept: string;
  date: string;
}

const initialForm: MovementFormState = {
  type: 'INCOME',
  amount: '',
  concept: '',
  date: '',
};

type BannerState = { type: 'success' | 'error'; message: string } | null;

interface UseMovementsPageStateParams {
  user: MeUser | null;
  userLoading: boolean;
  meError: string | null;
  refreshMe: () => Promise<unknown>;
  refreshMovements: () => Promise<void>;
  queryLoading: boolean;
  queryError: string | null;
}

export const useMovementsPageState = ({
  user,
  userLoading,
  meError,
  refreshMe,
  refreshMovements,
  queryLoading,
  queryError,
}: UseMovementsPageStateParams) => {
  const [banner, setBanner] = useState<BannerState>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setFormError(null);
    setFormLoading(false);
  }, []);

  const handleDialogChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        resetForm();
      }
    },
    [resetForm]
  );

  const handleInputChange = useCallback(
    (key: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const validateForm = useCallback(() => {
    if (!form.concept.trim()) {
      return 'Concept is required.';
    }
    const amountNumber = Number(form.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return 'Amount must be a positive number.';
    }
    if (!form.date) {
      return 'Date is required.';
    }
    return null;
  }, [form.amount, form.concept, form.date]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const validationMessage = validateForm();
      if (validationMessage) {
        setFormError(validationMessage);
        return;
      }
      setFormLoading(true);
      setFormError(null);
      try {
        const isoDate = new Date(`${form.date}T00:00:00.000Z`).toISOString();
        const response = await fetch('/api/movements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: form.type,
            amount: Number(form.amount),
            concept: form.concept.trim(),
            date: isoDate,
          }),
        });
        if (response.status === 401) {
          throw new Error('You need to sign in again.');
        }
        if (response.status === 403) {
          throw new Error('Only admins can create movements.');
        }
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? 'Unable to create movement.');
        }
        setBanner({
          type: 'success',
          message: 'Movement created successfully.',
        });
        handleDialogChange(false);
        await refreshMovements();
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : 'Unexpected error.'
        );
      } finally {
        setFormLoading(false);
      }
    },
    [form, handleDialogChange, refreshMovements, validateForm]
  );

  const headerDescription = useMemo(() => {
    if (!user && !userLoading) {
      return 'Sign in to review and create team movements.';
    }
    return 'Monitor cashflow and create new entries when needed.';
  }, [user, userLoading]);

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
    await refreshMovements();
  }, [refreshMe, refreshMovements]);

  const listLoading = userLoading || queryLoading;
  const listError =
    !user && !userLoading && !meError
      ? 'Please sign in to view movements.'
      : queryError;

  return {
    banner,
    dialogOpen,
    form,
    formError,
    formLoading,
    headerDescription,
    listLoading,
    listError,
    handleDialogChange,
    handleInputChange,
    handleSubmit,
    handleSignIn,
    handleSignOut,
  };
};
