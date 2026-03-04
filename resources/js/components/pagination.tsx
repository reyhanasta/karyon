import { Link } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
    Pagination as PaginationContainer,
    PaginationContent,
    PaginationItem,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export function Pagination({ links }: PaginationProps) {
    if (!links || links.length <= 3) return null;

    return (
        <PaginationContainer className="mt-4 justify-end">
            <PaginationContent>
                {links.map((link, index) => {
                    const isFirst = index === 0;
                    const isLast = index === links.length - 1;

                    // Parse HTML entities from Laravel's default labels
                    const cleanLabel = link.label
                        .replace(/&laquo;/g, '')
                        .replace(/&raquo;/g, '')
                        .trim();

                    if (isFirst) {
                        return (
                            <PaginationItem key={index}>
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        className={cn(
                                            buttonVariants({
                                                variant: 'ghost',
                                            }),
                                            'cursor-pointer gap-1 px-2.5 sm:pl-2.5',
                                        )}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        <span className="hidden sm:block">
                                            Previous
                                        </span>
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(
                                            buttonVariants({
                                                variant: 'ghost',
                                            }),
                                            'pointer-events-none gap-1 px-2.5 opacity-50 sm:pl-2.5',
                                        )}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        <span className="hidden sm:block">
                                            Previous
                                        </span>
                                    </span>
                                )}
                            </PaginationItem>
                        );
                    }

                    if (isLast) {
                        return (
                            <PaginationItem key={index}>
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        className={cn(
                                            buttonVariants({
                                                variant: 'ghost',
                                            }),
                                            'cursor-pointer gap-1 px-2.5 sm:pr-2.5',
                                        )}
                                    >
                                        <span className="hidden sm:block">
                                            Next
                                        </span>
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(
                                            buttonVariants({
                                                variant: 'ghost',
                                            }),
                                            'pointer-events-none gap-1 px-2.5 opacity-50 sm:pr-2.5',
                                        )}
                                    >
                                        <span className="hidden sm:block">
                                            Next
                                        </span>
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </span>
                                )}
                            </PaginationItem>
                        );
                    }

                    if (cleanLabel === '...') {
                        return (
                            <PaginationItem key={index}>
                                <span className="flex size-9 items-center justify-center">
                                    <MoreHorizontalIcon className="size-4" />
                                    <span className="sr-only">More pages</span>
                                </span>
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={index}>
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    preserveScroll
                                    className={cn(
                                        buttonVariants({
                                            variant: link.active
                                                ? 'outline'
                                                : 'ghost',
                                            size: 'icon',
                                        }),
                                    )}
                                >
                                    {cleanLabel}
                                </Link>
                            ) : (
                                <span
                                    className={cn(
                                        buttonVariants({
                                            variant: link.active
                                                ? 'outline'
                                                : 'ghost',
                                            size: 'icon',
                                        }),
                                        'pointer-events-none',
                                    )}
                                >
                                    {cleanLabel}
                                </span>
                            )}
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </PaginationContainer>
    );
}
