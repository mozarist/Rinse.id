import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import AppLogo from '@/components/app-logo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <AppLogo />
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center gap-1">
                    <h1 className="text-xl font-medium">{title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}
