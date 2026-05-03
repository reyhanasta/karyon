import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export type Employee = {
    id: number;
    full_name: string;
    user_id: number;
    department?: { name: string };
    position?: { name: string };
};

interface UserCardProps {
    employee: Employee;
    label: string;
    isActive?: boolean;
    status?: string;
    className?: string;
}

const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export function UserCard({
    employee,
    label,
    isActive = false,
    status,
    className,
}: UserCardProps) {
    return (
        <div
            className={cn(
                'relative flex flex-1 items-center gap-4 rounded-[2rem] p-6 transition-all duration-500',
                isActive
                    ? 'border-2 border-primary/20 bg-primary/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
                    : 'border border-border/50 bg-card shadow-sm transition-shadow hover:border-border hover:shadow-md',
                className
            )}
        >
            <div
                className={cn(
                    'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold transition-transform duration-500 hover:scale-105 md:h-20 md:w-20 md:text-2xl',
                    isActive
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'bg-muted text-muted-foreground',
                )}
            >
                {getInitials(employee.full_name)}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                    {label}
                </p>
                <h3 className="truncate text-lg font-bold tracking-tight text-foreground" title={employee.full_name}>
                    {employee.full_name}
                </h3>
                <div className="flex flex-col">
                    <p className="truncate text-xs font-medium text-muted-foreground">
                        {employee.position?.name ?? 'Karyawan'}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground/60">
                        {employee.department?.name ??
                            'Departemen tidak tersedia'}
                    </p>
                </div>
                {status && (
                    <div className="mt-2">
                        <Badge
                            variant={
                                status === 'DISETUJUI' 
                                    ? 'success' 
                                    : status === 'MENUNGGU' 
                                        ? 'warning' 
                                        : 'default'
                            }
                            className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                        >
                            {status}
                        </Badge>
                    </div>
                )}
            </div>
            {isActive && (
                <div className="absolute top-4 right-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                </div>
            )}
        </div>
    );
}
