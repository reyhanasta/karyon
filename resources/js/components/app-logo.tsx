export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground transition-transform duration-300 group-hover:scale-110">
                <img
                    src="/favicon.svg"
                    alt="App Logo"
                    className="size-8 drop-shadow-[0_0_8px_rgba(var(--sidebar-primary),0.3)]"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
                <span className="mb-0.5 truncate bg-linear-to-r from-foreground to-foreground/70 bg-clip-text leading-tight font-semibold text-transparent">
                    KaryaOne
                </span>
                <span className="mb-0.5 truncate text-xs leading-tight opacity-70">
                    Manajemen Kepegawaian
                </span>
            </div>
        </>
    );
}
