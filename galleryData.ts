import { withBase } from './constants';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

// Update these entries to match your actual artwork files and copy.
export const GALLERY_ITEMS: GalleryItem[] = [
  { id: 'gallery-01', title: 'ChristmasCake', description: '2024 Christmas Eve cake moment with Panpan 🍰', image: withBase('/gallery/art01.png') },
  { id: 'gallery-02', title: 'Artwork 02', description: 'We built a tiny tower so all six of us could live inside one Polaroid (SH) 📸', image: withBase('/gallery/art03.png') },
  { id: 'gallery-03', title: 'Artwork 03', description: 'Late night subway, 50th St NYC 🌙', image: withBase('/gallery/art04.png') },
  { id: 'gallery-04', title: 'Artwork 04', description: 'A little 🦔 tidying books, for Panpan’s bookstore Christmas card 2025', image: withBase('/gallery/art02.png') },
  { id: 'gallery-05', title: 'Artwork 05', description: 'Two penguins sliding down the snow, very carefully ❄️', image: withBase('/gallery/art05.png') },
  { id: 'gallery-06', title: 'Artwork 06', description: 'Enjoyed a movie night with Sunflower Seeds and my pink IKEA lamp', image: withBase('/gallery/art06.png') },
  { id: 'gallery-07', title: 'Artwork 07', description: 'A winter train ride, cold and almost silent.', image: withBase('/gallery/art07.png') },
  { id: 'gallery-08', title: 'Artwork 08', description: 'A small encounter with a curious squirrel in Boston Common', image: withBase('/gallery/art08.png') },
  { id: 'gallery-09', title: 'Artwork 09', description: 'Mocha sat on a vintage blanket, quietly staring at me', image: withBase('/gallery/art09.png') },
  { id: 'gallery-10', title: 'Artwork 10', description: 'A random fire hydrant, maybe from Seattle', image: withBase('/gallery/art10.png') },
  { id: 'gallery-11', title: 'Artwork 11', description: 'Mocha with tomatoes, made into a Christmas card for my loved ones (2025)', image: withBase('/gallery/art11.png') },
  { id: 'gallery-12', title: 'Artwork 12', description: 'NYC summer streets. Suprisied to see People outside, me melting', image: withBase('/gallery/art12.png') },
  { id: 'gallery-13', title: 'Artwork 13', description: 'Bikes and chairs stacked into a careful little sculpture, guarding a parking space...', image: withBase('/gallery/art13.png') },
  { id: 'gallery-14', title: 'Artwork 14', description: 'Trying to paint my new plant in the style of Sanyu', image: withBase('/gallery/art14.png') },
  { id: 'gallery-15', title: 'Artwork 15', description: 'Apartment hunting in Boston, this red chair caught my eye in the snow', image: withBase('/gallery/art15.png') },
  { id: 'gallery-16', title: 'Artwork 16', description: 'A mountain goat family crossed my path while hiking at Glacier National Park summer 2025', image: withBase('/gallery/art16.png') },
  { id: 'gallery-17', title: 'Artwork 17', description: 'Before I left Pittsburgh in 2023, Ray was playing guitar in my studio 🎸', image: withBase('/gallery/art17.png') },
  { id: 'gallery-18', title: 'Artwork 18', description: 'I loved my tulip more when they faded away - another try of Sanyu’s style', image: withBase('/gallery/art18.png') },
  { id: 'gallery-19', title: 'Artwork 19', description: 'We were scale-testing Watershed, surrounded by Brian’s bubbly piece, with Diana and Elise', image: withBase('/gallery/art19.png') },
  { id: 'gallery-20', title: 'Artwork 20', description: 'Caffè Vittoria North End Boston with YJ', image: withBase('/gallery/art20.png') },
  { id: 'gallery-21', title: 'Artwork 21', description: 'Takoyaki with Cleo & YJ', image: withBase('/gallery/art21.png') },
  { id: 'gallery-22', title: 'Artwork 22', description: 'The day I left Shanghai, late 2024, Meilong Middle School was crowded', image: withBase('/gallery/art22.png') },
  { id: 'gallery-23', title: 'Artwork 23', description: 'Mocha watching YJ plant outside, E3 apartment, 2024', image: withBase('/gallery/art23.png') },
  { id: 'gallery-24', title: 'Artwork 24', description: 'Cozy moment with Mocha zzzZZZZZZ', image: withBase('/gallery/art24.png') },
  { id: 'gallery-25', title: 'Artwork 25', description: 'My first vacation, Hainan 2005', image: withBase('/gallery/art25.png') },
  { id: 'gallery-26', title: 'Artwork 26', description: 'I was scared but looks happy on this horse, Hainan 2005', image: withBase('/gallery/art26.png') },
  { id: 'gallery-27', title: 'Artwork 27', description: 'Octopus is delicious and pretty', image: withBase('/gallery/art27.png') },
  { id: 'gallery-28', title: 'Artwork 28', description: 'I missed my best friends wedding 2025 summer, she is gorgeous.', image: withBase('/gallery/art28.png') },
  { id: 'gallery-29', title: 'Artwork 29', description: 'Mocha loves the toy duck', image: withBase('/gallery/art29.png') },
  { id: 'gallery-30', title: 'Artwork 30', description: 'My first vacation, Hainan 2005', image: withBase('/gallery/art30.png') },
];
