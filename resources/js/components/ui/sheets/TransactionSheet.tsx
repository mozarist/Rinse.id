import * as React from 'react'
import { SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface Props {
	form: any
	onSubmit: (e: React.FormEvent) => void
	title?: string
	submitLabel?: string
	cancelLabel?: string
	idPrefix?: string
	customers?: any[]
	services?: any[]
	isEdit?: boolean
	paymentProofUrl?: string | null
}

export function TransactionSheet({
	form,
	onSubmit,
	title = 'Transaction',
	submitLabel = 'Save',
	cancelLabel = 'Cancel',
	idPrefix = '',
	customers = [],
	services = [],
	isEdit = false,
	paymentProofUrl = null,
}: Props) {
	const prefix = idPrefix ? `${idPrefix}_` : ''
	const selectedService = services.find(s => s.id === form.data.service_id)
	const totalPrice = selectedService ? selectedService.price * (form.data.quantity || 0) : 0
	const shouldShowPaymentProofField = form.data.payment_method === 'transfer' && form.data.payment_status === 'paid'
	const [previewUrl, setPreviewUrl] = React.useState<string | null>(paymentProofUrl)

	React.useEffect(() => {
		if (!shouldShowPaymentProofField) {
			setPreviewUrl(null)
			if (form.data.payment_proof !== null) {
				form.setData('payment_proof', null)
			}
			return
		}

		if (form.data.payment_proof instanceof File) {
			const objectUrl = URL.createObjectURL(form.data.payment_proof)
			setPreviewUrl(objectUrl)

			return () => {
				URL.revokeObjectURL(objectUrl)
			}
		}

		setPreviewUrl(paymentProofUrl)
	}, [form, paymentProofUrl, shouldShowPaymentProofField, form.data.payment_proof])

	function handlePaymentProofChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0] ?? null

		form.setData('payment_proof', file)
		event.target.value = ''
	}

	return (
		<SheetContent side="right" className="max-w-md">
			<SheetHeader>
				<SheetTitle>{title}</SheetTitle>
			</SheetHeader>

			<form onSubmit={onSubmit} encType="multipart/form-data" className="flex h-full w-full flex-col justify-between overflow-hidden">
				<div className="flex-1 overflow-y-auto space-y-4 px-6 scrollbar-none">
					<div className='space-y-2'>
						<Label htmlFor={`${prefix}customer_id`}>Customer</Label>
						<Select value={String(form.data.customer_id || '')} onValueChange={(val) => form.setData('customer_id', parseInt(val))} disabled={form.processing}>
							<SelectTrigger id={`${prefix}customer_id`} className="w-full">
								<SelectValue placeholder="Select customer" />
							</SelectTrigger>
							<SelectContent>
								{customers.map((customer) => (
									<SelectItem key={customer.id} value={String(customer.id)}>
										{customer.user?.name || '-'} {customer.phone ? `(${customer.phone})` : ''}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{form.errors.customer_id && <p className="mt-1 text-sm text-destructive">{form.errors.customer_id}</p>}
					</div>

					<div className='space-y-2'>
						<Label htmlFor={`${prefix}service_id`}>Service</Label>
						<Select value={String(form.data.service_id || '')} onValueChange={(val) => form.setData('service_id', parseInt(val))} disabled={form.processing}>
							<SelectTrigger id={`${prefix}service_id`} className="w-full">
								<SelectValue placeholder="Select service" />
							</SelectTrigger>
							<SelectContent>
								{services.map((service) => (
									<SelectItem key={service.id} value={String(service.id)}>
										{service.service_name} ({service.unit})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{form.errors.service_id && <p className="mt-1 text-sm text-destructive">{form.errors.service_id}</p>}
					</div>

					<div className="grid w-full grid-cols-2 gap-2">
						<div className='space-y-2'>
							<Label htmlFor={`${prefix}quantity`}>Quantity</Label>
							<Input
								id={`${prefix}quantity`}
								placeholder='1'
								type="number"
								step="1"
								min="1"
								value={form.data.quantity}
								onChange={(e) => form.setData('quantity', parseInt(e.target.value) || 0)}
								disabled={form.processing}
							/>
							{form.errors.quantity && <p className="mt-1 text-sm text-destructive">{form.errors.quantity}</p>}
						</div>

						<div className='space-y-2'>
							<Label htmlFor={`${prefix}total_price`}>Total Price</Label>
							<Input
								id={`${prefix}total_price`}
								disabled={true}
								value={`Rp ${new Intl.NumberFormat(undefined, {
									style: 'decimal',
									minimumFractionDigits: 0,
									maximumFractionDigits: 2,
								}).format(totalPrice)}`}
								className="bg-muted"
							/>
						</div>
					</div>

					<div className='space-y-2 pt-4 border-t'>
						<Label htmlFor={`${prefix}payment_method`}>Payment Method</Label>
						<Select value={form.data.payment_method || ''} onValueChange={(val) => form.setData('payment_method', val)} disabled={form.processing}>
							<SelectTrigger id={`${prefix}payment_method`} className="w-full">
								<SelectValue placeholder="Select payment method" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="cash">Cash</SelectItem>
								<SelectItem value="transfer">Transfer</SelectItem>
							</SelectContent>
						</Select>
						{form.errors.payment_method && <p className="mt-1 text-sm text-destructive">{form.errors.payment_method}</p>}
					</div>

					<div className='space-y-2'>
						<Label htmlFor={`${prefix}payment_status`}>Payment Status</Label>
						<Select value={form.data.payment_status || ''} onValueChange={(val) => form.setData('payment_status', val)} disabled={form.processing}>
							<SelectTrigger id={`${prefix}payment_status`} className="w-full">
								<SelectValue placeholder="Select payment status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="paid">Paid</SelectItem>
							</SelectContent>
						</Select>
						{form.errors.payment_status && <p className="mt-1 text-sm text-destructive">{form.errors.payment_status}</p>}
					</div>

					{shouldShowPaymentProofField && (
						<div className="space-y-2">
							<Label htmlFor={`${prefix}payment_proof`}>Payment Proof</Label>
							<Input
								id={`${prefix}payment_proof`}
								name="payment_proof"
								type="file"
								accept="image/jpeg,image/png"
								onChange={handlePaymentProofChange}
								disabled={form.processing}
							/>
							{form.errors.payment_proof && <p className="mt-1 text-sm text-destructive">{form.errors.payment_proof}</p>}

							{previewUrl && (
								<div className="overflow-hidden rounded-2xl border">
									<img
										src={previewUrl}
										alt="Payment proof preview"
										className="h-fit w-full object-cover"
									/>
								</div>
							)}
						</div>
					)}

					{isEdit && (
						<div className='space-y-2'>
							<Label htmlFor={`${prefix}status`}>Status</Label>
							<Select value={form.data.status || ''} onValueChange={(val) => form.setData('status', val)} disabled={form.processing}>
								<SelectTrigger id={`${prefix}status`} className="w-full">
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="antrian">Antrian</SelectItem>
									<SelectItem value="dicuci">Dicuci</SelectItem>
									<SelectItem value="disetrika">Disetrika</SelectItem>
									<SelectItem value="siap_diambil">Siap Diambil</SelectItem>
									<SelectItem value="diambil">Diambil</SelectItem>
								</SelectContent>
							</Select>
							{form.errors.status && <p className="mt-1 text-sm text-destructive">{form.errors.status}</p>}
						</div>
					)}
				</div>

				<SheetFooter>
					<Button type="submit" className="w-full" disabled={form.processing}>
						{form.processing ? `${submitLabel}...` : submitLabel}
					</Button>

					<SheetClose asChild>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={() => form.reset()}
							disabled={form.processing}
						>
							{form.processing ? `${cancelLabel}...` : cancelLabel}
						</Button>
					</SheetClose>
				</SheetFooter>
			</form>
		</SheetContent>
	);
}

export default TransactionSheet
