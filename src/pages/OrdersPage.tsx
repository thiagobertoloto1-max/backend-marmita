// Orders Page - Order history

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { getOrderHistory, Order, ORDER_STATUS_LABELS } from '@/services/orderService';
import { formatCurrency } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const history = await getOrderHistory();
        setOrders(history);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const statusColor: Record<string, string> = {
    pending_payment: 'text-warning',
    payment_confirmed: 'text-success',
    preparing: 'text-primary',
    ready: 'text-success',
    delivering: 'text-primary',
    delivered: 'text-success',
    cancelled: 'text-destructive'
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link
            to="/"
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display font-bold text-lg">Meus Pedidos</h1>
        </div>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground mt-2">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="font-semibold text-lg">Nenhum pedido ainda</h2>
            <p className="text-muted-foreground mt-1">
              Faça seu primeiro pedido e ele aparecerá aqui
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Ver Cardápio</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/confirmation/${order.id}`}
                className="block bg-card rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">#{order.code}</span>
                      <span className={cn('text-sm font-medium', statusColor[order.status])}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {order.items.length > 0 
                      ? `${order.items.length} ${order.items.length === 1 ? 'item' : 'itens'}`
                      : 'Pedido completo'}
                  </p>
                  <p className="font-bold text-primary mt-1">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
