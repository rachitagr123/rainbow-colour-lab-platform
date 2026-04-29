export type ServiceCategory =
  | 'Printing'
  | 'Custom Gifts'
  | 'Lamination & Framing'
  | 'Digital Restoration'
  | 'Album Products'
  | 'Industrial B2B'

export type ServiceItem = {
  name: string
  category: ServiceCategory
  description: string
  image: string
  specs: string[]
  idealFor: string
}

export const business = {
  brand: 'Rainbow Colour Lab',
  firmName: 'RAINBOW COLOUR LAB',
  proprietor: 'Sushil Kumar Agrawal',
  established: '1980s',
  legacy: '40+ years',
  address: '21 Naya Bazar, Malviya Chowk, Jabalpur, Madhya Pradesh, India, 482001',
  phones: ['+91-9425324286', '+91-9425324287', '+91-9425801886'],
  landline: '07614082458',
  emails: ['rcolourlab123@gmail.com', 'rachitagr123@gmail.com'],
  gst: '23ACIPA1110D1ZS',
  iec: '1100000101',
}

export const categories: Array<ServiceCategory | 'All'> = ['All', 'Printing', 'Custom Gifts', 'Lamination & Framing', 'Digital Restoration', 'Album Products', 'Industrial B2B']

export const serviceItems: ServiceItem[] = [
  {
    name: 'All Types of Photo Printing',
    category: 'Printing',
    description: 'High-quality photo printing with color-accurate output and premium paper options.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80',
    specs: ['Sizes from 4x6 to 30x90', 'Glossy, matte, and texture finish options', 'Fast turnaround for studio and event jobs'],
    idealFor: 'Everyday photo orders, professional studios, and event photographers.',
  },
  {
    name: 'Marriage Album Printing',
    category: 'Printing',
    description: 'Premium wedding album print production with luxury finish and durable binding.',
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80',
    specs: ['Premium page quality', 'Wedding-grade lamination', 'Custom design and cover options'],
    idealFor: 'Wedding photographers and premium wedding packages.',
  },
  {
    name: 'Photobook + HP Indigo Photobook Printing & Binding',
    category: 'Printing',
    description: 'Commercial-grade photobook and album quality with precise tones and fine detail.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80',
    specs: ['HP Indigo quality workflow', 'Professional binding', 'Retail and bulk order support'],
    idealFor: 'Professional photographers and high-end photo studios.',
  },
  {
    name: 'Mini Albums + Collage Printing',
    category: 'Printing',
    description: 'Creative compact album sets and collage products for gift and event use.',
    image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1400&q=80',
    specs: ['Pocket and mini formats', 'Custom collage layouts', 'Budget to premium options'],
    idealFor: 'Gift packages, birthdays, and quick event memories.',
  },
  {
    name: 'Corporate Printing',
    category: 'Printing',
    description: 'Professional brochures and marketing material printing for business clients.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1400&q=80',
    specs: ['Brochure and catalog printing', 'Brand color consistency', 'Bulk corporate pricing'],
    idealFor: 'Businesses, schools, institutions, and agencies.',
  },
  {
    name: 'Enlargement, Backlight, Flex, Glass, Acrylic, LED Frame Printing',
    category: 'Printing',
    description: 'Large-format display and decor printing solutions for retail and events.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=80',
    specs: ['Enlargement sizes 16x20 to 30x100', 'Indoor and outdoor media support', 'Display-ready framing options'],
    idealFor: 'Studios, showrooms, event setups, and premium home decor.',
  },
  {
    name: 'Mug Printing',
    category: 'Custom Gifts',
    description: 'Personalized mugs with durable print quality and premium gift finish.',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1400&q=80',
    specs: ['Single or bulk orders', 'Photo and logo printing', 'Gift-ready output'],
    idealFor: 'Birthdays, anniversaries, and corporate gifting.',
  },
  {
    name: 'T-Shirt, Cap, Keyring, Pillow, Magic Cushion Printing',
    category: 'Custom Gifts',
    description: 'Custom gift product range with vivid and long-lasting print results.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80',
    specs: ['Multiple gift product types', 'Branding and personal use support', 'Single to bulk order handling'],
    idealFor: 'Events, teams, gifting businesses, and personal celebrations.',
  },
  {
    name: 'All Lamination Types + Custom Framing',
    category: 'Lamination & Framing',
    description: 'Complete lamination and frame solutions to protect and elevate printed products.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1400&q=80',
    specs: ['Frame width from 1/2 inch to 8 inch', 'Framing sizes 8x12 to 20x24', 'Premium designer frame collection'],
    idealFor: 'Portraits, certificates, decor pieces, and studio displays.',
  },
  {
    name: 'Black & White to Color Restoration + Photo Mixing + Editing',
    category: 'Digital Restoration',
    description: 'Advanced restoration, recoloring, and creative edits for precious old memories.',
    image: 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1400&q=80',
    specs: ['Old photo repair', 'Colorization for heritage images', 'Creative photo compositing and retouching'],
    idealFor: 'Family archives, legacy photos, and tribute projects.',
  },
  {
    name: 'Album Products and Combo Kits',
    category: 'Album Products',
    description: 'Premium album packaging portfolio for high-end event delivery.',
    image: 'https://images.unsplash.com/photo-1510070009289-b5bc34383727?auto=format&fit=crop&w=1400&q=80',
    specs: ['2-piece acrylic box, 3-piece box', '5-in-1 combo, piano box, leather boxes', 'Wedding combo kit options'],
    idealFor: 'Wedding album businesses and premium client deliveries.',
  },
  {
    name: 'HP Indigo Machine Sales + Spares + Consumables + Imetto',
    category: 'Industrial B2B',
    description: 'Business-focused machine sales and ongoing support for print labs.',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1400&q=80',
    specs: ['Models: 5500, 5600, 7500, 7600, 10000, 12000', 'Spares, ink, blankets, PIP, machine parts', 'Imetto enlargement machine sales'],
    idealFor: 'Commercial print units and industrial photo labs.',
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
    useCase: 'High-volume premium print output with improved color consistency.',
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

export const featuredLocalImages = [
  '/images/IMG-20250911-WA0021.jpg',
  '/images/IMG-20260108-WA0014.jpg',
  '/images/IMG-20260428-WA0011.jpg',
  '/images/IMG-20260428-WA0014.jpg',
  '/images/IMG-20260428-WA0020.jpg',
  '/images/IMG_20251001_171326.jpg',
]
