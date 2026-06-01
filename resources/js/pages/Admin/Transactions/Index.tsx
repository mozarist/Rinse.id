import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CirclePlus,
    Ellipsis,
    PenSquare,
    PlusCircle,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import TransactionSheet from '@/components/ui/sheets/TransactionSheet';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from '@/components/ui/table';
import { destroy, index, store, update } from '@/routes/transactions';

interface Transaction {
    id: number;
    invoice_code: string;
    customer_id: number;
    service_id: number;
    quantity: number;
    total_price: number;
    payment_method: string;
    payment_status: string;
    payment_proof: string | null;
    status: string;
    customer: {
        id: number;
        user: {
            id: number;
            name: string;
        };
    };
    service: {
        id: number;
        service_name: string;
        unit: string;
        price: number;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface TransactionFormData {
    customer_id: number | '';
    service_id: number | '';
    quantity: number;
    payment_method: string;
    payment_status: string;
    status: string;
    payment_proof: File | null;
}

const initialFormData: TransactionFormData = {
    customer_id: '',
    service_id: '',
    quantity: 0,
    payment_method: '',
    payment_status: 'pending',
    status: 'antrian',
    payment_proof: null,
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

export default function Index({
    transactions,
    customers,
    services,
}: {
    transactions: {
        data: Transaction[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        links: PaginationLink[];
    };
    customers: any[];
    services: any[];
}) {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'edit' | 'delete' | null>(null);
    const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null);

    const createForm = useForm<TransactionFormData>(initialFormData);
    const editForm = useForm<TransactionFormData>(initialFormData);

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();

        createForm.post(store.url(), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Transaction successfully created.');
                createForm.reset();
                setOpen(false);
            },
            onError: () => {
                toast.error('Failed to create transaction. Please check the form and try again.');
            },
        });
    }

    function openEdit(transaction: Transaction) {
        setEditingTransaction(transaction);
        editForm.setData('customer_id', transaction.customer_id);
        editForm.setData('service_id', transaction.service_id);
        editForm.setData('quantity', transaction.quantity);
        editForm.setData('payment_method', transaction.payment_method);
        editForm.setData('payment_status', transaction.payment_status);
        editForm.setData('status', transaction.status);
        editForm.setData('payment_proof', null);
        setEditOpen(true);
    }

    function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!editingTransaction) {
            return;
        }

        setPendingTransaction(editingTransaction);
        setConfirmAction('edit');
        setConfirmOpen(true);
    }

    function handleDeleteTransaction(transaction: Transaction) {
        router.delete(destroy.url(transaction.id), {
            onSuccess: () => {
                toast.success('Transaction successfully deleted.');
                setConfirmOpen(false);
                setPendingTransaction(null);
                setConfirmAction(null);
            },
            onError: () => {
                toast.error('Failed to delete transaction. Please try again.');
            },
        });
    }

    function handleUpdateTransaction(transaction: Transaction) {
        editForm.put(update.url(transaction.id), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Transaction successfully updated.');
                setConfirmOpen(false);
                setPendingTransaction(null);
                setEditOpen(false);
                setEditingTransaction(null);
                setConfirmAction(null);
            },
            onError: () => {
                toast.error('Failed to update transaction. Please review the form and try again.');
            },
        });
    }

    return (
        <>
            <Head title="Transactions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex w-full items-center justify-between gap-4">
                    <h2 className="text-2xl font-semibold">Transactions</h2>

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
                            idPrefix="create"
                            customers={customers}
                            services={services}
                        />
                    </Sheet>
                </div>

                {/* Transactions table */}
                <div className="w-full">
                    {transactions?.data?.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total Price</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead>Payment Status</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.map((transaction, index) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            {transactions.total - ((transactions.current_page - 1) * transactions.per_page + index)}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.customer?.user?.name ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.service?.service_name ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.quantity} {transaction.service?.unit ?? ''}
                                        </TableCell>
                                        <TableCell>
                                            Rp{' '}
                                            {new Intl.NumberFormat(undefined, {
                                                style: 'decimal',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                            }).format(transaction.total_price)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {transaction.payment_method?.replace('_', ' ') || '-'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={paymentStatusColors[transaction.payment_status] || ''}>
                                                {transaction.payment_status?.charAt(0).toUpperCase() + transaction.payment_status?.slice(1) || '-'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[transaction.status] || ''}>
                                                {transaction.status?.replace(/_/g, ' ').charAt(0).toUpperCase() + transaction.status?.replace(/_/g, ' ').slice(1) || '-'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                    >
                                                        <Ellipsis className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEdit(transaction)
                                                        }
                                                    >
                                                        <PenSquare className="h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setPendingTransaction(
                                                                transaction,
                                                            );
                                                            setConfirmAction(
                                                                'delete',
                                                            );
                                                            setConfirmOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Card className="items-center justify-center gap-2 bg-muted/40 py-12">
                            <PlusCircle className="h-12 w-12 text-muted-foreground/75" />
                            <div>
                                <p className="text-center text-lg font-medium">
                                    There are no transactions yet.
                                </p>
                                <p className="text-center text-sm text-muted-foreground">
                                    Create your first transaction using the Add New
                                    Transaction button.
                                </p>
                            </div>
                        </Card>
                    )}
                </div>

                {transactions.last_page > 1 ? (
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        {transactions.links.map((link, index) => {
                            const isDisabled = link.url === null;

                            return (
                                <Button
                                    key={`${link.label}-${index}`}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    asChild={!isDisabled}
                                    disabled={isDisabled}
                                >
                                    {isDisabled ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <Link href={link.url!} preserveScroll>
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Link>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                ) : null}

                <Sheet open={editOpen} onOpenChange={setEditOpen}>
                    <TransactionSheet
                        form={editForm}
                        onSubmit={handleEditSubmit}
                        title="Edit Transaction"
                        submitLabel="Save"
                        idPrefix="edit"
                        customers={customers}
                        services={services}
                        isEdit
                        paymentProofUrl={editingTransaction?.payment_proof ? `/storage/${editingTransaction.payment_proof}` : null}
                    />
                </Sheet>

                {/* Confirmation dialog for edit/delete */}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {confirmAction === 'delete'
                                    ? 'Delete transaction'
                                    : 'Confirm changes'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmAction === 'delete'
                                    ? 'Are you sure you want to delete this transaction? This action cannot be undone.'
                                    : 'Are you sure you want to save changes to this transaction?'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (
                                        confirmAction === 'delete' &&
                                        pendingTransaction
                                    ) {
                                        handleDeleteTransaction(pendingTransaction);
                                    }

                                    if (
                                        confirmAction === 'edit' &&
                                        pendingTransaction
                                    ) {
                                        handleUpdateTransaction(pendingTransaction);
                                    }
                                }}
                            >
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Transactions',
            href: index(),
        },
    ],
};
