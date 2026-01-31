// Data Layer - Products and Categories for Divino Sabor Marmitas

// Product images imports - Traditional marmitas
import almondegasImg from '@/assets/marmitas/almondegas_ao_molho.webp';
import bifeImg from '@/assets/marmitas/bife_acebolado.webp';
import carnePanelaImg from '@/assets/marmitas/carne_de_panela.webp';
import churrascoImg from '@/assets/marmitas/churrasco.webp';
import feijoadaImg from '@/assets/marmitas/feijoada.webp';
import frangoParmegianaImg from '@/assets/marmitas/frango_a_parmegiana.webp';
import frangoGrelhadoImg from '@/assets/marmitas/frango_grelhado.webp';
import tilapiaImg from '@/assets/marmitas/tilapia.png';
import estrogonofeCarneImg from '@/assets/marmitas/estrogonofe_carne.webp';
import estrogonofeFrangoImg from '@/assets/marmitas/estrogonofe_frango.webp';
import macarraoBolonhesaImg from '@/assets/marmitas/macarrao_bolonhesa.webp';
import promo2por1Img from '@/assets/marmitas/2_por_1.webp';
// Vegan marmitas images
import estrogonofeVeganoImg from '@/assets/marmitas/estrogonofe_vegano.webp';
import moquecaPalmitoImg from '@/assets/marmitas/moqueca_palmito.webp';
import nuggetsVeganosImg from '@/assets/marmitas/nuggets_veganos.webp';
import quibeVeganoImg from '@/assets/marmitas/quibe_vegano.webp';

export interface ProductChoice {
  id: string;
  label: string;
  description?: string | null;
  price: number; // price delta
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  type: 'single' | 'multi';
  choices: ProductChoice[];
}

// Legacy interfaces for compatibility
export interface ProductSize {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  categoryId: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  optionGroups: ProductOptionGroup[];
  sizes: ProductSize[];
  addons: ProductAddon[];
  isPromo?: boolean;
  promoPrice?: number;
  isBestSeller?: boolean;
  prepTime: number;
  fromPrice?: boolean;
  includedGift?: string; // Brinde incluso
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  description: string;
}

// Placeholder image for products without photo
const placeholderImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop';

export const categories: Category[] = [
  {
    id: 'marmitas_tradicionais',
    name: 'Marmitas Tradicionais',
    icon: '🍱',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    description: 'Comida caseira de verdade'
  },
  {
    id: 'marmitas_veganas',
    name: 'Marmitas Veganas',
    icon: '🌱',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    description: 'Opções 100% veganas'
  },
  {
    id: 'especiais',
    name: 'Especiais',
    icon: '⭐',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    description: 'Pratos especiais do dia'
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    icon: '🥤',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
    description: 'Refrigerantes gelados'
  }
];

// Common option groups for marmitas
const adicionaisGratis: ProductOptionGroup = {
  id: 'adicionais_gratis',
  name: 'Adicionais Grátis (escolha até 2)',
  required: false,
  min: 0,
  max: 2,
  type: 'multi',
  choices: [
    { id: 'salada', label: 'Salada', description: 'Mix de folhas verdes frescas com tomate e pepino', price: 0 },
    { id: 'vinagrete', label: 'Vinagrete', description: 'Molho de tomate, cebola e pimentão picados com temperos', price: 0 },
    { id: 'pure', label: 'Purê de Batata', description: 'Purê cremoso de batata temperado com manteiga', price: 0 },
    { id: 'farofa_premium', label: 'Farofa Premium', description: 'Farofa especial com bacon crocante e temperos da casa', price: 0 }
  ]
};

