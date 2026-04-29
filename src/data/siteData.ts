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
  { name: 'All Types of Photo Printing', category: 'Printing', description: 'Premium prints in vivid color and accurate tones.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Marriage Album Printing', category: 'Printing', description: 'Luxury wedding album printing with lasting finish.', image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Photobook Printing', category: 'Printing', description: 'Story-driven photobooks for families and professionals.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80' },
  { name: 'HP Indigo Album Printing & Binding', category: 'Printing', description: 'Commercial-grade precision print and binding quality.', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Mini Albums', category: 'Printing', description: 'Compact albums for gifts and event memories.', image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Corporate Printing', category: 'Printing', description: 'Brochures, branding collateral, and business prints.', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Enlargement Printing', category: 'Printing', description: 'Large format prints from 16x20 to 30x100.', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Acrylic Printing', category: 'Printing', description: 'Modern acrylic mounts for premium visual impact.', image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Mug Printing', category: 'Custom Gifts', description: 'Personalized mugs for gifting and branding.', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'T-Shirt Printing', category: 'Custom Gifts', description: 'Custom apparel for events, brands, and personal use.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Pillow & Magic Cushion Printing', category: 'Custom Gifts', description: 'Photo pillows and reveal-effect cushions.', image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Custom Keyrings & Caps', category: 'Custom Gifts', description: 'High-volume personalized accessories.', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80' },
  { name: 'All Lamination Types', category: 'Lamination & Framing', description: 'Protective lamination for long-term durability.', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Custom Framing', category: 'Lamination & Framing', description: 'Frames from 1/2 inch to 8 inch and 8x12 to 20x24.', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Black & White to Color Restoration', category: 'Digital Restoration', description: 'Advanced recoloring for old heritage photographs.', image: 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Photo Mixing & Edits', category: 'Digital Restoration', description: 'Creative photo blending and enhancement workflows.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Acrylic / Leather / Piano Album Boxes', category: 'Album Products', description: 'Premium packaging and wedding combo kits.', image: 'https://images.unsplash.com/photo-1510070009289-b5bc34383727?auto=format&fit=crop&w=1200&q=80' },
  { name: 'HP Indigo Machine Sales (5500-12000)', category: 'Industrial B2B', description: 'Sourcing and consultation for Indigo presses.', image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Machine Spares & Consumables', category: 'Industrial B2B', description: 'Trusted spare parts, ink, blankets, and PIP supply.', image: 'https://images.unsplash.com/photo-1581093804475-577d72e13c89?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Imetto Enlargement Machine Sales', category: 'Industrial B2B', description: 'Industrial enlargement systems for pro labs.', image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80' },
]

export const featuredLocalImages = [
  '/images/IMG-20250911-WA0021.jpg',
  '/images/IMG-20260108-WA0014.jpg',
  '/images/IMG-20260428-WA0011.jpg',
  '/images/IMG-20260428-WA0014.jpg',
  '/images/IMG-20260428-WA0020.jpg',
  '/images/IMG_20251001_171326.jpg',
]
