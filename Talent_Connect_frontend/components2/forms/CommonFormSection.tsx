// ✅ THEME-ADAPTIVE UI COMPONENTS
interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

export const CommonFormSection = ({ title, icon, children }: SectionProps) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 p-5 bg-base-200/50 backdrop-blur-sm rounded-2xl border border-base-300">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">{icon}</div>
            <h3 className="text-xl font-bold text-base-content">{title}</h3>
        </div>
        <div className="space-y-6">{children}</div>
    </div>
);