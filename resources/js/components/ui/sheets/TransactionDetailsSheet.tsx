import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionDetailsSheetProps {
    transaction: {
        invoice_code: string;
        created_at: string;
        quantity: number;
        total_price: number;
        payment_method: string;
        payment_status: string;
        payment_proof: string | null;
        status: string;
        customer: {
            user?: {
                name?: string;
            } | null;
            phone?: string | null;
            address?: string | null;
        } | null;
        service: {
            service_name?: string;
            price?: number;
            unit?: string;
        } | null;
        admin: {
            name?: string;
        } | null;
    } | null;
}

function formatCurrency(value: number): string {
    return `Rp ${new Intl.NumberFormat(undefined, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value)}`;
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="text-sm font-medium text-foreground capitalize">{value}</div>
        </div>
    );
}

export function TransactionDetailsSheet({ transaction }: TransactionDetailsSheetProps) {
    return (
        <SheetContent side="right" className="max-w-md overflow-y-auto">
            <SheetHeader>
                <SheetTitle>Transaction Details</SheetTitle>
            </SheetHeader>

            {transaction ? (
                <div className="space-y-4 px-6 pb-6">
                    <Card className="gap-4 py-4">
                        <CardHeader className="px-4">
                            <div>
                                <h3 className="text-base font-semibold">{transaction.invoice_code}</h3>
                                {formatDate(transaction.created_at)}
                            </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="px-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DetailRow label="Quantity" value={transaction.quantity} />
                                <DetailRow label="Total Price" value={formatCurrency(transaction.total_price)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-4 py-4">
                        <CardHeader className="px-4">
                            <CardTitle>Customer Info</CardTitle>
                        </CardHeader>

                        <Separator />

                        <CardContent className="px-4">
                            <div className="grid grid-cols-1 gap-2">
                                <DetailRow label="Customer Name" value={transaction.customer?.user?.name ?? '-'} />
                                <DetailRow label="Phone Number" value={transaction.customer?.phone ?? '-'} />
                                <DetailRow label="Address" value={transaction.customer?.address ?? '-'} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-4 py-4">
                        <CardHeader className="px-4">
                            <CardTitle>Service Info</CardTitle>
                        </CardHeader>

                        <Separator />

                        <CardContent className="px-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DetailRow label="Service Name" value={transaction.service?.service_name ?? '-'} />
                                <DetailRow label={`Service Price/${transaction.service?.unit ?? '-'}`} value={transaction.service?.price !== undefined ? formatCurrency(transaction.service.price) : '-'} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gap-4 py-4">
                        <CardHeader className="px-4">
                            <CardTitle>Payment Info</CardTitle>
                        </CardHeader>

                        <Separator />

                        <CardContent className="px-4 flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DetailRow label="Payment Method" value={transaction.payment_method || '-'} />
                                <DetailRow label="Payment Status" value={transaction.payment_status || '-'} />
                            </div>

                            {transaction.payment_proof && (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Payment Proof</p>
                                    {transaction.payment_proof ? (
                                        <div className="overflow-hidden rounded-2xl border bg-muted">
                                            <img
                                                src={`/storage/${transaction.payment_proof}`}
                                                alt="Payment proof"
                                                className="h-fit w-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No payment proof uploaded</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-4 py-4">
                        <CardHeader className="px-4">
                            <CardTitle>Status Info</CardTitle>
                        </CardHeader>

                        <Separator />

                        <CardContent className="px-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <DetailRow label="Transaction Status" value={transaction.status || '-'} />
                                <DetailRow label="Admin" value={transaction.admin?.name ?? '-'} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="px-6 pb-6 text-sm text-muted-foreground">
                    No transaction selected.
                </div>
            )}
        </SheetContent>
    );
}

export default TransactionDetailsSheet;
