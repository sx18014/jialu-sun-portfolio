import { withBase } from './constants';
import { GALLERY_MANIFEST } from './generated/galleryManifest';

const GALLERY_REFERENCE_SOURCE_PREFIX = '/gallery-references-src/';
const GALLERY_REFERENCE_OUTPUT_PREFIX = '/gallery-references/';

// Author with /gallery-references-src paths for easy local editing.
// Dev uses originals; production swaps to optimized /gallery-references outputs.
const withGalleryReference = (sourcePath: string) => {
  if (!sourcePath.startsWith(GALLERY_REFERENCE_SOURCE_PREFIX)) {
    return withBase(sourcePath);
  }

  if (import.meta.env.DEV) {
    return withBase(sourcePath);
  }

  const outputPathWithoutExt = sourcePath
    .replace(GALLERY_REFERENCE_SOURCE_PREFIX, GALLERY_REFERENCE_OUTPUT_PREFIX)
    .replace(/\.[^/.]+$/, '');

  if (sourcePath.toLowerCase().endsWith('.gif')) {
    return withBase(`${outputPathWithoutExt}.gif`);
  }

  return withBase(`${outputPathWithoutExt}.webp`);
};

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageWebp: string;
  imageAvif: string;
  width: number;
  height: number;
  story?: {
    mode: 'single-ref' | 'multi-ref' | 'sequence';
    notes?: string;
    references?: Array<{
      src: string;
      caption?: string;
    }>;
  };
}

export interface GalleryManifestLikeItem {
  id: string;
  width: number;
  height: number;
  srcWebp: string;
  srcAvif: string;
}

// Add a new artwork by dropping {id}.png into public/gallery-src and adding copy here.
type GalleryCopy = Pick<GalleryItem, 'id' | 'title' | 'description' | 'story'>;

export const GALLERY_COPY: GalleryCopy[] = [
  { id: 'art01', title: 'ChristmasCake', description: '2024 Christmas Eve cake moment with Panpan 🍰' },
  {
    id: 'art03',
    title: 'Polaroid Tower 宝利来塔',
    description: 'We built a tiny tower so all six of us could live inside one Polaroid (SH) 📸',
    story: {
      mode: 'multi-ref',
      notes:
        'At the end of 2024, when we returned to Shanghai, the six of us took Polaroid photos together. We would be heading to different cities and countries, and this might have been the last time we would all appear in the same frame. We stacked random objects into a small tower to hold up the camera so it could include everyone, and we ended up taking countless photos.',
      references: [
        {
          src: withGalleryReference('/gallery-references-src/art03/ref-01.JPG'),
          caption: 'Photo of the tower'
        },
        {
          src: withGalleryReference('/gallery-references-src/art03/ref-02.JPG'),
          caption: 'Photos of us'
        }
      ]
    }
  },
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
  {
    id: 'art18',
    title: 'Faded tulip 凋谢的郁金香',
    description: 'I loved my tulip more when they faded away - another try of Sanyu’s style',
    story: {
      mode: 'multi-ref',
      notes:
        'Sanyu’s oil paintings on canvas inspired this still life, both in composition and color. I was drawn to the tension between the black contour lines and the yellow background. After retiring, my father also began experimenting with oil still life painting, and this work became the starting point of a dialogue between us.',
      references: [
        {
          src: withGalleryReference('/gallery-references-src/art18/ref-01.JPG'),
          caption: 'Two weeks later, my tulips wilted.'
        },
        {
          src: withGalleryReference('/gallery-references-src/art18/ref-02.jpeg'),
          caption: 'Sanyu-Lotus 常玉-荷'
        }
      ]
    }
  },
  { id: 'art19', title: 'Artwork 19', description: 'We were scale-testing Watershed, surrounded by Brian’s bubbly piece, with Diana and Elise' },
  { id: 'art20', title: 'Artwork 20', description: 'Caffè Vittoria North End Boston with YJ' },
  { id: 'art21', title: 'Artwork 21', description: 'Takoyaki with Cleo & YJ' },
  { id: 'art22', title: 'Artwork 22', description: 'The day I left Shanghai, late 2024, Meilong Middle School was crowded' },
  {
    id: 'art23',
    title: '螳螂捕蝉黄雀在后',
    description: 'Mocha watching YJ plant outside, E3 apartment, 2024',
    story: {
      mode: 'single-ref',
      notes:
        'While YJ was tending cherry tomatoes outside, Mocha watched her with quiet focus. The ultraviolet grow light indoors became a strong source of color inspiration for me. The light felt abrupt and unnatural, yet I found myself enjoying the moment exactly as it was.',
      references: [
        {
          src: withGalleryReference('/gallery-references-src/art23/ref-01.jpeg'),
          caption: 'Photo of YJ & Mocha with ultraviolet grow light'
        }
      ]
    }
  },
  {
    id: 'art24',
    title: 'Napping together 午睡',
    description: 'Cozy moment with Mocha zzzZZZZZZ',
    story: {
      mode: 'multi-ref',
      notes:
        'On a sunny and cozy afternoon, Mocha and YJ both felt sleepy and napped together on the bed. In that moment, I felt a sense of peace and happiness.',
      references: [
        {
          src: withGalleryReference('/gallery-references-src/art24/ref-01.JPG'),
          caption: 'Photo of YJ & Mocha'
        },
        {
          src: withGalleryReference('/gallery-references-src/art24/ref-02.jpg'),
          caption: 'Color reference'
        }
      ]
    }
  },
  { id: 'art25', title: 'Artwork 25', description: 'My first vacation, Hainan 2005' },
  { id: 'art26', title: 'Artwork 26', description: 'I was scared but looks happy on this horse, Hainan 2005' },
  { id: 'art27', title: 'Artwork 27', description: 'Octopus is delicious and pretty' },
  { id: 'art28', title: 'Artwork 28', description: 'I missed my best friends wedding 2025 summer, she is gorgeous.' },
  { id: 'art29', title: 'Artwork 29', description: 'Mocha loves the toy duck' },
  { id: 'art30', title: 'Artwork 30', description: 'My first vacation, Hainan 2005' },
  {
    id: 'art31',
    title: 'Itchy Itchy Goat 痒羊 ',
    description: 'Let me scratch! Sooo itchy',
    story: {
      mode: 'single-ref',
      notes:
        'In the fall of 2024, we visited Tougas Family Farm for apple picking for the first time. I hadn’t expected the farm to be home to so many cute animals! One little goat spent a long time scratching with its horns, looking incredibly cute and comfortable. I couldn’t stop watching.',
      references: [
        {
          src: withGalleryReference('/gallery-references-src/art31/ref-01.gif'),
          caption: 'Photo of that scratching goat'
        }
      ]
    }
  },
];

export const buildGalleryItems = (manifestItems: GalleryManifestLikeItem[]): GalleryItem[] => {
  const manifestById = new Map(manifestItems.map((item) => [item.id, item]));

  return GALLERY_COPY.flatMap((copy) => {
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
};

export const GALLERY_ITEMS: GalleryItem[] = buildGalleryItems(GALLERY_MANIFEST);
