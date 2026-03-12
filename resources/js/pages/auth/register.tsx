import { Head, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
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
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';

type Option = { id: number; name: string };

type Props = {
    departments: Option[];
    positions: Option[];
};

export default function Register({ departments, positions }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        email: '',
        department_id: '',
        position_id: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Daftar Akun Baru"
            description="Isi data diri Anda untuk mendaftar sebagai karyawan"
        >
            <Head title="Daftar" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-5">
                    {/* Nama Lengkap */}
                    <div className="grid gap-2">
                        <Label htmlFor="full_name" required>
                            Nama Lengkap
                        </Label>
                        <Input
                            id="full_name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.full_name}
                            onChange={(e) =>
                                setData('full_name', e.target.value)
                            }
                            placeholder="Masukkan nama lengkap"
                        />
                        <InputError message={errors.full_name} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email" required>
                            Alamat Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@contoh.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Departemen & Posisi */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="department_id" required>
                                Departemen
                            </Label>
                            <Select
                                value={data.department_id}
                                onValueChange={(val) =>
                                    setData('department_id', val)
                                }
                            >
                                <SelectTrigger id="department_id" tabIndex={3}>
                                    <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem
                                            key={dept.id}
                                            value={String(dept.id)}
                                        >
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.department_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="position_id" required>
                                Jabatan
                            </Label>
                            <Select
                                value={data.position_id}
                                onValueChange={(val) =>
                                    setData('position_id', val)
                                }
                            >
                                <SelectTrigger id="position_id" tabIndex={4}>
                                    <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((pos) => (
                                        <SelectItem
                                            key={pos.id}
                                            value={String(pos.id)}
                                        >
                                            {pos.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.position_id} />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password" required>
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={5}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder="Minimal 8 karakter"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" required>
                            Konfirmasi Password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={6}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            placeholder="Ulangi password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        tabIndex={7}
                        disabled={processing}
                        data-test="register-user-button"
                    >
                        {processing && <Spinner />}
                        Daftar
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Sudah punya akun?{' '}
                    <TextLink href={login()} tabIndex={8}>
                        Masuk
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
