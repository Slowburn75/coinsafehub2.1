import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500", className)}>
            <div className="h-24 w-24 rounded-[2rem] glass-card flex items-center justify-center mb-6 relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon className="h-10 w-10 text-primary opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed mb-8">
                {description}
            </p>
            {action && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both">
                    {action}
                </div>
            )}
        </div>
    );
}
