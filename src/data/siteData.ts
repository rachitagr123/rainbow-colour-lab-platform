import { folderImages, images2 } from '../lib/mediaPath'

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

/** Home hero mosaic with refreshed product photography from `images 2`. */
export const homeHeroLogo = images2('Home page', 'Rachit - 01.png')

export const homeHeroCollage = [
  images2('Home page', 'Main Image 2.JPG'),
  images2('Home page', '000003.JPG'),
  images2('Home page', '000004.jpg'),
  images2('Home page', '13dc996bb445b81ecb6a094b0d387316.jpg'),
  images2('Home page', 'fee7ddbd833ca9531f974a96b9f0bcab.jpg'),
  images2('Home page', '5ff0cac004e6cc4607515e32e4cde53d.jpg'),
]

/** Split / secondary band (single strong image). */
export const homeSplitImage = images2('Home page', 'Only machines images.jpg')

export const homeAboutImage = images2('Home page', 'shop_image.jpeg')

export const homeStoryImages = folderImages('Home page', {
  first: ['Main Image 2.JPG', '000004.jpg', '000003.JPG'],
  exclude: ['Rachit - 01.psd', 'Rachit - 01.png', 'shop_image.jpeg', 'Only machines images.jpg'],
})

export const homeAdvertisementImages = [
  images2('ADVERTISEMENT', 'RAINBOW-2.jpg'),
  images2('ADVERTISEMENT', 'rainbow.jpg'),
  images2('ADVERTISEMENT', 'a0c593af9483e8b49bdb939ce3110589.jpg'),
  images2('ADVERTISEMENT', 'c2ef4a9b07ddfa4028857c3ed34a1b0a.jpg'),
]

export const homeAdvertisementVideos = [
  images2('ADVERTISEMENT', 'led frame.mp4'),
  images2('ADVERTISEMENT', 'booklet frame.mp4'),
]

export const homeAdvertisementVideoPosters = [
  images2('ADVERTISEMENT', 'RAINBOW-2.jpg'),
  images2('ADVERTISEMENT', 'c2ef4a9b07ddfa4028857c3ed34a1b0a.jpg'),
]

export type HomeHighlight = {
  title: string
  description: string
  image: string
  to: string
}

export const homeHighlights: HomeHighlight[] = [
  {
    title: 'Photo printing, 4 x 6 to 30 x 90',
    description: 'Accurate colour, premium papers, and sizes for wallets to wall statements.',
    image: images2('Photo Printing Section ', '000004.jpg'),
    to: '/services#photo-printing',
  },
  {
    title: 'Custom gifts',
    description: 'Mugs, magic mugs, tees, cushions, and keyrings with your artwork.',
    image: images2('Home page', '13dc996bb445b81ecb6a094b0d387316.jpg'),
    to: '/services#custom-gifts',
  },
  {
    title: 'Photobook & album kits',
    description: '5-in-1 combos, acrylic boxes, wedding-ready packaging.',
    image: images2('5 in 1 combo', 'IMG-20260428-WA0053.jpg'),
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
