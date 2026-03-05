import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

type Employee = { id: number; full_name: string };

type OvertimeRequestData = {
    id: number;
    employee_id: number;
    date: string;
    start_time: string;
    end_time: string;
    description: string;
    status: string;
    employee?: Employee;
};

export default function Edit({
    overtimeRequest,
    employees,
}: {
    overtimeRequest: OvertimeRequestData;
    employees: Employee[];
}) {
    const { data, setData, put, processing, errors } = useInertiaForm({
        employee_id: String(overtimeRequest.employee_id),
        date: overtimeRequest.date,
        start_time: overtimeRequest.start_time,
        end_time: overtimeRequest.end_time,
        description: overtimeRequest.description,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/overtime-requests/${overtimeRequest.id}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Overtime Requests', href: '/overtime-requests' },
                {
                    title: 'Edit Request',
                    href: `/overtime-requests/${overtimeRequest.id}/edit`,
                },
            ]}
        >
            <Head title="Edit Overtime Request" />
            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Edit Overtime Request
                    </h2>
                    <p className="text-muted-foreground">
                        Modify the overtime request details below.
                    </p>
                </div>

                <div className="rounded-md border bg-card p-6 text-card-foreground shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employee_id">Employee</Label>
                            <Select
                                value={data.employee_id}
                                onValueChange={(val) =>
                                    setData('employee_id', val)
                                }
                            >
                                <SelectTrigger id="employee_id">
                                    <SelectValue placeholder="Select an employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem
                                            key={emp.id}
                                            value={String(emp.id)}
                                        >
                                            {emp.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employee_id && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.employee_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Overtime Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={data.date}
                                onChange={(e) =>
                                    setData('date', e.target.value)
                                }
                                className="w-full"
                                required
                            />
                            {errors.date && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.date}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) =>
                                        setData('start_time', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.start_time && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.start_time}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) =>
                                        setData('end_time', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.end_time && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.end_time}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description / Tasks Completed
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="min-h-25 w-full"
                                placeholder="Describe the work done during overtime."
                                required
                            />
                            {errors.description && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Link href="/overtime-requests">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
