import { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive' | 'success';
    children?: ReactNode;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'default',
    children,
}: ConfirmationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="overflow-hidden rounded-4xl border-border bg-card p-0 text-foreground shadow-2xl sm:max-w-[450px]">
                <div
                    className={cn(
                        'p-8',
                        variant === 'destructive'
                            ? 'bg-destructive/5'
                            : 'bg-primary/5',
                    )}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-base font-medium text-muted-foreground">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    {children && <div className="mt-6">{children}</div>}
                    <DialogFooter className="mt-8 flex-col gap-3 sm:flex-row">
                        <Button
                            variant="ghost"
                            className="h-12 flex-1 rounded-2xl font-bold hover:bg-muted"
                            onClick={onClose}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={
                                variant === 'destructive'
                                    ? 'destructive'
                                    : 'default'
                            }
                            className={cn(
                                'h-12 flex-1 rounded-2xl font-bold shadow-lg transition-transform active:scale-95',
                                variant !== 'destructive'
                                    ? 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90'
                                    : 'shadow-destructive/20',
                            )}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
