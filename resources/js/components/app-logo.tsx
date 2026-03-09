export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <img src="/favicon.svg" alt="App Logo" className="size-6" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Karyon
                </span>
                <span className="mb-0.5 truncate text-xs leading-tight">
                    Manajemen Kepegawaian
                </span>
            </div>
        </>
    );
}
