import { folderImages, folderMedia, images2, mergeMedia } from '../lib/mediaPath'

const PHOTO_PRINTING_FOLDER = 'Photo Printing Section ' as const

const photoPrintingImages = [
  images2(PHOTO_PRINTING_FOLDER, 'beach.jpg'),
  images2(PHOTO_PRINTING_FOLDER, '000003.JPG'),
  images2(PHOTO_PRINTING_FOLDER, '000004.jpg'),
  images2(PHOTO_PRINTING_FOLDER, 'filters_quality(80).webp'),
]

export type ServiceSubsection = {
  title: string
  description: string
  images?: string[]
  videos?: string[]
  videoPosters?: string[]
}

export type ServiceSection = {
  id: string
  title: string
  category: string
  intro: string
  idealFor?: string
  specs?: string[]
  images?: string[]
  videos?: string[]
  /** Optional poster per video (same length as `videos`); avoids black preview tiles. */
  videoPosters?: string[]
  subsections?: ServiceSubsection[]
}

const stock = {
  corporateBrochure:
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
  hotelMenu:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
  carBrochure:
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
}

function mergeImageLists(...lists: string[][]): string[] {
  return [...new Set(lists.flat())]
}

const calendarImages = folderImages('Calendar')
const digitalRestorationImages = mergeImageLists(
  folderImages('Black and white to color'),
  folderImages('Old distorted to new good one'),
)
const photoFrameShowcase = mergeMedia(
  folderMedia('Photo frame'),
  folderMedia('Photo frame/Sub', {
    first: ['All types of photo frame options.JPG'],
  }),
)
const photobookShowcase = mergeMedia(folderMedia('PhotoBookAlbum Printing '), folderMedia('Album video'))
const acrylicShowcase = folderMedia('Acrylic printing')
const glassShowcase = folderMedia('Glass')
const enlargementShowcase = folderMedia('Enlargement machine', {
  first: ['000004.jpg'],
})
const accessoriesShowcase = folderMedia('Excessories')

export const serviceCategories = [
  'All',
  'Photo Printing',
  'Custom Gifts',
  'Lamination & Framing',
  'Digital Restoration',
  'Photobook & Albums',
  'Acrylic Printing',
  'Album Bags & Accessories',
  'Corporate Printing',
  'Enlargement Printing',
  'Glass Printing',
  'Backlight Printing',
  'Machine Sales',
] as const

export type ServiceCategoryFilter = (typeof serviceCategories)[number]

