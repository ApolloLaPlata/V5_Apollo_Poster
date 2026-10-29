import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'V5 Apollo Poster',
    short_name: 'Apollo Poster',
    description: 'Automação de Design Gráfico, Banners Promocionais e Thumbnails',
    start_url: '/',
    display: 'standalone',
    background_color: '#070c17',
    theme_color: '#f43f5e',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
