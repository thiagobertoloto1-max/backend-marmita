// Account Page - User account and settings

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  FileText, 
  Shield, 
  LogOut,
  ChevronRight,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    section: 'Conta',
    items: [
      { icon: User, label: 'Meus dados', href: '#' },
      { icon: MapPin, label: 'Endereços salvos', href: '#' },
      { icon: CreditCard, label: 'Formas de pagamento', href: '#' },
      { icon: Heart, label: 'Favoritos', href: '#' }
    ]
  },
  {
    section: 'Configurações',
    items: [
      { icon: Bell, label: 'Notificações', href: '#' }
    ]
  },
  {
    section: 'Suporte',
    items: [
      { icon: HelpCircle, label: 'Ajuda', href: '#' },
      { icon: FileText, label: 'Termos de uso', href: '#' },
      { icon: Shield, label: 'Política de privacidade', href: '#' }
    ]
  }
];

const AccountPage: React.FC = () => {
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
          <h1 className="font-display font-bold text-lg">Minha Conta</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* User Card */}
        <div className="bg-card rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">Visitante</h2>
              <p className="text-sm text-muted-foreground">
                Faça login para ver seus pedidos
              </p>
            </div>
          </div>
          <Button className="w-full mt-4">
            Entrar ou Cadastrar
          </Button>
        </div>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <div key={section.section}>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
              {section.section}
            </h3>
            <div className="bg-card rounded-xl shadow-sm overflow-hidden">
              {section.items.map((item, index) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors',
                    index < section.items.length - 1 && 'border-b border-border'
                  )}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button className="flex items-center gap-4 w-full p-4 bg-card rounded-xl shadow-sm text-destructive hover:bg-muted/50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>

        {/* Version */}
        <p className="text-center text-sm text-muted-foreground pt-4">
          Marmita Express v1.0.0
        </p>
      </main>
    </div>
  );
};

export default AccountPage;