// Refrigerantes lata PAGOS (para produtos normais)
const refrigerantesLataPagos: ProductOptionGroup = {
  id: 'refri_lata_pago',
  name: 'Refrigerante LATA 350ml - Vão gelados! 🧊',
  required: false,
  min: 0,
  max: 2,
  type: 'multi',
  choices: [
    { id: 'coca_lata', label: 'Coca-Cola', description: 'Lata 350ml', price: 4.50 },
    { id: 'coca_zero_lata', label: 'Coca-Cola Zero', description: 'Lata 350ml', price: 4.50 },
    { id: 'fanta_uva_lata', label: 'Fanta Uva', description: 'Lata 350ml', price: 4.00 },
    { id: 'fanta_laranja_lata', label: 'Fanta Laranja', description: 'Lata 350ml', price: 4.00 },
    { id: 'sprite_lata', label: 'Sprite', description: 'Lata 350ml', price: 4.50 }
  ]
};

// Refrigerantes lata GRÁTIS (somente para promoção 2 por 1)
const refrigerantesLataGratisPromo: ProductOptionGroup = {
  id: 'refri_lata_gratis_promo',
  name: 'Refrigerante LATA 350ml (até 2 GRÁTIS) 🎁',
  required: false,
  min: 0,
  max: 2,
  type: 'multi',
  choices: [
    { id: 'coca_lata', label: 'Coca-Cola', description: 'Lata 350ml - GRÁTIS', price: 0 },
    { id: 'coca_zero_lata', label: 'Coca-Cola Zero', description: 'Lata 350ml - GRÁTIS', price: 0 },
    { id: 'fanta_uva_lata', label: 'Fanta Uva', description: 'Lata 350ml - GRÁTIS', price: 0 },
    { id: 'fanta_laranja_lata', label: 'Fanta Laranja', description: 'Lata 350ml - GRÁTIS', price: 0 },
    { id: 'sprite_lata', label: 'Sprite', description: 'Lata 350ml - GRÁTIS', price: 0 }
  ]
};

// Refrigerantes maiores PAGOS (preços normais)
const refrigerantesMaioresPagos: ProductOptionGroup = {
  id: 'refri_grande',
  name: 'Refrigerante MAIOR - Vão gelados! 🧊',
  required: false,
  min: 0,
  max: 1,
  type: 'single',
  choices: [
    { id: 'nenhum', label: 'Não quero refrigerante grande', description: null, price: 0 },
    { id: 'coca_1l', label: 'Coca-Cola 1L', description: 'Refrigerante gelado', price: 7.90 },
    { id: 'guarana_1l', label: 'Guaraná Antarctica 1L', description: 'Refrigerante gelado', price: 6.90 },
    { id: 'fanta_1l', label: 'Fanta Laranja 1L', description: 'Refrigerante gelado', price: 6.90 },
    { id: 'coca_2l', label: 'Coca-Cola 2L', description: 'Refrigerante gelado', price: 12.90 },
    { id: 'guarana_2l', label: 'Guaraná Antarctica 2L', description: 'Refrigerante gelado', price: 9.90 },
    { id: 'fanta_2l', label: 'Fanta Laranja 2L', description: 'Refrigerante gelado', price: 10.90 }
  ]
};

// Refrigerantes maiores para promoção (mesmo preço que normais)
const refrigerantesMaioresPromo: ProductOptionGroup = {
  id: 'refri_grande_promo',
  name: 'Refrigerante MAIOR (preço promocional) 🧊',
  required: false,
  min: 0,
  max: 1,
  type: 'single',
  choices: [
    { id: 'nenhum', label: 'Não quero refrigerante grande', description: null, price: 0 },
    { id: 'coca_1l', label: 'Coca-Cola 1L', description: 'Refrigerante gelado', price: 7.90 },
    { id: 'guarana_1l', label: 'Guaraná Antarctica 1L', description: 'Refrigerante gelado', price: 6.90 },
    { id: 'fanta_1l', label: 'Fanta Laranja 1L', description: 'Refrigerante gelado', price: 6.90 },
    { id: 'coca_2l', label: 'Coca-Cola 2L', description: 'Refrigerante gelado', price: 12.90 },
    { id: 'guarana_2l', label: 'Guaraná Antarctica 2L', description: 'Refrigerante gelado', price: 9.90 },
    { id: 'fanta_2l', label: 'Fanta Laranja 2L', description: 'Refrigerante gelado', price: 10.90 }
  ]
};

