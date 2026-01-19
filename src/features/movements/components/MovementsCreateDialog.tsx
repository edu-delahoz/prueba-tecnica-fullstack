import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MovementRole } from '@/src/features/movements/hooks/useMovementsQuery';
import type { MovementFormState } from '@/src/features/movements/hooks/useMovementsPageState';

interface MovementsCreateDialogProps {
  isAdmin: boolean;
  open: boolean;
  form: MovementFormState;
  formError: string | null;
  formLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onInputChange: (key: keyof MovementFormState, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const MovementsCreateDialog = ({
  isAdmin,
  open,
  form,
  formError,
  formLoading,
  onOpenChange,
  onInputChange,
  onSubmit,
}: MovementsCreateDialogProps) => {
  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className='rounded-full px-6'>New movement</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create movement</DialogTitle>
          <DialogDescription>
            Register an income or expense for the team.
          </DialogDescription>
        </DialogHeader>
        <form className='mt-6 space-y-4' onSubmit={onSubmit}>
          <div className='space-y-2'>
            <Label htmlFor='type'>Type</Label>
            <Select
              value={form.type}
              onValueChange={(value) =>
                onInputChange('type', value as MovementRole)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='INCOME'>Income</SelectItem>
                <SelectItem value='EXPENSE'>Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='amount'>Amount</Label>
            <Input
              id='amount'
              type='number'
              min='0'
              placeholder='0.00'
              value={form.amount}
              onChange={(event) => onInputChange('amount', event.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='concept'>Concept</Label>
            <Input
              id='concept'
              type='text'
              placeholder='Description'
              value={form.concept}
              onChange={(event) => onInputChange('concept', event.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='date'>Date</Label>
            <Input
              id='date'
              type='date'
              value={form.date}
              onChange={(event) => onInputChange('date', event.target.value)}
            />
          </div>
          {formError && <p className='text-sm text-destructive'>{formError}</p>}
          <Button className='w-full' type='submit' disabled={formLoading}>
            {formLoading ? 'Saving…' : 'Create movement'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
