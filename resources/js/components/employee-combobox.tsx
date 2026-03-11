import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Employee = {
    id: number;
    full_name: string;
    department?: { name: string };
    position?: { name: string };
};

interface EmployeeComboboxProps {
    employees: Employee[];
    value: string;
    onSelect: (val: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
}

export function EmployeeCombobox({
    employees,
    value,
    onSelect,
    placeholder = 'Cari dan pilih karyawan...',
    searchPlaceholder = 'Cari karyawan berdasarkan nama...',
}: EmployeeComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = employees.filter((emp) =>
        emp.full_name.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedEmployee = employees.find((emp) => String(emp.id) === value);

    const handleSelect = (emp: Employee) => {
        onSelect(String(emp.id));
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover
            open={open}
            onOpenChange={(o) => {
                setOpen(o);
                if (o) {
                    // focus search input when popover opens
                    setTimeout(() => inputRef.current?.focus(), 10);
                } else {
                    setSearch('');
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span
                        className={cn(
                            'truncate',
                            !selectedEmployee && 'text-muted-foreground',
                        )}
                    >
                        {selectedEmployee
                            ? selectedEmployee.full_name
                            : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
            >
                {/* Search input */}
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>

                {/* Options list */}
                <div className="max-h-64 overflow-y-auto p-1">
                    {filtered.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Karyawan tidak ditemukan.
                        </div>
                    ) : (
                        filtered.map((emp) => {
                            const isSelected = String(emp.id) === value;
                            return (
                                <button
                                    key={emp.id}
                                    type="button"
                                    onClick={() => handleSelect(emp)}
                                    className={cn(
                                        'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        isSelected && 'bg-accent/50',
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            'h-4 w-4 shrink-0',
                                            isSelected
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {emp.full_name}
                                        </span>
                                        {(emp.position || emp.department) && (
                                            <span className="text-xs text-muted-foreground">
                                                {emp.position?.name ??
                                                    'Pegawai'}
                                                {emp.department
                                                    ? ` — ${emp.department.name}`
                                                    : ''}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