export const serviceSections: ServiceSection[] = [
  {
    id: 'photo-printing',
    title: 'Photo Printing',
    category: 'Photo Printing',
    intro:
      'Professional photo prints from wallet size 4 x 6 inch up to dramatic wall sizes 30 x 90 inch. We calibrate for skin tones, deep blacks, and clean highlights on premium photo papers including gloss, matte, satin, and textured finishes. Ideal for weddings, portfolios, home walls, and studio deliveries across India.',
    specs: [
      'Sizes: 4 x 6 through 30 x 90, plus custom aspect ratios on request',
      'Finishes: glossy, matte, lustre, fine-art texture',
      'Fast turnaround for events and bulk studio orders',
    ],
    idealFor: 'Families, photographers, students, corporates, and gifting.',
    images: photoPrintingImages,
  },
  {
    id: 'custom-gifts',
    title: 'Custom Gifts',
    category: 'Custom Gifts',
    intro:
      'Vivid, durable printing on everyday gift items, with your photos, logos, or artwork transferred using the method best suited to each product. Perfect for birthdays, anniversaries, return gifts, and brand merchandise.',
    idealFor: 'Retail customers, corporates, schools, and event planners.',
    subsections: [
      {
        title: 'Mug printing',
        description:
          'Classic ceramic mugs with full-wrap or panel prints, including the latest video sample in the section. Great for photos, quotes, and logos.',
        ...folderMedia('Normal mug'),
      },
      {
        title: 'Magic mug',
        description:
          'Heat-reactive mugs that reveal your design when hot liquid is poured, now refreshed with the new sample images you added.',
        ...folderMedia('Magic mug', {
          first: ['new magic mug.jpg', 'new 2 magic.jpg'],
        }),
      },
      {
        title: 'T-shirt printing',
        description:
          'Photo and vector prints on tees for teams, events, and personal style, with vibrant colours on quality blanks.',
        images: folderImages('T-shirt printing'),
      },
      {
        title: 'Heart cushion',
        description:
          'Soft heart-shaped cushions personalised with your picture, now expanded with the latest photos and video samples.',
        ...folderMedia('Heart Cushion', {
          first: ['this.jpg'],
        }),
      },
      {
        title: 'Key ring',
        description:
          'Compact acrylic keyrings with sharp prints, perfect as affordable keepsakes for events and couples.',
        images: folderImages('Keyring'),
      },
      {
        title: 'Calendar',
        description:
          'Custom calendar gifts with photo-driven layouts that work beautifully for weddings, anniversaries, and year-round keepsakes.',
        images: calendarImages,
      },
    ],
  },
  {
    id: 'lamination-framing',
    title: 'Lamination & Framing',
    category: 'Lamination & Framing',
    intro:
      'Protect prints from moisture, UV fading, and handling while giving them a gallery-ready finish. Pair lamination with custom framing, from slim modern profiles to bold designer mouldings, to suit portraits, certificates, wedding enlargements, and artwork.',
    specs: [
      'Thermal lamination in popular thicknesses',
      'Custom frame styles and mount colours',
      'Guidance on size, glass vs acrylic, and wall display',
    ],
    idealFor: 'Homes, offices, studios, schools, and retail display.',
    ...photoFrameShowcase,
  },
  {
    id: 'digital-restoration',
    title: 'Digital Restoration',
    category: 'Digital Restoration',
    intro:
      'Bring damaged, faded, or monochrome heritage photos back to life. We remove scratches and stains, rebuild missing areas, balance exposure, and, where you wish, add natural colour so faces and fabrics read true to memory.',
    specs: [
      'B&W to colour and selective colour',
      'Noise reduction, sharpening, and tear repair',
      'High-resolution files suitable for printing and albums',
    ],
    idealFor: 'Family archives, memorial tributes, and anniversary surprises.',
    images: digitalRestorationImages,
  },
  {
    id: 'photobook-album',
    title: 'Photobook & Album',
    category: 'Photobook & Albums',
    intro:
      'Premium photobooks and wedding album systems with matched packaging, designed so your final delivery feels as good as the images inside. We help you pick formats, papers, and box combinations that match your budget and brand.',
    idealFor: 'Wedding photographers, families, and premium retail.',
    subsections: [
      {
        title: '5 in 1 combo',
        description:
          'Value combo kits that bundle popular print products, now expanded with the calendar samples so the full set feels coordinated.',
        images: mergeImageLists(folderImages('5 in 1 combo'), calendarImages),
      },
      {
        title: '2 piece box (full size acrylic 12 x 18)',
        description:
          'Sleek two-part acrylic presentation for large spreads, now shown with the calendar add-ons that can be bundled with the box.',
        images: mergeImageLists(folderImages('2 peace box'), calendarImages),
      },
      {
        title: '3 piece box cover',
        description:
          'Layered rigid box sets with separate cover components, ideal for premium wedding deliveries and upsell kits.',
        images: folderImages('3 peace box cover'),
      },
      {
        title: 'Wedding combo kit',
        description:
          'Curated wedding delivery with album-style books, wall calendars, keyrings, and box combinations, all coordinated for one memorable handover.',
        images: mergeImageLists(
          [folderImages('5 in 1 combo')[8] ?? folderImages('5 in 1 combo')[0]].filter(Boolean),
          [calendarImages[2] ?? calendarImages[0]].filter(Boolean),
          [folderImages('Keyring')[5] ?? folderImages('Keyring')[0]].filter(Boolean),
          [folderImages('D-cut bag combo')[6] ?? folderImages('D-cut bag combo')[0]].filter(Boolean),
        ),
      },
    ],
    ...photobookShowcase,
  },
  {
    id: 'acrylic-printing',
    title: 'Acrylic Printing',
    category: 'Acrylic Printing',
    intro:
      'Face-mounted or direct-print acrylic displays with depth, gloss, and modern minimal edges, perfect for lobby art, wedding hero panels, and retail windows.',
    idealFor: 'Studios, homes, showrooms, and premium gifting.',
    ...acrylicShowcase,
  },
  {
    id: 'album-bags',
    title: 'Album Bags & Accessories',
    category: 'Album Bags & Accessories',
    intro:
      'Protect and present finished albums with D-cut bags and leather-look covers, the kind of professional finishing clients notice the moment they pick up the package.',
    idealFor: 'Wedding labs, album studios, and premium retail.',
    subsections: [
      {
        title: 'D-cut bag combo',
        description: 'Structured bags with comfortable handles and space for album sets and add-ons.',
        images: folderImages('D-cut bag combo'),
      },
      {
        title: 'Leather bag cover',
        description: 'Rich leather-finish covers for luxury presentation and long-term storage.',
        images: folderImages('Lather bag cover'),
      },
    ],
  },
  {
    id: 'accessories',
    title: 'Accessories',
    category: 'Album Bags & Accessories',
    intro:
      'Add-on gifting extras, transparent calendar frames, booklet-style keepsakes, and fast-moving accessory ideas that pair well with album deliveries and event gifting.',
    idealFor: 'Wedding deliveries, retail counters, gifting bundles, and impulse add-ons.',
    ...accessoriesShowcase,
  },
  {
    id: 'corporate-printing',
    title: 'Corporate Printing',
    category: 'Corporate Printing',
    intro:
      'Consistent brand colour on brochures, leaflets, menus, and sales kits, whether you need short runs or bulk quantities for launches, dealerships, hospitality, and institutions.',
    specs: ['Brand-critical colour checks', 'Folded and stitched finishing', 'Bulk pricing for repeat corporate clients'],
    idealFor: 'Automotive, hospitality, education, and agencies.',
    images: [stock.corporateBrochure, stock.carBrochure, stock.hotelMenu],
  },
  {
    id: 'enlargement-printing',
    title: 'Enlargement Printing',
    category: 'Enlargement Printing',
    intro:
      'Large-format photo enlargements for walls, stages, and retail, including sizes up to 30 x 90 inch with careful file prep so big prints stay sharp and grain-controlled.',
    specs: ['File prep and cropping guidance', 'Indoor display media options', 'Pair with lamination or framing'],
    idealFor: 'Weddings, offices, showrooms, and home statement walls.',
    ...enlargementShowcase,
  },
  {
    id: 'glass-printing',
    title: 'Glass Printing',
    category: 'Glass Printing',
    intro:
      'Printed or film-applied graphics on glass for signage, partitions, and decor, with crisp detail and a premium architectural look. Share dimensions and indoor vs outdoor use for the right specification.',
    idealFor: 'Offices, retail façades, and designer interiors.',
    ...glassShowcase,
  },
  {
    id: 'backlight-printing',
    title: 'Backlight Printing',
    category: 'Backlight Printing',
    intro:
      'Translucent prints designed for LED panels and lightboxes, with vivid colour that wakes up when illuminated. Ideal for menus, retail posters, and exhibition graphics.',
    idealFor: 'Cafés, malls, exhibitions, and night-visible signage.',
    images: folderImages('BackLight'),
  },
  {
    id: 'machine-sales',
    title: 'Reconditioned machine sales & spares',
    category: 'Machine Sales',
    intro:
      'Reconditioned HP Indigo digital presses, genuine spares, consumables, blankets, PIP, and reconditioned Imetto enlargement systems, sold with practical advice from a working lab in Jabalpur.',
    specs: [
      'Reconditioned HP Indigo lineup from 3500 through 12000',
      'Reconditioned Imetto enlargement workflow hardware',
      'Consumables and parts support for commercial buyers',
    ],
    idealFor: 'Photo labs, print entrepreneurs, and industrial print units across India.',
  },
]

export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('&', ' and ')
    .replaceAll('×', ' x ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sectionSearchBlob(section: ServiceSection): string {
  const parts = [
    section.id,
    section.category,
    section.title,
    section.intro,
    section.idealFor ?? '',
    ...(section.specs ?? []),
    ...(section.subsections?.flatMap((s) => [s.title, s.description]) ?? []),
  ]
  return normalizeSearchText(parts.join(' '))
}