// Opção de escolha de marmitas para promoção 2 por 1
const escolhaMarmitas2por1: ProductOptionGroup = {
  id: 'escolha_marmitas',
  name: 'Escolha suas 2 Marmitas (Tamanho M)',
  required: true,
  min: 2,
  max: 2,
  type: 'multi',
  choices: [
    // Tradicionais
    { id: 'almondegas_ao_molho', label: 'Almôndegas ao Molho', description: 'Almôndegas caseiras ao molho de tomate', price: 0 },
    { id: 'bife_acebolado', label: 'Bife Acebolado', description: 'Bife grelhado com cebolas douradas', price: 0 },
    { id: 'carne_de_panela', label: 'Carne de Panela', description: 'Carne macia cozida no molho caseiro', price: 0 },
    { id: 'churrasco', label: 'Churrasco', description: 'Mix de carnes grelhadas', price: 0 },
    { id: 'feijoada', label: 'Feijoada', description: 'Feijoada completa tradicional', price: 0 },
    { id: 'frango_parmegiana', label: 'Frango à Parmegiana', description: 'Frango empanado gratinado', price: 0 },
    { id: 'frango_grelhado', label: 'Frango Grelhado', description: 'Frango grelhado temperado', price: 0 },
    { id: 'tilapia', label: 'Tilápia', description: 'Filé de tilápia grelhado', price: 0 },
    { id: 'estrogonofe_carne', label: 'Estrogonofe de Carne', description: 'Estrogonofe cremoso de carne', price: 0 },
    { id: 'estrogonofe_frango', label: 'Estrogonofe de Frango', description: 'Estrogonofe cremoso de frango', price: 0 },
    { id: 'macarrao_bolonhesa', label: 'Macarrão à Bolonhesa', description: 'Espaguete à bolonhesa', price: 0 },
    // Veganas
    { id: 'nuggets_veganos', label: 'Nuggets Veganos', description: 'Nuggets de feijão branco e lentilha', price: 0 },
    { id: 'moqueca_palmito', label: 'Moqueca de Palmito', description: 'Moqueca vegana de palmito pupunha', price: 0 },
    { id: 'estrogonofe_vegano', label: 'Estrogonofe Vegano', description: 'Estrogonofe de palmito com cogumelos', price: 0 },
    { id: 'quibe_vegano', label: 'Quibe Vegano', description: 'Quibe de abóbora e lentilha', price: 0 }
  ]
};

// Helper function to create sizes with P, M, G prices
// basePrice is the price for size P (smallest)
// The function takes specific prices for each size
const createSizes = (priceP: number, priceM: number, priceG: number): ProductSize[] => [
  { id: 'p', name: 'Marmita P', price: 0, description: '400-450g' },
  { id: 'm', name: 'Marmita M', price: priceM - priceP, description: '600-650g' },
  { id: 'g', name: 'Marmita G', price: priceG - priceP, description: '800-850g' }
];

