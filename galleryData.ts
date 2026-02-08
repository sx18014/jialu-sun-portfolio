import { withBase } from './constants';
import { GALLERY_MANIFEST } from './generated/galleryManifest';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageWebp: string;
  imageAvif: string;
  width: number;
  height: number;
}

// Add a new artwork by dropping {id}.png into public/gallery-src and adding copy here.
const GALLERY_COPY: Array<Pick<GalleryItem, 'id' | 'title' | 'description'>> = [
  { id: 'art01', title: 'ChristmasCake', description: '2024 Christmas Eve cake moment with Panpan 🍰' },
  { id: 'art03', title: 'Artwork 02', description: 'We built a tiny tower so all six of us could live inside one Polaroid (SH) 📸' },
  { id: 'art04', title: 'Artwork 03', description: 'Late night subway, 50th St NYC 🌙' },
  { id: 'art02', title: 'Artwork 04', description: 'A little 🦔 tidying books, for Panpan’s bookstore Christmas card 2025' },
  { id: 'art05', title: 'Artwork 05', description: 'Two penguins sliding down the snow, very carefully ❄️' },
  { id: 'art06', title: 'Artwork 06', description: 'Enjoyed a movie night with Sunflower Seeds and my pink IKEA lamp' },
  { id: 'art07', title: 'Artwork 07', description: 'A winter train ride, cold and almost silent.' },
  { id: 'art08', title: 'Artwork 08', description: 'A small encounter with a curious squirrel in Boston Common' },
  { id: 'art09', title: 'Artwork 09', description: 'Mocha sat on a vintage blanket, quietly staring at me' },
  { id: 'art10', title: 'Artwork 10', description: 'A random fire hydrant, maybe from Seattle' },
  { id: 'art11', title: 'Artwork 11', description: 'Mocha with tomatoes, made into a Christmas card for my loved ones (2025)' },
  { id: 'art12', title: 'Artwork 12', description: 'NYC summer streets. Suprisied to see People outside, me melting' },
  { id: 'art13', title: 'Artwork 13', description: 'Bikes and chairs stacked into a careful little sculpture, guarding a parking space...' },
  { id: 'art14', title: 'Artwork 14', description: 'Trying to paint my new plant in the style of Sanyu' },
  { id: 'art15', title: 'Artwork 15', description: 'Apartment hunting in Boston, this red chair caught my eye in the snow' },
  { id: 'art16', title: 'Artwork 16', description: 'A mountain goat family crossed my path while hiking at Glacier National Park summer 2025' },
  { id: 'art17', title: 'Artwork 17', description: 'Before I left Pittsburgh in 2023, Ray was playing guitar in my studio 🎸' },
  { id: 'art18', title: 'Artwork 18', description: 'I loved my tulip more when they faded away - another try of Sanyu’s style' },
  { id: 'art19', title: 'Artwork 19', description: 'We were scale-testing Watershed, surrounded by Brian’s bubbly piece, with Diana and Elise' },
  { id: 'art20', title: 'Artwork 20', description: 'Caffè Vittoria North End Boston with YJ' },
  { id: 'art21', title: 'Artwork 21', description: 'Takoyaki with Cleo & YJ' },
  { id: 'art22', title: 'Artwork 22', description: 'The day I left Shanghai, late 2024, Meilong Middle School was crowded' },
  { id: 'art23', title: 'Artwork 23', description: 'Mocha watching YJ plant outside, E3 apartment, 2024' },
  { id: 'art24', title: 'Artwork 24', description: 'Cozy moment with Mocha zzzZZZZZZ' },
  { id: 'art25', title: 'Artwork 25', description: 'My first vacation, Hainan 2005' },
  { id: 'art26', title: 'Artwork 26', description: 'I was scared but looks happy on this horse, Hainan 2005' },
  { id: 'art27', title: 'Artwork 27', description: 'Octopus is delicious and pretty' },
  { id: 'art28', title: 'Artwork 28', description: 'I missed my best friends wedding 2025 summer, she is gorgeous.' },
  { id: 'art29', title: 'Artwork 29', description: 'Mocha loves the toy duck' },
  { id: 'art30', title: 'Artwork 30', description: 'My first vacation, Hainan 2005' }
];

const manifestById = new Map(GALLERY_MANIFEST.map((item) => [item.id, item]));

export const GALLERY_ITEMS: GalleryItem[] = GALLERY_COPY.flatMap((copy) => {
  const manifest = manifestById.get(copy.id);
  if (!manifest) return [];

  return [
    {
      ...copy,
      imageWebp: withBase(manifest.srcWebp),
      imageAvif: manifest.srcAvif ? withBase(manifest.srcAvif) : '',
      width: manifest.width,
      height: manifest.height
    }
  ];
});
