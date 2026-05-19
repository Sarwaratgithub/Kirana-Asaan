import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { useCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { useTransactions, useCreateTransaction } from "@/hooks/use-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, ArrowLeft, Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Schema for transaction form
const transactionFormSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  description: z.string().optional(),
});

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  
  const { data: customer, isLoading: customerLoading } = useCustomer(customerId);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(customerId);
  
  const createTransaction = useCreateTransaction();
  const deleteCustomer = useDeleteCustomer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'give' | 'receive'>('give');

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  if (customerLoading) return null; // Or loading skeleton
  if (!customer) return <div>Customer not found</div>;

  const handleTransaction = (values: z.infer<typeof transactionFormSchema>) => {
    createTransaction.mutate({
      customerId,
      amount: String(values.amount),
      type: transactionType,
      description: values.description
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        form.reset();
      }
    });
  };

  const openTransactionDialog = (type: 'give' | 'receive') => {
    setTransactionType(type);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    deleteCustomer.mutate(customerId, {
      onSuccess: () => setLocation('/customers')
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="font-heading font-bold text-xl flex-1 text-slate-900 dark:text-white">{customer.name}</h2>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {customer.name} and all their transaction history. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Balance Card */}
        <Card className="bg-white dark:bg-slate-900 border-none shadow-lg card-3d">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-widest">Net Balance</p>
            <h1 className={`text-4xl font-black mb-4 ${Number(customer.totalBalance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Rs.{Number(customer.totalBalance).toLocaleString()}
            </h1>
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="inline-flex items-center justify-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors font-bold">
                <Phone className="h-4 w-4" />
                Call {customer.phone}
              </a>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 sticky top-20 z-10 bg-gray-50/95 dark:bg-slate-950/95 p-2 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <Button 
            onClick={() => openTransactionDialog('give')}
            className="h-14 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 dark:shadow-none btn-3d rounded-xl font-bold"
          >
            <ArrowUpRight className="mr-2 h-5 w-5" />
            Give
          </Button>
          
          <Button 
            onClick={() => openTransactionDialog('receive')}
            className="h-14 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 dark:shadow-none btn-3d rounded-xl font-bold"
          >
            <ArrowDownLeft className="mr-2 h-5 w-5" />
            Got
          </Button>
        </div>

        {/* Transaction History */}
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-lg px-2">Transaction History</h3>
          
          <div className="space-y-3 pb-20">
            {transactionsLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : transactions?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-medium uppercase tracking-tight">
                No transactions yet.
              </div>
            ) : (
              transactions?.map((tx) => (
                <div key={tx.id} className="card-3d bg-white dark:bg-slate-900 p-4 border-none shadow-sm flex items-center justify-between group overflow-hidden relative">
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${tx.type === 'give' ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${tx.type === 'give' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {tx.type === 'give' ? 'GAVE' : 'RECEIVED'}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {tx.date ? format(new Date(tx.date), "dd MMM, h:mm a") : "N/A"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {tx.description || (tx.type === 'give' ? 'Items purchased' : 'Payment received')}
                    </p>
                  </div>
                  <span className={`font-black text-lg ${tx.type === 'give' ? 'text-red-600' : 'text-green-600'}`}>
                    Rs.{Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transaction Drawer */}
        <ResponsiveModal
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={transactionType === 'give' ? 'Udhar Diya (Give Credit)' : 'Wapas Mila (Receive Payment)'}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleTransaction)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (Rs.)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="text-2xl h-14 font-bold"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={transactionType === 'give' ? "Items: Rice, Sugar..." : "Payment via Cash/UPI"}
                        className="h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className={`w-full h-12 text-lg mt-4 font-bold ${transactionType === 'give' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={createTransaction.isPending}
              >
                {createTransaction.isPending ? "Recording..." : `Confirm ${transactionType === 'give' ? 'Udhar' : 'Payment'}`}
              </Button>
            </form>
          </Form>
        </ResponsiveModal>
      </div>
    </Layout>
  );
}
