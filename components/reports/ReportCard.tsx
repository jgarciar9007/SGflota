import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ReportCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    className?: string;
    iconColor?: string;
}

export function ReportCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    iconColor = "text-muted-foreground",
}: ReportCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", iconColor)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={cn(
                                "font-medium mr-1",
                                trend.positive ? "text-green-600" : "text-red-600"
                            )}>
                                {trend.value > 0 ? "+" : ""}{trend.value}%
                            </span>
                        )}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
