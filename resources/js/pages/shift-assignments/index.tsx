import { Head, router, useForm } from '@inertiajs/react';
import {
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
} from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

type Department = { id: number; name: string };
type Shift = {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
};
type ShiftAssignment = {
    id: number;
    employee_id: number;
    shift_id: number;
    date: string;
    shift: Shift;
};
type Employee = {
    id: number;
    full_name: string;
    department?: Department;
    shift_assignments: ShiftAssignment[];
};

export default function Index({
    employees,
    shifts,
    currentMonth,
}: {
    employees: Employee[];
    shifts: Shift[];
    currentMonth: string;
}) {
    const monthDate = parseISO(`${currentMonth}-01`);
    const dateRange = eachDayOfInterval({
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate),
    });

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null,
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        employee_id: '',
        shift_id: '',
        date: '',
    });

    const handlePrevMonth = () => {
        const prev = format(
            new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1),
            'yyyy-MM',
        );
        router.get(
            '/shift-assignments',
            { month: prev },
            { preserveState: true },
        );
    };

    const handleNextMonth = () => {
        const next = format(
            new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
            'yyyy-MM',
        );
        router.get(
            '/shift-assignments',
            { month: next },
            { preserveState: true },
        );
    };

    const openAssignDialog = (employee: Employee, date: Date) => {
        setSelectedEmployee(employee);
        setSelectedDate(date);
        setData({
            employee_id: String(employee.id),
            shift_id: '',
            date: format(date, 'yyyy-MM-dd'),
        });
        setIsAssignOpen(true);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shift-assignments', {
            onSuccess: () => {
                setIsAssignOpen(false);
                reset();
            },
        });
    };

    const handleDeleteAssignment = (assignmentId: number) => {
        if (confirm('Hapus jadwal shift ini?')) {
            router.delete(`/shift-assignments/${assignmentId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dasbor', href: '/dashboard' },
                { title: 'Jadwal Shift', href: '/shift-assignments' },
            ]}
        >
            <Head title="Jadwal Shift" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Jadwal Shift
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola penugasan shift harian karyawan.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="w-40 text-center text-lg font-semibold">
                            {format(monthDate, 'MMMM yyyy', { locale: id })}
                        </h3>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNextMonth}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 z-10 min-w-50 bg-muted">
                                    Karyawan
                                </TableHead>
                                {dateRange.map((date) => (
                                    <TableHead
                                        key={date.toString()}
                                        className="min-w-20 border-l text-center"
                                    >
                                        <div className="text-xs text-muted-foreground">
                                            {format(date, 'EEE', {
                                                locale: id,
                                            })}
                                        </div>
                                        <div>{format(date, 'd')}</div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="sticky left-0 z-10 border-r bg-background font-medium">
                                        {emp.full_name}
                                        <div className="text-xs text-muted-foreground">
                                            {emp.department?.name}
                                        </div>
                                    </TableCell>
                                    {dateRange.map((date) => {
                                        const assignment =
                                            emp.shift_assignments.find((a) =>
                                                isSameDay(
                                                    parseISO(a.date),
                                                    date,
                                                ),
                                            );
                                        return (
                                            <TableCell
                                                key={date.toString()}
                                                className="group relative h-12 border-l p-1 text-center"
                                            >
                                                {assignment ? (
                                                    <div
                                                        className="relative flex h-full cursor-pointer flex-col items-center justify-center rounded bg-secondary p-1 text-xs"
                                                        title={`${assignment.shift.name} (${assignment.shift.start_time.slice(0, 5)} - ${assignment.shift.end_time.slice(0, 5)})`}
                                                    >
                                                        <span className="max-w-17.5 truncate font-semibold">
                                                            {
                                                                assignment.shift
                                                                    .name
                                                            }
                                                        </span>
                                                        <button
                                                            className="absolute -top-1 -right-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteAssignment(
                                                                    assignment.id,
                                                                );
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="flex h-full min-h-10 w-full cursor-pointer items-center justify-center rounded text-transparent group-hover:text-muted-foreground hover:bg-muted/50"
                                                        onClick={() =>
                                                            openAssignDialog(
                                                                emp,
                                                                date,
                                                            )
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Assign Dialog */}
                <Dialog
                    open={isAssignOpen}
                    onOpenChange={(open) => {
                        setIsAssignOpen(open);
                        if (!open) reset();
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tentukan Shift</DialogTitle>
                            <DialogDescription>
                                {selectedEmployee?.full_name} -{' '}
                                {selectedDate &&
                                    format(selectedDate, 'dd MMMM yyyy', {
                                        locale: id,
                                    })}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAssign}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="shift_id">
                                        Pilih Shift
                                    </Label>
                                    <Select
                                        value={data.shift_id}
                                        onValueChange={(val) =>
                                            setData('shift_id', val)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih shift..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shifts.map((shift) => (
                                                <SelectItem
                                                    key={shift.id}
                                                    value={String(shift.id)}
                                                >
                                                    {shift.name} (
                                                    {shift.start_time.slice(
                                                        0,
                                                        5,
                                                    )}{' '}
                                                    -{' '}
                                                    {shift.end_time.slice(0, 5)}
                                                    )
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.shift_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.shift_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
