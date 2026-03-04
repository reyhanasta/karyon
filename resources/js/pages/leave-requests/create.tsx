import { Head, Link, useForm as useInertiaForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import type { FormEventHandler } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

export default function Create({
    leaveQuota,
    monthlyLimit,
    monthlyRemaining,
}: {
    leaveQuota: number;
    monthlyLimit: number;
    monthlyUsage: Record<string, number>;
    currentMonth: string;
    monthlyRemaining: number;
}) {
    const { data, setData, post, processing, errors } = useInertiaForm({
        start_date: '',
        end_date: '',
        reason: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/leave-requests');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Leave Requests', href: '/leave-requests' },
                { title: 'Request Leave', href: '/leave-requests/create' },
            ]}
        >
            <Head title="Request Leave" />
            <div className="mx-auto flex h-full w-full max-w-2xl flex-1 flex-col gap-4 p-4 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Request Leave
                    </h2>
                    <p className="text-muted-foreground">
                        Submit a new leave request.
                    </p>
                </div>

                {/* Quota Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            Annual Remaining
                        </p>
                        <p className="text-2xl font-bold">
                            {leaveQuota}{' '}
                            <span className="text-sm font-normal text-muted-foreground">
                                days
                            </span>
                        </p>
                    </div>
                    <div className="rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                        <p className="text-sm text-muted-foreground">
                            This Month Remaining
                        </p>
                        <p className="text-2xl font-bold">
                            {monthlyRemaining}{' '}
                            <span className="text-sm font-normal text-muted-foreground">
                                / {monthlyLimit} days
                            </span>
                        </p>
                    </div>
                </div>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Maximum {monthlyLimit} days of leave per calendar month.
                        Annual total: 12 days.
                    </AlertDescription>
                </Alert>

                <div className="rounded-md border bg-card p-6 text-card-foreground shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData('start_date', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.start_date && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.start_date}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData('end_date', e.target.value)
                                    }
                                    className="w-full"
                                    required
                                />
                                {errors.end_date && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.end_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Leave</Label>
                            <Textarea
                                id="reason"
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                className="min-h-25 w-full"
                                placeholder="Please provide a valid reason."
                                required
                            />
                            {errors.reason && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.reason}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Link href="/leave-requests">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={
                                    processing ||
                                    leaveQuota <= 0 ||
                                    monthlyRemaining <= 0
                                }
                            >
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
