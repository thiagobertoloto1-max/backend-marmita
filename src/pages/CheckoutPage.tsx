// Checkout Page - Multi-step checkout flow

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, User, MapPin, Truck, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { createOrder, CustomerData, DeliveryAddress } from '@/services/orderService';

// ✅ TROCA AQUI: remove createPixCharge, usa criarPagamentoPix
import { formatCurrency, criarPagamentoPix } from '@/services/paymentService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type CheckoutStep = 'customer' | 'address' | 'delivery' | 'payment';

const steps: { id: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { id: 'customer', label: 'Dados', icon: User },
  { id: 'address', label: 'Endereço', icon: MapPin },
  { id: 'delivery', label: 'Entrega', icon: Truck },
  { id: 'payment', label: 'Pagamento', icon: CreditCard }
];

// Phone mask
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// CEP mask
const formatCEP = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

const onlyDigits = (s: string) => String(s || '').replace(/\D/g, '');

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    email: '',
    phone: ''
  });

  const [address, setAddress] = useState<DeliveryAddress>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zipCode: ''
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <span className="text-6xl mb-4">🛒</span>
        <h1 className="font-display font-bold text-xl">Carrinho vazio</h1>
        <p className="text-muted-foreground mt-1 text-center">
          Adicione produtos ao carrinho para continuar
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Ver Cardápio</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'customer') {
      if (!customer.name.trim()) newErrors.name = 'Nome é obrigatório';
      if (!customer.email.trim()) newErrors.email = 'E-mail é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
        newErrors.email = 'E-mail inválido';
      }
      if (!customer.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
      else if (onlyDigits(customer.phone).length < 10) {
        newErrors.phone = 'Telefone inválido';
      }
    }

    if (currentStep === 'address' && deliveryMethod === 'delivery') {
      if (!address.street.trim()) newErrors.street = 'Rua é obrigatória';
      if (!address.number.trim()) newErrors.number = 'Número é obrigatório';
      if (!address.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
      if (!address.city.trim()) newErrors.city = 'Cidade é obrigatória';
      if (!address.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';
      else if (onlyDigits(address.zipCode).length !== 8) {
        newErrors.zipCode = 'CEP inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    let prevIndex = currentStepIndex - 1;
    // Skip 'delivery' step since it's combined with 'address'
    if (prevIndex >= 0 && steps[prevIndex].id === 'delivery') {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async () => {
  if (!validateStep()) return;

  setIsSubmitting(true);

  try {
    // CPF obrigatório para PIX
    // @ts-ignore
    const cpfRaw = customer.cpf || "";
    const cpfDigits = cpfRaw.replace(/\D/g, "");

    if (paymentMethod === "pix" && cpfDigits.length !== 11) {
      alert("CPF é obrigatório (11 dígitos) para pagamento via PIX");
      return;
    }

    // Total (mantém sua lógica)
    const finalTotal =
      deliveryMethod === "pickup"
        ? cart.subtotal - cart.discount
        : cart.total;

    // Cria order no sistema antigo (mantemos por compatibilidade)
    const order = await createOrder(
      { ...cart, total: finalTotal, deliveryFee: deliveryMethod === "pickup" ? 0 : cart.deliveryFee },
      customer,
      deliveryMethod === "delivery" ? address : undefined,
      deliveryMethod,
      paymentMethod
    );

    // PIX: chama backend novo
    if (paymentMethod === "pix") {
      const phoneDigits = customer.phone.replace(/\D/g, "");
      const telefone = phoneDigits.startsWith("55") ? `+${phoneDigits}` : `+55${phoneDigits}`;

      // SKU com tamanho (seu backend espera isso)
      const items = cart.items.map((item) => ({
        sku: `${item.product.id}:${item.size.id}`,
        qty: item.quantity,
      }));

      const pix = await criarPagamentoPix({
        nome: customer.name,
        telefone,
        cpf: cpfDigits,
        items,
      });

      // ✅ meta para tracking (local + backend)
      try {
        const orderMeta = {
          restaurantName: "Divino Sabor Marmitas",
          paymentMethod: "PIX",
          customerName: customer.name,
          customerPhone: telefone,
          address: address && (address.street || address.number || address.neighborhood || address.city || address.zipCode)
            ? {
                street: address.street || "",
                number: address.number || "",
                complement: address.complement || "",
                neighborhood: address.neighborhood || "",
                city: address.city || "",
                state: address.state || "SP",
                zipCode: address.zipCode || "",
              }
            : null,
          items: cart.items.map((it) => ({
            name: it.product.name,
            size: it.size?.name,
            qty: it.quantity,
            price: it.totalPrice,
          })),
          totalReais:
            pix.total_reais ??
            (pix.total_cents ? (pix.total_cents / 100).toFixed(2) : undefined),
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(`order_meta_${pix.pedido_id}`, JSON.stringify(orderMeta));

        fetch(`https://signs-section-television-accounting.trycloudflare.com/pedido/${pix.pedido_id}/meta`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderMeta),
        }).catch(() => {});
      } catch {
        // não quebra o fluxo
      }

      clearCart();

      navigate(`/confirmation/${pix.pedido_id}`, {
        state: {
          pix: pix.pix,
          pedido_id: pix.pedido_id,
          transacao_id: pix.transacao_id,
          total_reais: pix.total_reais,
          customerName: customer.name,
        },
      });

      return; // <-- importantíssimo para não cair no fluxo antigo
    }

    // Para outros métodos (não usados agora), mantém o fluxo antigo
    clearCart();
    navigate(`/confirmation/${order.id}`);
  } catch (error: any) {
    console.error("Error creating order:", error);
    toast({
      title: "Erro ao criar pedido",
      description: "Tente novamente em alguns instantes",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const renderStepContent = () => {
    switch (currentStep) {
      case 'customer':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Seu nome"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                placeholder="seu@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">WhatsApp / Telefone *</Label>
              <Input
                id="phone"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: formatPhone(e.target.value) })}
                placeholder="(11) 99999-9999"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4">
            {/* Delivery Method Selection */}
            <RadioGroup
              value={deliveryMethod}
              onValueChange={(v) => setDeliveryMethod(v as 'delivery' | 'pickup')}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="delivery"
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  deliveryMethod === 'delivery' ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <RadioGroupItem value="delivery" id="delivery" />
                <div>
                  <p className="font-medium">Entrega</p>
                  <p className="text-sm text-muted-foreground">30-45 min</p>
                </div>
              </Label>
              <div
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-muted/50 opacity-60 cursor-not-allowed"
              >
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40" />
                <div>
                  <p className="font-medium text-muted-foreground">Retirada</p>
                  <p className="text-sm text-muted-foreground">Em breve!</p>
                </div>
              </div>
            </RadioGroup>

            {deliveryMethod === 'delivery' && (
              <>
                <div>
                  <Label htmlFor="zipCode">CEP *</Label>
                  <div className="relative">
                    <Input
                      id="zipCode"
                      value={address.zipCode}
                      onChange={async (e) => {
                        const formattedCep = formatCEP(e.target.value);
                        setAddress({ ...address, zipCode: formattedCep });
                        setCepError('');

                        const cleanCep = onlyDigits(formattedCep);
                        if (cleanCep.length === 8) {
                          setIsLoadingCep(true);
                          try {
                            const response = await fetch(
                              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cep-lookup?cep=${cleanCep}`
                            );
                            const data = await response.json();

                            if (data.error) {
                              setCepError(data.error);
                            } else if (data) {
                              setAddress(prev => ({
                                ...prev,
                                street: data.street || '',
                                neighborhood: data.neighborhood || '',
                                city: data.city || '',
                                state: data.state || 'SP'
                              }));
                            }
                          } catch (err) {
                            console.error('Error fetching CEP:', err);
                            setCepError('Erro ao buscar CEP');
                          } finally {
                            setIsLoadingCep(false);
                          }
                        }
                      }}
                      placeholder="00000-000"
                      className={cn(errors.zipCode || cepError ? 'border-destructive' : '', 'pr-10')}
                    />
                    {isLoadingCep && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {(errors.zipCode || cepError) && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.zipCode || cepError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="Nome da rua"
                      className={cn(errors.street ? 'border-destructive' : '', address.street && 'bg-muted/50')}
                      readOnly={!!address.street && isLoadingCep === false && onlyDigits(address.zipCode).length === 8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Nº *</Label>
                    <Input
                      id="number"
                      value={address.number}
                      onChange={(e) => setAddress({ ...address, number: e.target.value })}
                      placeholder="123"
                      className={errors.number ? 'border-destructive' : ''}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={address.complement}
                    onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                    placeholder="Apto, bloco, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={address.neighborhood}
                      onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                      placeholder="Bairro"
                      className={cn(errors.neighborhood ? 'border-destructive' : '', address.neighborhood && 'bg-muted/50')}
                      readOnly={!!address.neighborhood && isLoadingCep === false && onlyDigits(address.zipCode).length === 8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Cidade"
                      className={cn(errors.city ? 'border-destructive' : '', address.city && 'bg-muted/50')}
                      readOnly={!!address.city && isLoadingCep === false && onlyDigits(address.zipCode).length === 8}
                    />
                  </div>
                </div>
              </>
            )}

            {deliveryMethod === 'pickup' && (
              <div className="p-4 bg-muted rounded-xl">
                <h3 className="font-semibold">Endereço para retirada:</h3>
                <p className="text-muted-foreground mt-1">
                  Rua das Marmitas, 123 - Centro<br />
                  São Paulo - SP
                </p>
                <p className="text-sm text-primary mt-2">
                  Horário: 11h às 15h e 18h às 22h
                </p>
              </div>
            )}
          </div>
        );

      case 'delivery':
        setCurrentStep('payment');
        return null;

      case 'payment':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as 'pix' | 'card' | 'cash')}
              className="space-y-3"
            >
              <Label
                htmlFor="pix"
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <RadioGroupItem value="pix" id="pix" />
                <div className="flex-1">
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                </div>
                <span className="text-2xl">📱</span>
              </Label>

              {paymentMethod === 'pix' && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-medium">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    // @ts-ignore
                    value={customer.cpf || ''}
                    onChange={(e) =>
                      // @ts-ignore
                      setCustomer(prev => ({
                        ...prev,
                        cpf: e.target.value.replace(/\D/g, ''),
                      }))
                    }
                    placeholder="Somente números"
                  />
                  <p className="text-xs text-muted-foreground">
                    CPF necessário para gerar o pagamento PIX, conforme exigência do banco.
                  </p>
                </div>
              )}

              {/* Disabled Card Option */}
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-muted/50 opacity-60 cursor-not-allowed">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40" />
                <div className="flex-1">
                  <p className="font-medium text-muted-foreground">Cartão de Crédito/Débito Online</p>
                  <p className="text-sm text-muted-foreground">Mastercard, Visa, Elo, Amex (Em breve!)</p>
                </div>
                <span className="text-2xl opacity-50">💳</span>
              </div>

              {/* Disabled Payment on Delivery Option */}
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-muted/50 opacity-60 cursor-not-allowed">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40" />
                <div className="flex-1">
                  <p className="font-medium text-muted-foreground">Pagamento na entrega</p>
                  <p className="text-sm text-muted-foreground">Cartão, Vale, Pix, Dinheiro (Em breve!)</p>
                </div>
                <span className="text-2xl opacity-50">💵</span>
              </div>
            </RadioGroup>

            {/* Order Summary */}
            <div className="mt-6 p-4 bg-muted rounded-xl">
              <h3 className="font-semibold mb-3">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.product.name} ({item.size.name})
                    </span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      <span className="text-success font-medium">GRÁTIS</span>
                    </div>
                  )}
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Desconto</span>
                      <span>-{formatCurrency(cart.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatCurrency(
                        deliveryMethod === 'pickup'
                          ? cart.subtotal - cart.discount
                          : cart.total
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => currentStepIndex > 0 ? handleBack() : navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-lg">Checkout</h1>
        </div>

        {/* Stepper */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            {steps.filter(s => s.id !== 'delivery').map((step, index) => {
              const stepIndex = steps.findIndex(s => s.id === step.id);
              const isCompleted = currentStepIndex > stepIndex;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        'stepper-circle',
                        isCompleted && 'completed',
                        isCurrent && 'active',
                        !isCompleted && !isCurrent && 'pending'
                      )}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      'text-xs',
                      isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.filter(s => s.id !== 'delivery').length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2',
                      currentStepIndex > stepIndex ? 'bg-primary' : 'bg-border'
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {renderStepContent()}
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="max-w-lg mx-auto">
          {currentStep === 'payment' ? (
            <Button
              size="lg"
              className="w-full font-semibold"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full font-semibold"
              onClick={handleNext}
            >
              Continuar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;