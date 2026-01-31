// Demo reviews data - mockup only

import leticiaOliveira from '@/assets/reviews/leticia_oliveira.jpg';
import claudeteNoronha from '@/assets/reviews/claudete_noronha.jpg';
import rafaelMendes from '@/assets/reviews/rafael_mendes.jpg';
import antonioPacheco from '@/assets/reviews/antonio_pacheco.jpg';
import marinaDuarte from '@/assets/reviews/marina_duarte.jpg';
import patriciaFarias from '@/assets/reviews/patricia_farias.jpg';
import anaBeatrizLopes from '@/assets/reviews/ana_beatriz_lopes.jpg';
import julianaReis from '@/assets/reviews/juliana_reis.jpg';
import camilaAzevedo from '@/assets/reviews/camila_azevedo.jpg';
// Batch 2
import lucasTeixeira from '@/assets/reviews/lucas_teixeira.jpg';
import diegoNogueira from '@/assets/reviews/diego_nogueira.jpg';
import renataAlbuquerque from '@/assets/reviews/renata_albuquerque.jpg';
import marcosVinicius from '@/assets/reviews/marcos_vinicius.jpg';
import fernandaRocha from '@/assets/reviews/fernanda_rocha.jpg';
import carlosEduardo from '@/assets/reviews/carlos_eduardo.jpg';
import simoneVasconcelos from '@/assets/reviews/simone_vasconcelos.jpg';
import isabelaPires from '@/assets/reviews/isabela_pires.jpg';
import joaoBatista from '@/assets/reviews/joao_batista.jpg';
// Batch 3
import andreLima from '@/assets/reviews/andre_lima.jpg';
import matheusRangel from '@/assets/reviews/matheus_rangel.jpg';
import vanessaCoutinho from '@/assets/reviews/vanessa_coutinho.jpg';
import brunaSantos from '@/assets/reviews/bruna_santos.jpg';
import larissaMenezes from '@/assets/reviews/larissa_menezes.jpg';
import renatoFalcao from '@/assets/reviews/renato_falcao.jpg';
import paulaNogueira from '@/assets/reviews/paula_nogueira.jpg';

export interface Review {
  id: number;
  name: string;
  avatar: string;
  text: string;
  rating: number;
}

// Placeholder for reviews without photos
const defaultAvatar = 'https://ui-avatars.com/api/?background=random&color=fff&bold=true&name=';

