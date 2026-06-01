import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { store } from '@/routes/transactions';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { CirclePlus } from 'lucide-react';
import { toast } from 'sonner';
import TransactionSheet from '@/components/ui/sheets/TransactionSheet';

type Transaction = {
    id: number;
    invoice_code: string;
    quantity: number;
    total_price: number;
    payment_method: string | null;
    payment_status: string;
    status: string;
    created_at: string | null;
    customer: {
        id: number | null;
        user: {
            id: number | null;
            name: string | null;
        };
    };
    service: {
        id: number | null;
        service_name: string | null;
        unit: string | null;
    };
};

type RevenueCategory = {
    key: string;
    label: string;
};

type RevenueChartPoint = {
    date: string;
    [key: string]: string | number;
};

type RevenueChart = {
    categories: RevenueCategory[];
    data: RevenueChartPoint[];
};

type CustomerOption = {
    id: number;
    user: {
        id: number;
        name: string | null;
    };
};

type ServiceOption = {
    id: number;
    service_name: string | null;
    price: number;
    unit: string | null;
};

type TransactionFormData = {
    customer_id: number | '';
    service_id: number | '';
    quantity: number;
    payment_method: string;
    payment_status: string;
};

type DashboardProps = {
    summary: {
        totalTransactions: number;
        totalRevenue: number;
        pendingPayments: number;
        activeCustomers: number;
    };
    recentTransactions: Transaction[];
    revenueChart: RevenueChart;
    customers: CustomerOption[];
    services: ServiceOption[];
};

const statusColors: { [key: string]: string } = {
    antrian: 'bg-yellow-100 text-yellow-800',
    dicuci: 'bg-blue-100 text-blue-800',
    disetrika: 'bg-purple-100 text-purple-800',
    siap_diambil: 'bg-green-100 text-green-800',
    diambil: 'bg-gray-100 text-gray-800',
};

const paymentStatusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
};

const revenuePalette = [
    'hsl(197 92% 55%)',
    'hsl(142 71% 45%)',
    'hsl(262 83% 58%)',
    'hsl(35 92% 54%)',
    'hsl(0 84% 60%)',
    'hsl(188 94% 43%)',
] as const;

const revenueRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '1m', label: 'Last Month' },
    { value: '3m', label: 'Last 3 Months' },
    { value: 'all', label: 'All Time' },
] as const;

type RevenueRange = (typeof revenueRangeOptions)[number]['value'];

const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

function formatCurrency(amount: number): string {
    return `Rp ${currencyFormatter.format(amount)}`;
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatStatus(value: string | null): string {
    if (!value) {
        return '-';
    }

    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateKey(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getGreetingByTime(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    }

    if (hour < 17) {
        return 'Good afternoon';
    }

    if (hour < 21) {
        return 'Good evening';
    }

    return 'Good night';
}

function getRangeStart(range: RevenueRange): string | null {
    if (range === 'all') {
        return null;
    }

    const daysBack = {
        '7d': 6,
        '1m': 29,
        '3m': 89,
    }[range];

    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysBack);

    return formatDateKey(date);
}

function formatChartDate(dateKey: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
    }).format(new Date(`${dateKey}T00:00:00`));
}

function formatChartTick(dateKey: string): string {
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
    }).format(new Date(`${dateKey}T00:00:00`));
}

function formatCompactAmount(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `Rp ${(amount / 1_000_000_000).toFixed(1)}B`;
    }

    if (amount >= 1_000_000) {
        return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
    }

    if (amount >= 1_000) {
        return `Rp ${(amount / 1_000).toFixed(0)}K`;
    }

    return formatCurrency(amount);
}

function createRevenueChartConfig(categories: RevenueCategory[]): ChartConfig {
    return categories.reduce<ChartConfig>((config, category, index) => {
        config[category.key] = {
            label: category.label,
            color: revenuePalette[index % revenuePalette.length],
        };

        return config;
    }, {});
}

function getVisibleRevenueData(
    data: RevenueChartPoint[],
    range: RevenueRange,
): RevenueChartPoint[] {
    const startDateKey = getRangeStart(range);

    if (!startDateKey) {
        return data;
    }

    return data.filter((point) => point.date >= startDateKey);
}

function getGreetingText(): string {
    return `${getGreetingByTime()}!`;
}

