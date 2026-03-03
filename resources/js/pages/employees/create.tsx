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
import AppLayout from '@/layouts/app-layout';

export default function Create({
    roles,
    positions,
    departments,
}: {
    roles: any[];
    positions: any[];
    departments: any[];
}) {
    const { data, setData, post, processing, errors, reset } = useInertiaForm({
        nip: '',
        full_name: '',
        email: '',
        password: '',
        position_id: '',
        department_id: '',
        join_date: '',
        leave_quota: 12,
        role: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/employees', {
            onSuccess: () => reset('password'),
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Employees', href: '/employees' },
                { title: 'Add Employee', href: '/employees/create' },
            ]}
        >
            <Head title="Add Employee" />
            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Add Employee
                    </h2>
                    <p className="text-muted-foreground">
                        Register a new employee to the clinic.
                    </p>
                </div>

                <div className="rounded-md border bg-card p-6 text-card-foreground shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nip">NIP (Employee ID)</Label>
                                <Input
                                    id="nip"
                                    type="text"
                                    value={data.nip}
                                    onChange={(e) =>
                                        setData('nip', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.nip && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.nip}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) =>
                                        setData('full_name', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.full_name && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.full_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password (Temporary)
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="position_id">Position</Label>
                                <Select
                                    value={data.position_id}
                                    onValueChange={(value) =>
                                        setData('position_id', value)
                                    }
                                    required
                                >
                                    <SelectTrigger
                                        id="position_id"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map((pos) => (
                                            <SelectItem
                                                key={pos.id}
                                                value={pos.id.toString()}
                                            >
                                                {pos.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.position_id && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.position_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department_id">
                                    Department
                                </Label>
                                <Select
                                    value={data.department_id}
                                    onValueChange={(value) =>
                                        setData('department_id', value)
                                    }
                                    required
                                >
                                    <SelectTrigger
                                        id="department_id"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem
                                                key={dept.id}
                                                value={dept.id.toString()}
                                            >
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.department_id && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.department_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="join_date">Join Date</Label>
                                <Input
                                    id="join_date"
                                    type="date"
                                    value={data.join_date}
                                    onChange={(e) =>
                                        setData('join_date', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.join_date && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.join_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">System Role</Label>
                                <Select
                                    onValueChange={(value) =>
                                        setData('role', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role: any) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.name}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.role}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Link href="/employees">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Save Employee
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
