import { images2 } from '../lib/mediaPath'

export const visitingCardImage = '/images/IMG-20250911-WA0021.jpg'

export const business = {
  brand: 'Rainbow Colour Lab',
  firmName: 'RAINBOW COLOUR LAB',
  proprietor: 'Sushil Kumar Agrawal',
  coProprietor: 'Rashmi Agrawal',
  established: '1980s',
  legacy: '40+ years',
  address: '21 Naya Bazar, Malviya Chowk, Jabalpur, Madhya Pradesh, India, 482001',
  phones: ['+91-9425324286', '+91-7987627054', '+91-9425801886'],
  landline: '07614082458',
  /** Primary inbox for website inquiries (Web3Forms + mailto fallback). */
  inquiryEmail: 'rachitagr123@gmail.com',
  emails: ['rachitagr123@gmail.com', 'rcolourlab123@gmail.com'],
  gst: '23ACIPA1110D1ZS',
  iec: '1100000101',
}

/** Home hero mosaic — refreshed product photography from `images 2`. */
export const homeHeroCollage = [
  images2('T-shirt printing', '03238bb92dc8e81dd60dd9eb2049446c.jpg'),
  images2('Keyring', 'IMG-20260428-WA0047.jpg'),
  images2('Calendar', 'IMG-20260428-WA0041.jpg'),
  images2('2 peace box', 'IMG-20260428-WA0039.jpg'),
  images2('PhotoBookAlbum Printing ', 'IMG-20260428-WA0025.jpg'),
  images2('Lather bag cover', 'IMG-20260428-WA0006.jpg'),
]

/** Split / secondary band (single strong image). */
export const homeSplitImage = images2('3 peace box cover', 'IMG_20251001_171528.jpg')

export type HomeHighlight = {
  title: string
  description: string
  image: string
  to: string
}

export const homeHighlights: HomeHighlight[] = [
  {
    title: 'Photo printing — 4×6 to 30×90',
    description: 'Accurate colour, premium papers, and sizes for wallets to wall statements.',
    image: images2('Calendar', 'IMG-20260428-WA0024.jpg'),
    to: '/services#photo-printing',
  },
  {
    title: 'Custom gifts',
    description: 'Mugs, magic mugs, tees, cushions, and keyrings with your artwork.',
    image: images2('Heart Cushion', 'ab966dae3975faae9db9a3cbbb9f0f25.jpg'),
    to: '/services#custom-gifts',
  },
  {
    title: 'Photobook & album kits',
    description: '5-in-1 combos, acrylic boxes, wedding-ready packaging.',
    image: images2('5 in 1 combo', 'IMG-20260428-WA0028.jpg'),
    to: '/services#photobook-album',
  },
  {
    title: 'Lamination & framing',
    description: 'Protect prints and finish them with designer-ready frames.',
    image: images2('Photo frame', '363e638ed0734d399180d944309d4612.jpg'),
    to: '/services#lamination-framing',
  },
]

export const machineCatalog = [
  {
    model: 'HP Indigo 5500',
    image: 'https://images.unsplash.com/photo-1581092921461-39b9d08a9b2f?auto=format&fit=crop&w=1400&q=80',
    useCase: 'Entry commercial digital press for photo and short-run jobs.',
  },
  {
    model: 'HP Indigo 5600',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1400&q=80',
    useCase: 'Production-grade press for scalable print operations.',
  },
  {
    model: 'HP Indigo 7500',
    image: 'https://images.unsplash.com/photo-1581093804475-577d72e13c89?auto=format&fit=crop&w=1400&q=80',
    useCase: 'High-volume premium print output with improved colour consistency.',
  },
  {
    model: 'HP Indigo 7600',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1400&q=80',
    useCase: 'Industrial-capable digital print system for demanding workflows.',
  },
  {
    model: 'HP Indigo 10000',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1400&q=80',
    useCase: 'Large-format commercial machine for heavy B2B output.',
  },
  {
    model: 'HP Indigo 12000',
    image: 'https://images.unsplash.com/photo-1581092446327-9f89b8f8f64d?auto=format&fit=crop&w=1400&q=80',
    useCase: 'Top-tier production solution for enterprise print businesses.',
  },
]