export const products: Product[] = [
  // ===== PROMOÇÃO 2 POR 1 (PRIMEIRO DA LISTA) =====
  {
    id: 'promo_2_por_1',
    name: '2 por 1 🔥',
    description: 'MEGA PROMOÇÃO! Leve 2 marmitas tamanho M e pague só R$25,90! Acompanha 2 latas de refrigerante 350ml GRÁTIS. Escolha suas marmitas favoritas e aproveite essa oferta imperdível!',
    shortDescription: 'Leve 2 marmitas por R$25,90',
    basePrice: 25.90,
    categoryId: 'especiais',
    tags: ['promoção', '2por1', 'oferta'],
    rating: 5.0,
    reviewCount: 523,
    image: promo2por1Img,
    images: [promo2por1Img],
    optionGroups: [escolhaMarmitas2por1, refrigerantesLataGratisPromo, refrigerantesMaioresPromo],
    sizes: [{ id: 'unico', name: 'Combo 2 Marmitas M', price: 0 }],
    addons: [],
    isBestSeller: true,
    isPromo: true,
    prepTime: 25,
    includedGift: '2 latas de refrigerante 350ml GRÁTIS'
  },
  // ===== MARMITAS TRADICIONAIS =====
  {
    id: 'almondegas_ao_molho',
    name: 'Almôndegas ao Molho',
    description: 'Deliciosas almôndegas caseiras ao molho de tomate, acompanhadas de arroz branco, feijão e farofa. Comida de verdade, sabor de casa! Brinde: doce do dia.',
    shortDescription: 'Almôndegas caseiras ao molho',
    basePrice: 19.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['carne', 'molho', 'caseiro'],
    rating: 4.9,
    reviewCount: 156,
    image: almondegasImg,
    images: [almondegasImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(19.90, 24.90, 29.90),
    addons: [],
    isBestSeller: true,
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'bife_acebolado',
    name: 'Bife Acebolado',
    description: 'Bife bovino grelhado coberto com cebolas douradas, servido com arroz, feijão, farofa e salada. Um clássico da comida brasileira! Brinde: doce do dia.',
    shortDescription: 'Bife grelhado com cebolas',
    basePrice: 20.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['carne', 'bife', 'cebola'],
    rating: 4.8,
    reviewCount: 198,
    image: bifeImg,
    images: [bifeImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(20.90, 25.90, 30.90),
    addons: [],
    isBestSeller: true,
    prepTime: 25,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'carne_de_panela',
    name: 'Carne de Panela',
    description: 'Carne bovina cozida lentamente até ficar macia e saborosa, no molho caseiro. Acompanha arroz, feijão e farofa. Sabor que conforta! Brinde: doce do dia.',
    shortDescription: 'Carne macia no molho',
    basePrice: 21.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['carne', 'panela', 'caseiro'],
    rating: 4.9,
    reviewCount: 234,
    image: carnePanelaImg,
    images: [carnePanelaImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(21.90, 26.90, 31.90),
    addons: [],
    isBestSeller: true,
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'churrasco',
    name: 'Churrasco',
    description: 'Mix de carnes grelhadas no estilo churrasco: picanha, linguiça e frango. Servido com arroz, farofa e vinagrete. Churrasco de verdade! Brinde: doce do dia.',
    shortDescription: 'Mix de carnes grelhadas',
    basePrice: 23.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['churrasco', 'carnes', 'grelhado'],
    rating: 4.9,
    reviewCount: 312,
    image: churrascoImg,
    images: [churrascoImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(23.90, 29.90, 34.90),
    addons: [],
    isBestSeller: true,
    prepTime: 25,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'feijoada',
    name: 'Feijoada',
    description: 'A tradicional feijoada brasileira com feijão preto, carnes variadas, couve refogada e laranja. Acompanha arroz branco e farofa. Brinde: doce do dia.',
    shortDescription: 'Feijoada completa',
    basePrice: 23.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['feijoada', 'tradicional', 'brasileiro'],
    rating: 5.0,
    reviewCount: 287,
    image: feijoadaImg,
    images: [feijoadaImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(23.90, 29.90, 34.90),
    addons: [],
    isBestSeller: true,
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'frango_parmegiana',
    name: 'Frango à Parmegiana',
    description: 'Filé de frango empanado, coberto com molho de tomate e queijo gratinado. Acompanha arroz, feijão, farofa e purê. Irresistível! Brinde: doce do dia.',
    shortDescription: 'Frango empanado gratinado',
    basePrice: 21.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['frango', 'parmegiana', 'empanado'],
    rating: 4.8,
    reviewCount: 245,
    image: frangoParmegianaImg,
    images: [frangoParmegianaImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(21.90, 26.90, 31.90),
    addons: [],
    isBestSeller: true,
    prepTime: 25,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'frango_grelhado',
    name: 'Frango Grelhado',
    description: 'Peito de frango grelhado suculento e temperado, servido com arroz, feijão, farofa e salada fresca. Leve e saboroso! Brinde: doce do dia.',
    shortDescription: 'Frango grelhado temperado',
    basePrice: 17.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['frango', 'grelhado', 'saudável'],
    rating: 4.7,
    reviewCount: 189,
    image: frangoGrelhadoImg,
    images: [frangoGrelhadoImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(17.90, 22.90, 27.90),
    addons: [],
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'tilapia',
    name: 'Tilápia',
    description: 'Filé de tilápia grelhado, leve e saboroso. Acompanha arroz, feijão, farofa e legumes refogados. Opção saudável e deliciosa! Brinde: doce do dia.',
    shortDescription: 'Filé de tilápia grelhado',
    basePrice: 23.90, // Preço P (mantendo proporcional, não estava no cardápio)
    categoryId: 'marmitas_tradicionais',
    tags: ['peixe', 'tilápia', 'grelhado'],
    rating: 4.8,
    reviewCount: 134,
    image: tilapiaImg,
    images: [tilapiaImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(23.90, 28.90, 33.90),
    addons: [],
    prepTime: 25,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'estrogonofe_carne',
    name: 'Estrogonofe de Carne',
    description: 'Estrogonofe cremoso de carne bovina com cogumelos, servido com arroz branco, batata palha e farofa. Um clássico irresistível! Brinde: doce do dia.',
    shortDescription: 'Estrogonofe cremoso de carne',
    basePrice: 22.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['carne', 'estrogonofe', 'cremoso'],
    rating: 4.9,
    reviewCount: 203,
    image: estrogonofeCarneImg,
    images: [estrogonofeCarneImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(22.90, 27.90, 32.90),
    addons: [],
    isBestSeller: true,
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'estrogonofe_frango',
    name: 'Estrogonofe de Frango',
    description: 'Estrogonofe cremoso de frango com cogumelos, servido com arroz branco, batata palha e farofa. Sabor suave e delicioso! Brinde: doce do dia.',
    shortDescription: 'Estrogonofe cremoso de frango',
    basePrice: 20.90, // Preço P
    categoryId: 'marmitas_tradicionais',
    tags: ['frango', 'estrogonofe', 'cremoso'],
    rating: 4.8,
    reviewCount: 187,
    image: estrogonofeFrangoImg,
    images: [estrogonofeFrangoImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(20.90, 25.90, 30.90),
    addons: [],
    isBestSeller: true,
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },

  // ===== ESPECIAIS =====
  {
    id: 'lasanha_carne_frango',
    name: 'Lasanha de Carne e Frango',
    description: 'Lasanha cremosa com camadas de carne moída e frango desfiado, molho branco e queijo gratinado. Acompanha salada. Brinde: doce do dia.',
    shortDescription: 'Lasanha mista gratinada',
    basePrice: 24.90, // Preço único (não tem tamanhos)
    categoryId: 'especiais',
    tags: ['lasanha', 'massa', 'gratinado'],
    rating: 4.9,
    reviewCount: 156,
    image: placeholderImage,
    images: [placeholderImage],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: [{ id: 'unico', name: 'Tamanho Único', price: 0, description: 'Porção individual' }],
    addons: [],
    prepTime: 25,
    includedGift: 'Brinde: doce do dia'
  },
  {
    id: 'macarrao_bolonhesa',
    name: 'Macarrão à Bolonhesa',
    description: 'Macarrão espaguete ao molho bolonhesa caseiro, com carne moída temperada. Acompanha queijo ralado. Brinde: doce do dia.',
    shortDescription: 'Espaguete à bolonhesa',
    basePrice: 18.90, // Preço P
    categoryId: 'especiais',
    tags: ['massa', 'macarrão', 'bolonhesa'],
    rating: 4.7,
    reviewCount: 178,
    image: macarraoBolonhesaImg,
    images: [macarraoBolonhesaImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(18.90, 23.90, 28.90),
    addons: [],
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  
  // ===== MARMITAS VEGANAS =====
  {
    id: 'nuggets_veganos',
    name: 'Nuggets Veganos',
    description: 'Nuggets crocantes de feijão branco e lentilha, 100% vegano. Acompanha arroz integral, salada e molho especial. Brinde: doce do dia.',
    shortDescription: 'Nuggets de feijão e lentilha',
    basePrice: 20.90, // Preço P
    categoryId: 'marmitas_veganas',
    tags: ['vegano', 'nuggets', 'proteína'],
    rating: 4.6,
    reviewCount: 89,
    image: nuggetsVeganosImg,
    images: [nuggetsVeganosImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(20.90, 25.90, 30.90),
    addons: [],
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'moqueca_palmito',
    name: 'Moqueca de Palmito Pupunha',
    description: 'Moqueca vegana com palmito pupunha, leite de coco, dendê e temperos especiais. Acompanha arroz branco. Brinde: doce do dia.',
    shortDescription: 'Moqueca vegana de palmito',
    basePrice: 22.90, // Preço P
    categoryId: 'marmitas_veganas',
    tags: ['vegano', 'moqueca', 'palmito'],
    rating: 4.8,
    reviewCount: 67,
    image: moquecaPalmitoImg,
    images: [moquecaPalmitoImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(22.90, 27.90, 32.90),
    addons: [],
    prepTime: 25,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'estrogonofe_vegano',
    name: 'Estrogonofe Vegano',
    description: 'Estrogonofe cremoso de palmito com cogumelos, sem lactose. Acompanha arroz integral e batata palha. Brinde: doce do dia.',
    shortDescription: 'Estrogonofe de palmito/cogumelos',
    basePrice: 21.90, // Preço P
    categoryId: 'marmitas_veganas',
    tags: ['vegano', 'estrogonofe', 'cremoso'],
    rating: 4.7,
    reviewCount: 92,
    image: estrogonofeVeganoImg,
    images: [estrogonofeVeganoImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(21.90, 26.90, 31.90),
    addons: [],
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  },
  {
    id: 'quibe_vegano',
    name: 'Quibe Vegano',
    description: 'Quibe assado de abóbora e lentilha, temperado com hortelã e especiarias. Acompanha arroz, salada e molho tahine. Brinde: doce do dia.',
    shortDescription: 'Quibe de abóbora e lentilha',
    basePrice: 19.90, // Preço P
    categoryId: 'marmitas_veganas',
    tags: ['vegano', 'quibe', 'árabe'],
    rating: 4.6,
    reviewCount: 54,
    image: quibeVeganoImg,
    images: [quibeVeganoImg],
    optionGroups: [adicionaisGratis, refrigerantesLataPagos, refrigerantesMaioresPagos],
    sizes: createSizes(19.90, 24.90, 29.90),
    addons: [],
    prepTime: 20,
    includedGift: 'Brinde: doce do dia',
    fromPrice: true
  }
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(c => c.id === id);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(p => p.categoryId === categoryId);
};

export const getBestSellers = (): Product[] => {
  const bestSellers = products.filter(p => p.isBestSeller);
  // Sort to ensure promo_2_por_1 is first
  return bestSellers.sort((a, b) => {
    if (a.id === 'promo_2_por_1') return -1;
    if (b.id === 'promo_2_por_1') return 1;
    return 0;
  });
};

export const getPromoProducts = (): Product[] => {
  return products.filter(p => p.isPromo);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
};
