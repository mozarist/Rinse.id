import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';

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
            <div className="text-sm font-medium text-foreground">{value}</div>
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
                    <Card className="space-y-4 p-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Transaction Info</p>
                            <h3 className="text-base font-semibold">{transaction.invoice_code}</h3>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailRow label="Invoice Code" value={transaction.invoice_code} />
                            <DetailRow label="Created At" value={formatDate(transaction.created_at)} />
                            <DetailRow label="Quantity" value={transaction.quantity} />
                            <DetailRow label="Total Price" value={formatCurrency(transaction.total_price)} />
                        </div>
                    </Card>

                    <Card className="space-y-4 p-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Customer Info</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4">
                            <DetailRow label="Customer Name" value={transaction.customer?.user?.name ?? '-'} />
                            <DetailRow label="Phone Number" value={transaction.customer?.phone ?? '-'} />
                            <DetailRow label="Address" value={transaction.customer?.address ?? '-'} />
                        </div>
                    </Card>

                    <Card className="space-y-4 p-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Service Info</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailRow label="Service Name" value={transaction.service?.service_name ?? '-'} />
                            <DetailRow label="Service Price" value={transaction.service?.price !== undefined ? formatCurrency(transaction.service.price) : '-'} />
                            <DetailRow label="Service Unit" value={transaction.service?.unit ?? '-'} />
                        </div>
                    </Card>

                    <Card className="space-y-4 p-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Payment Info</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailRow label="Payment Method" value={transaction.payment_method || '-'} />
                            <DetailRow label="Payment Status" value={transaction.payment_status || '-'} />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Payment Proof</p>
                            {transaction.payment_proof ? (
                                <div className="overflow-hidden rounded-2xl border bg-muted">
                                    <img
                                        src={`/storage/${transaction.payment_proof}`}
                                        alt="Payment proof"
                                        className="h-auto w-full object-contain"
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payment proof uploaded</p>
                            )}
                        </div>
                    </Card>

                    <Card className="space-y-4 p-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Status Info</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailRow label="Transaction Status" value={transaction.status || '-'} />
                            <DetailRow label="Admin" value={transaction.admin?.name ?? '-'} />
                        </div>
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