function SummaryCard({
    label,
    value,
    description,
}: {
    label: string;
    value: string;
    description: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums">
                    {value}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

function TransactionTable({
    title,
    description,
    emptyState,
    transactions,
    customers,
    services,
}: {
    title: string;
    description: string;
    emptyState: string;
    transactions: Transaction[];
    customers: CustomerOption[];
    services: ServiceOption[];
}) {
    const [open, setOpen] = React.useState(false);
    const createForm = useForm<TransactionFormData>({
        customer_id: '',
        service_id: '',
        quantity: 0,
        payment_method: '',
        payment_status: 'pending',
    });

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();

        createForm.post(store.url(), {
            onSuccess: () => {
                toast.success('Transaction successfully created.');
                createForm.reset();
                setOpen(false);
            },
            onError: () => {
                toast.error(
                    'Failed to create transaction. Please check the form and try again.',
                );
            },
        });
    }

    return (
        <Card className="h-fit overflow-hidden pb-0">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <CirclePlus className="h-4 w-4" />
                            Add New Transaction
                        </Button>
                    </SheetTrigger>

                    <TransactionSheet
                        form={createForm}
                        onSubmit={handleCreateSubmit}
                        title="Add New Transaction"
                        submitLabel="Create"
                        idPrefix="dashboard-create"
                        customers={customers}
                        services={services}
                    />
                </Sheet>
            </CardHeader>
            <CardContent className="p-0">
                {transactions.length > 0 ? (
                    <Table className="rounded-none">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {transaction.customer.user.name ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.service.service_name ??
                                            '-'}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.quantity}{' '}
                                        {transaction.service.unit ?? ''}
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(
                                            transaction.total_price,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                paymentStatusColors[
                                                transaction.payment_status
                                                ] || ''
                                            }
                                        >
                                            {formatStatus(
                                                transaction.payment_status,
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                statusColors[
                                                transaction.status
                                                ] || ''
                                            }
                                        >
                                            {formatStatus(transaction.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {formatDateTime(transaction.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center px-6 py-10 text-sm text-muted-foreground">
                        {emptyState}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function RevenueChartCard({ revenueChart }: { revenueChart: RevenueChart }) {
    const [range, setRange] = React.useState<RevenueRange>('7d');

    const chartConfig = React.useMemo(
        () => createRevenueChartConfig(revenueChart.categories),
        [revenueChart.categories],
    );

    const visibleData = React.useMemo(
        () => getVisibleRevenueData(revenueChart.data, range),
        [range, revenueChart.data],
    );

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                    <CardTitle>Laundry Revenue</CardTitle>
                    <CardDescription>
                        Track your laundry revenue over time.
                    </CardDescription>
                </div>

                <Select
                    value={range}
                    onValueChange={(value) => setRange(value as RevenueRange)}
                >
                    <SelectTrigger className="w-44" size="sm">
                        <SelectValue placeholder="Filter revenue" />
                    </SelectTrigger>
                    <SelectContent>
                        {revenueRangeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent>
                {visibleData.length > 0 ? (
                    <ChartContainer
                        config={chartConfig}
                        className="h-90 w-full"
                    >
                        <AreaChart
                            data={visibleData}
                            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={24}
                                tickFormatter={formatChartTick}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={70}
                                tickFormatter={(value) =>
                                    formatCompactAmount(Number(value))
                                }
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        hideIndicator
                                        labelFormatter={(label, payload) => {
                                            const totalRevenue = Number(
                                                payload?.[0]?.payload
                                                    ?.totalRevenue ?? 0,
                                            );

                                            return (
                                                <div className="grid gap-1.5">
                                                    <div className="font-medium">
                                                        {formatChartDate(
                                                            String(label),
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                                        <span>Total revenue</span>
                                                        <span className="font-mono font-medium text-foreground">
                                                            {formatCurrency(
                                                                totalRevenue,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                        formatter={(value, name, item) => {
                                            const seriesKey = String(
                                                item.dataKey ?? name,
                                            );
                                            const transactionCount = Number(
                                                item.payload?.[
                                                `${seriesKey}Transactions`
                                                ] ?? 0,
                                            );

                                            return (
                                                <div className="flex w-full items-center justify-between gap-3">
                                                    <span className="inline-flex items-center gap-2 font-medium text-foreground">
                                                        <span
                                                            className="h-2.5 w-2.5 rounded-xs"
                                                            style={{
                                                                backgroundColor:
                                                                    item.color ??
                                                                    'currentColor',
                                                            }}
                                                        />
                                                        {chartConfig[seriesKey]
                                                            ?.label ?? name}
                                                    </span>
                                                    <span className="font-mono text-muted-foreground">
                                                        {formatCurrency(
                                                            Number(value ?? 0),
                                                        )}{' '}
                                                        ({transactionCount}
                                                        pcs)
                                                    </span>
                                                </div>
                                            );
                                        }}
                                    />
                                }
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            {revenueChart.categories.map((category) => (
                                <Area
                                    key={category.key}
                                    dataKey={category.key}
                                    type="monotone"
                                    stackId="revenue"
                                    stroke={`var(--color-${category.key})`}
                                    fill={`var(--color-${category.key})`}
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                            ))}
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="flex h-90 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
                        No paid laundry revenue has been recorded yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    summary,
    recentTransactions,
    revenueChart,
    customers,
    services,
}: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h4 className="text-xl font-medium">{getGreetingText()}</h4>
                    <p className="text-sm text-muted-foreground">
                        Here's an overview of your laundry business performance.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Total Transactions"
                        value={summary.totalTransactions.toLocaleString()}
                        description="All recorded laundry transactions"
                    />
                    <SummaryCard
                        label="Total Revenue"
                        value={formatCurrency(summary.totalRevenue)}
                        description="Revenue from paid transactions only"
                    />
                    <SummaryCard
                        label="Pending Payments"
                        value={summary.pendingPayments.toLocaleString()}
                        description="Laundries waiting for payment"
                    />
                    <SummaryCard
                        label="Active Customers"
                        value={summary.activeCustomers.toLocaleString()}
                        description="Total of active CleanLab Customers"
                    />
                </div>
                <RevenueChartCard revenueChart={revenueChart} />

                <TransactionTable
                    title="Recent Transactions"
                    description="5 latest transactions in the system."
                    emptyState="There are no recent transactions yet."
                    transactions={recentTransactions}
                    customers={customers}
                    services={services}
                />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
