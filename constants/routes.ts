import type { Href } from 'expo-router';

export const ROUTES = {
  login: '/',
  cadastro: '/cadastro',
  registroPessoal: '/registro-pessoal',
  registroAnimal: '/registro-animal',
  sucessoAnimal: '/sucesso-animal',
  home: '/(app)/home',
  adotar: '/adotar',
  chat: '/(app)/chat',
  detalhesAnimal: '/detalhes-animal',
  mapa: '/(app)/mapa',
  meusPets: '/(app)/meus-pets',
  notificacoes: '/(app)/notificacoes',
} as const satisfies Record<string, Href>;