export const reviews: Review[] = [
  {
    id: 1,
    name: 'Letícia Oliveira',
    avatar: leticiaOliveira,
    text: 'Marmita deliciosa, pedi achando que ia ser normal e me surpreendi 😍 vou pedir mais vezes simmm',
    rating: 5,
  },
  {
    id: 2,
    name: 'Claudete Noronha',
    avatar: claudeteNoronha,
    text: 'comida muito boa gostei bastante chegou certinho',
    rating: 5,
  },
  {
    id: 3,
    name: 'Rafael Mendes',
    avatar: rafaelMendes,
    text: 'Tudo muito bem feito, comida saborosa e porção boa. Recomendo.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Antônio Pacheco',
    avatar: antonioPacheco,
    text: 'chegou rapido comida boa tempero no ponto',
    rating: 5,
  },
  {
    id: 5,
    name: 'Marina Duarte',
    avatar: marinaDuarte,
    text: 'Achei incrível!! Bem temperada, leve e matou minha fome ❤️',
    rating: 5,
  },
  {
    id: 6,
    name: 'Patrícia Farias',
    avatar: patriciaFarias,
    text: 'Gostei bastante, comida caseira de verdade e bem servida',
    rating: 5,
  },
  {
    id: 7,
    name: 'Ana Beatriz Lopes',
    avatar: anaBeatrizLopes,
    text: 'Muito bom! Dá pra sentir que é feito com cuidado 🥰',
    rating: 5,
  },
  {
    id: 8,
    name: 'Juliana Reis',
    avatar: julianaReis,
    text: 'Amei demais 😍 chegou quentinha e super saborosa',
    rating: 5,
  },
  {
    id: 9,
    name: 'Camila Azevedo',
    avatar: camilaAzevedo,
    text: 'Perfeitaaaa 💕 apresentação linda e comida maravilhosa',
    rating: 5,
  },
  // Batch 2
  {
    id: 10,
    name: 'Lucas Teixeira',
    avatar: lucasTeixeira,
    text: 'Curti bastante, bem temperado e chegou no horário',
    rating: 5,
  },
  {
    id: 11,
    name: 'Diego Nogueira',
    avatar: diegoNogueira,
    text: 'Comida top, vale muito a pena',
    rating: 5,
  },
  {
    id: 12,
    name: 'Renata Albuquerque',
    avatar: renataAlbuquerque,
    text: 'gostei bastante da comida bem feita e saborosa',
    rating: 5,
  },
  {
    id: 13,
    name: 'Marcos Vinícius',
    avatar: marcosVinicius,
    text: 'Muito bom, pedi de novo depois da primeira vez',
    rating: 5,
  },
  {
    id: 14,
    name: 'Fernanda Rocha',
    avatar: fernandaRocha,
    text: 'Comida maravilhosa, bem temperada e chegou quentinha 🥰',
    rating: 5,
  },
  {
    id: 15,
    name: 'Carlos Eduardo',
    avatar: carlosEduardo,
    text: 'boa comida bem feita vale a pena',
    rating: 5,
  },
  {
    id: 16,
    name: 'Simone Vasconcelos',
    avatar: simoneVasconcelos,
    text: 'Gostei bastante, tempero bom e entrega correta',
    rating: 5,
  },
  {
    id: 17,
    name: 'Isabela Pires',
    avatar: isabelaPires,
    text: 'Amei demais 😍 muito saborosa e leve',
    rating: 5,
  },
  {
    id: 18,
    name: 'João Batista',
    avatar: joaoBatista,
    text: 'Comida boa chegou no horario',
    rating: 5,
  },
  // Batch 3
  {
    id: 19,
    name: 'André Lima',
    avatar: andreLima,
    text: 'Tudo certo, comida bem feita e saborosa',
    rating: 5,
  },
  {
    id: 20,
    name: 'Matheus Rangel',
    avatar: matheusRangel,
    text: 'Muito boa mesmo, pedi de novo 👍',
    rating: 5,
  },
  {
    id: 21,
    name: 'Vanessa Coutinho',
    avatar: vanessaCoutinho,
    text: 'Gostei bastante, bem temperada e porção boa',
    rating: 5,
  },
  {
    id: 22,
    name: 'Bruna Santos',
    avatar: brunaSantos,
    text: 'Perfeitaaa 💕 apresentação linda',
    rating: 5,
  },
  {
    id: 23,
    name: 'Larissa Menezes',
    avatar: larissaMenezes,
    text: 'Muito bom!! chegou rápido e tava delicioso 😋',
    rating: 5,
  },
  {
    id: 24,
    name: 'Renato Falcão',
    avatar: renatoFalcao,
    text: 'Bom demais, recomendo',
    rating: 5,
  },
  {
    id: 25,
    name: 'Paula Nogueira',
    avatar: paulaNogueira,
    text: 'gostei da comida bem feita e saborosa',
    rating: 5,
  },
  {
    id: 26,
    name: 'Sônia Barbosa',
    avatar: `${defaultAvatar}Sônia+B`,
    text: 'porcao boa e comida saborosa',
    rating: 5,
  },
  {
    id: 27,
    name: 'Eduardo Silveira',
    avatar: `${defaultAvatar}Eduardo+S`,
    text: 'Perfeita demais 😋 já virei cliente!',
    rating: 5,
  },
  // Batch 4 - all without photos
  {
    id: 28,
    name: 'Marta Siqueira',
    avatar: `${defaultAvatar}Marta+S`,
    text: 'muito bom chegou no horario',
    rating: 5,
  },
  {
    id: 29,
    name: 'Giovana Freitas',
    avatar: `${defaultAvatar}Giovana+F`,
    text: 'Muito bom!!! entrega rápida e comida top 🔥',
    rating: 5,
  },
  {
    id: 30,
    name: 'Paulo Henrique',
    avatar: `${defaultAvatar}Paulo+H`,
    text: 'gostei bastante tempero bom',
    rating: 5,
  },
  {
    id: 31,
    name: 'Rosana Pinto',
    avatar: `${defaultAvatar}Rosana+P`,
    text: 'Perfeita demais 😋 já virei cliente!',
    rating: 5,
  },
  {
    id: 32,
    name: 'Bruno Cardoso',
    avatar: `${defaultAvatar}Bruno+C`,
    text: 'comida boa e bem feita recomendo',
    rating: 5,
  },
  {
    id: 33,
    name: 'Cecília Moura',
    avatar: `${defaultAvatar}Cecília+M`,
    text: 'Muito bom!!! entrega rápida e comida top 🔥',
    rating: 5,
  },
  {
    id: 34,
    name: 'Jéssica Ramos',
    avatar: `${defaultAvatar}Jéssica+R`,
    text: 'comida boa e bem feita recomendo',
    rating: 5,
  },
  {
    id: 35,
    name: 'Reginaldo Costa',
    avatar: `${defaultAvatar}Reginaldo+C`,
    text: 'Perfeita demais 😋 já virei cliente!',
    rating: 5,
  },
  {
    id: 36,
    name: 'Eliane Prado',
    avatar: `${defaultAvatar}Eliane+P`,
    text: 'comida boa e bem feita recomendo',
    rating: 5,
  },
];

export const getDisplayReviews = () => reviews.slice(0, 3);
export const getAllReviews = () => reviews;
