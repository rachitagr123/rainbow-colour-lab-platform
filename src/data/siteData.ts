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
  phones: ['+91-9425324286', '+91-7987627054'],
  landline: '07614082458',
  /** Primary inbox for website inquiries (Web3Forms + mailto fallback). */
  inquiryEmail: 'rcolourlab123@gmail.com',
  emails: ['rcolourlab123@gmail.com'],
  instagram: 'rainbowlabjbp',
  instagramUrl: 'https://www.instagram.com/rainbowlabjbp/',
  gst: '23ACIPA1110D1ZS',
  iec: '1100000101',
}

/** Home hero mosaic with refreshed product photography from `images 2`. */
export const homeHeroLogo = images2('Home page', 'Rachit - 01.png')

export const homeHeroCollage = [
  images2('Home page', 'upper section', '4.jpg'),
  images2('Home page', 'upper section', 'Digital-Print-Glass-5.jpg'),
  images2('Home page', 'upper section', '218a72c4a23114ce896210679c8f5c99.jpg'),
  images2('Home page', 'upper section', 'a220c3c5762981505c8ac07ebb7bc068.jpg'),
  images2('Home page', 'upper section', '17a0a0019381d063d867856f9734afab.jpg'),
  images2('Home page', 'upper section', '20ee6bf29266ccd5aa300904ace3c9a4.jpg'),
]

/** Split / secondary band (single strong image). */
export const homeSplitImage = images2('Machine images', 'Main Image .JPG')

export const homeAboutImage = images2('Home page', 'shop_image.jpeg')

export const aboutSecondaryImage = images2('About us', 'IMG-20250911-WA0021.jpg')

export const homeStoryImages = folderImages('Home page', {
  first: ['Main Image 2.JPG', '000004.jpg', '000003.JPG'],
  exclude: ['Rachit - 01.psd', 'Rachit - 01.png', 'shop_image.jpeg', 'Only machines images.jpg'],
})

export const homeAdvertisementImages = [
  images2('ADVERTISEMENT', 'RAINBOW-2.jpg'),
  images2('ADVERTISEMENT', 'a0c593af9483e8b49bdb939ce3110589.jpg'),
  images2('ADVERTISEMENT', 'rainbow.jpg'),
  images2('ADVERTISEMENT', 'c2ef4a9b07ddfa4028857c3ed34a1b0a.jpg'),
  images2('Home page', 'upper section', 'IMG-20260108-WA0014.jpg'),
]

export const homeAdvertisementVideos = [
  images2('ADVERTISEMENT', 'led frame.mp4'),
  images2('ADVERTISEMENT', 'booklet frame.mp4'),
  images2('Home page', 'acrylic printing.mp4'),
  images2('Home page', 'Magic mug.mp4'),
]

export const homeAdvertisementVideoPosters = [
  images2('ADVERTISEMENT', 'RAINBOW-2.jpg'),
  images2('ADVERTISEMENT', 'c2ef4a9b07ddfa4028857c3ed34a1b0a.jpg'),
  images2('Acrylic printing', 'cube_acr5.jpg'),
  images2('Magic mug', 'new magic mug.jpg'),
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
    image: images2('Home page', '000004.jpg'),
    to: '/services#photo-printing',
  },
  {
    title: 'Custom gifts',
    description: 'Mugs, magic mugs, tees, cushions, and keyrings with your artwork.',
    image: images2('Home page', 'Custom Gift Main', 'this.jpg'),
    to: '/services#custom-gifts',
  },
  {
    title: 'Photobook & album kits',
    description: '5-in-1 combos, acrylic boxes, wedding-ready packaging.',
    image: images2('Home page', 'Photobook and album kits', '3.webp'),
    to: '/services#photobook-album',
  },
  {
    title: 'Lamination & framing',
    description: 'Protect prints and finish them with designer-ready frames.',
    image: images2('Home page', 'Lamination and Prinitng', '91e764de8acc29b413b80b46680fef48.jpg'),
    to: '/services#lamination-framing',
  },
]

export { machineCatalog } from './machineCatalog'
