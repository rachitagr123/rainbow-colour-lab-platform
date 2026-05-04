import { images2 } from '../lib/mediaPath'

/** Folder name includes trailing space on disk. */
const PHOTOBOOK_FOLDER = 'PhotoBookAlbum Printing '

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

/** Representative stock where local assets are not in `images 2` yet (replace anytime). */
const stock = {
  restorationBefore:
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=900&q=80',
  restorationAfter:
    'https://images.unsplash.com/photo-1566616213896-cee927a47693?auto=format&fit=crop&w=900&q=80',
  corporateBrochure:
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
  hotelMenu:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
  carBrochure:
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  glassPrint:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
  backlight:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  enlargementWall:
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
  photoPrintLab:
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
  /** Stylised “sizes on wall” look — swap for your own asset anytime. */
  photoPrintSizesAi:
    'https://image.pollinations.ai/prompt/bright%20product%20photo%20many%20rectangular%20photo%20prints%20laid%20on%20white%20table%20from%20small%20wallet%20size%20to%20one%20very%20long%20panoramic%20print%20clean%20studio%20lighting%20no%20text%20no%20logos%20vibrant%20colors/width/1200/height/675/seed/91/nologo/true',
  photoPrintStack:
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
  photoPrintPolaroids:
    'https://images.unsplash.com/photo-1513475382583-d06fd56d4f40?auto=format&fit=crop&w=1200&q=80',
  photoPrintLargeWall:
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
  acrylicVideoPoster:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
}

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
      'Professional photo prints from wallet size 4×6 inch up to dramatic wall sizes 30×90 inch. We calibrate for skin tones, deep blacks, and clean highlights on premium photo papers—gloss, matte, satin, and textured finishes. Ideal for weddings, portfolios, home walls, and studio deliveries across India.',
    specs: [
      'Sizes: 4×6 through 30×90 (and custom aspect ratios on request)',
      'Finishes: glossy, matte, lustre, fine-art texture',
      'Fast turnaround for events and bulk studio orders',
    ],
    idealFor: 'Families, photographers, students, corporates, and gifting.',
    images: [
      stock.photoPrintSizesAi,
      stock.photoPrintStack,
      stock.photoPrintPolaroids,
      stock.photoPrintLargeWall,
      stock.photoPrintLab,
    ],
  },
  {
    id: 'custom-gifts',
    title: 'Custom Gifts',
    category: 'Custom Gifts',
    intro:
      'Vivid, durable printing on everyday gift items—your photos, logos, or artwork transferred with heat or UV methods suited to each product. Perfect for birthdays, anniversaries, return gifts, and brand merchandise.',
    idealFor: 'Retail customers, corporates, schools, and event planners.',
    subsections: [
      {
        title: 'Mug printing',
        description:
          'Classic ceramic mugs with full-wrap or panel prints—dishwasher-safe options where applicable. Great for photos, quotes, and logos.',
        images: [
          images2('Normal mug', '08b5829c7d1a89fb5b9e09c0d3f960cb.jpg'),
          images2('Normal mug', '1b5ccd01c63478a90b2f18ab536c141c.jpg'),
          images2('Normal mug', '20bfb114a0c09e761c4fd88558be3b5a.jpg'),
          images2('Normal mug', '3dddf14893d680518e294aaf7fef3c68.jpg'),
          images2('Normal mug', '3f8733934086eadfb660d353c3e5f322.jpg'),
          images2('Normal mug', 'a727f917a26a3e146964241eafd4cb52.jpg'),
          images2('Normal mug', 'e3b0f74da4858c8188fc5948a436d478.jpg'),
          images2('Normal mug', 'f98579eb38bf7ace4bae9ce07f8ac551.jpg'),
        ],
      },
      {
        title: 'Magic mug',
        description:
          'Heat-reactive mugs that reveal your design when hot liquid is poured—fun surprises for gifts and promotions.',
        images: [
          images2('Magic mug', '69281c5e541965cdca725361b10dcf9b.jpg'),
          images2('Magic mug', 'a220c3c5762981505c8ac07ebb7bc068.jpg'),
        ],
        videos: [images2('Magic mug', 'Rio_Lau.mp4'), images2('Magic mug', 'fia.in_.mp4')],
        videoPosters: [
          images2('Magic mug', '69281c5e541965cdca725361b10dcf9b.jpg'),
          images2('Magic mug', 'a220c3c5762981505c8ac07ebb7bc068.jpg'),
        ],
      },
      {
        title: 'T-shirt printing',
        description:
          'Photo and vector prints on tees for teams, events, and personal style—vibrant colours on quality blanks.',
        images: [
          images2('T-shirt printing', '373df3def1e52530903e30104b0273a5.jpg'),
          images2('T-shirt printing', '7dc0ff2c7eab47ca4762b9abd00ba90c.jpg'),
          images2('T-shirt printing', 'b9e1a0c45e5abb57d176dde9955609f2.jpg'),
        ],
      },
      {
        title: 'Heart cushion',
        description:
          'Soft heart-shaped cushions personalised with your picture—romantic gifts and room décor.',
        images: [
          images2('Heart Cushion', 'ab966dae3975faae9db9a3cbbb9f0f25.jpg'),
          images2('Heart Cushion', 'f40cd67e851099b2a3e44b5f4ca577c4.jpg'),
        ],
      },
      {
        title: 'Key ring',
        description:
          'Compact acrylic keyrings with sharp prints—affordable keepsakes for events and couples.',
        images: [
          images2('Keyring', 'IMG-20260428-WA0047.jpg'),
          images2('Keyring', '62b69cd00bbd8d6aa672b635c22df82c.jpg'),
          images2('Keyring', '5432f51ac07b2388edc668a6e11ac2a5.jpg'),
        ],
      },
    ],
  },
  {
    id: 'lamination-framing',
    title: 'Lamination & Framing',
    category: 'Lamination & Framing',
    intro:
      'Protect prints from moisture, UV fading, and handling while giving them a gallery-ready finish. Pair lamination with custom framing—from slim modern profiles to bold designer mouldings—to suit portraits, certificates, wedding enlargements, and artwork.',
    specs: [
      'Thermal lamination in popular thicknesses',
      'Custom frame styles and mount colours',
      'Guidance on size, glass vs acrylic, and wall display',
    ],
    idealFor: 'Homes, offices, studios, schools, and retail display.',
    images: [
      images2('Photo frame', '0f849ffe7d346bcabd401c9b41b300df.jpg'),
      images2('Photo frame', '23f88efbf04d85eda9a5a6448f1563d4.jpg'),
      images2('Photo frame', '363e638ed0734d399180d944309d4612.jpg'),
      images2('Photo frame', '5071b3e0b832d4d8a113b67e9981d7ad.jpg'),
      images2('Photo frame', '91e764de8acc29b413b80b46680fef48.jpg'),
      images2('Photo frame', 'a5854376e82395ee59eafbb1c414e870.jpg'),
      images2('Photo frame', 'a78fbb7401d2e91c1ad33ff3b1249b0c.jpg'),
      images2('Photo frame', 'c9cdd08974f5f208eb2f0a4713595231.jpg'),
      images2('Photo frame', 'e46946caafcadd0212f6569ed9854b66.jpg'),
      images2('Photo frame', 'f9f580c730d592b9b9e4a0a74f2cbb2e.jpg'),
    ],
    videos: [images2('Photo frame', 'A_Crafty_Affaire.mp4'), images2('Photo frame', 'Giftbox_india.mp4')],
    videoPosters: [
      images2('Photo frame', '0f849ffe7d346bcabd401c9b41b300df.jpg'),
      images2('Photo frame', '5071b3e0b832d4d8a113b67e9981d7ad.jpg'),
    ],
  },
  {
    id: 'digital-restoration',
    title: 'Digital Restoration',
    category: 'Digital Restoration',
    intro:
      'Bring damaged, faded, or monochrome heritage photos back to life. We remove scratches and stains, rebuild missing areas, balance exposure, and—where you wish—add natural colour so faces and fabrics read true to memory.',
    specs: [
      'B&W to colour and selective colour',
      'Noise reduction, sharpening, and tear repair',
      'High-resolution files suitable for printing and albums',
    ],
    idealFor: 'Family archives, memorial tributes, and anniversary surprises.',
    images: [stock.restorationBefore, stock.restorationAfter],
  },
  {
    id: 'photobook-album',
    title: 'Photobook & Album',
    category: 'Photobook & Albums',
    intro:
      'Premium photobooks and wedding album systems with matched packaging—designed so your final delivery feels as good as the images inside. We help you pick formats, papers, and box combinations that match your budget and brand.',
    idealFor: 'Wedding photographers, families, and premium retail.',
    subsections: [
      {
        title: '5 in 1 combo',
        description:
          'Value combo kits that bundle popular print products—great for couples who want album pieces plus extras like calendars and small gifts in one coordinated package.',
        images: [
          images2('5 in 1 combo', 'IMG-20260108-WA0014.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0014.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0016.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0020.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0026.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0027.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0028.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0046.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0048.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0049.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0051.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0053.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0054.jpg'),
          images2('5 in 1 combo', 'IMG-20260428-WA0056.jpg'),
        ],
      },
      {
        title: '2 piece box (full size acrylic 12×18)',
        description:
          'Sleek two-part acrylic presentation for large spreads—showcase album covers and hero prints with a luxury feel.',
        images: [
          images2('2 peace box, full size acrylic (12x18)', 'IMG-20260314-WA0004.jpg'),
          images2('2 peace box, full size acrylic (12x18)', 'IMG-20260314-WA0010.jpg'),
          images2('2 peace box, full size acrylic (12x18)', 'IMG-20260428-WA0015.jpg'),
          images2('2 peace box, full size acrylic (12x18)', 'IMG-20260428-WA0019.jpg'),
          images2('2 peace box, full size acrylic (12x18)', 'IMG-20260428-WA0038.jpg'),
          images2('2 peace box, full size acrylic (12x18)', 'IMG-20260428-WA0039.jpg'),
          images2('2 peace box, full size acrylic (12x18)', 'IMG-20260428-WA0052.jpg'),
        ],
      },
      {
        title: '3 piece box cover',
        description:
          'Layered rigid box sets with separate cover components—ideal for premium wedding deliveries and upsell kits.',
        images: [
          images2('3 peace box cover', 'IMG-20260314-WA0000.jpg'),
          images2('3 peace box cover', 'IMG-20260314-WA0002.jpg'),
          images2('3 peace box cover', 'IMG-20260314-WA0005.jpg'),
          images2('3 peace box cover', 'IMG-20260314-WA0009.jpg'),
          images2('3 peace box cover', 'IMG-20260314-WA0012.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0001.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0009.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0012.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0013.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0018.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0029.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0030.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0033.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0036.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0037.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0040.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0045.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0050.jpg'),
          images2('3 peace box cover', 'IMG-20260428-WA0055.jpg'),
          images2('3 peace box cover', 'IMG_20251001_171326.jpg'),
          images2('3 peace box cover', 'IMG_20251001_171426.jpg'),
          images2('3 peace box cover', 'IMG_20251001_171528.jpg'),
          images2('3 peace box cover', 'IMG_20251001_171558.jpg'),
          images2('3 peace box cover', 'IMG_20251001_171734.jpg'),
          images2('3 peace box cover', 'IMG_20251001_171745.jpg'),
          images2('3 peace box cover', 'IMG_20251001_171848.jpg'),
          images2('3 peace box cover', 'IMG_20251001_171944.jpg'),
        ],
      },
      {
        title: 'Wedding combo kit',
        description:
          'Curated wedding delivery: album-style books, wall calendar, keyrings, and box combinations—everything coordinated for one memorable handover.',
        images: [
          images2('5 in 1 combo', 'IMG-20260428-WA0048.jpg'),
          images2('Calendar', 'IMG-20260428-WA0041.jpg'),
          images2('Keyring', 'cc251ee9d999a04cf058601ada39a4ec.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0042.jpg'),
        ],
      },
    ],
    images: [
      images2(PHOTOBOOK_FOLDER, '11dd80f990af41468692b5a49d2e20eb.jpg'),
      images2(PHOTOBOOK_FOLDER, '195cc4be6f0d1346f758c9c2d11d7864.jpg'),
      images2(PHOTOBOOK_FOLDER, '92f475cb7acacd19b2a1d3fa84d5ba56.jpg'),
      images2(PHOTOBOOK_FOLDER, 'IMG-20260428-WA0022.jpg'),
      images2(PHOTOBOOK_FOLDER, 'IMG-20260428-WA0025.jpg'),
      images2(PHOTOBOOK_FOLDER, 'IMG-20260428-WA0034.jpg'),
    ],
    videos: [images2('Album video', 'VID-20260502-WA0003.mp4')],
    videoPosters: [images2(PHOTOBOOK_FOLDER, 'IMG-20260428-WA0022.jpg')],
  },
  {
    id: 'acrylic-printing',
    title: 'Acrylic Printing',
    category: 'Acrylic Printing',
    intro:
      'Face-mounted or direct-print acrylic displays with depth, gloss, and modern minimal edges—perfect for lobby art, wedding hero panels, and retail windows.',
    idealFor: 'Studios, homes, showrooms, and premium gifting.',
    videos: [
      images2('Acrylic printing', 'VID-20260502-WA0000.mp4'),
      images2('Acrylic printing', 'VID-20260502-WA0001.mp4'),
      images2('Acrylic printing', 'VID-20260502-WA0002.mp4'),
    ],
    videoPosters: [
      stock.acrylicVideoPoster,
      stock.acrylicVideoPoster,
      stock.acrylicVideoPoster,
    ],
  },
  {
    id: 'album-bags',
    title: 'Album Bags & Accessories',
    category: 'Album Bags & Accessories',
    intro:
      'Protect and present finished albums with D-cut bags and leather-look covers—professional finishing that clients notice the moment they pick up the package.',
    idealFor: 'Wedding labs, album studios, and premium retail.',
    subsections: [
      {
        title: 'D-cut bag combo',
        description: 'Structured bags with comfortable handles and space for album sets and add-ons.',
        images: [
          images2('D-cut bag combo', 'IMG-20260428-WA0005.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0008.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0011.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0023.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0032.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0035.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0042.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0043.jpg'),
          images2('D-cut bag combo', 'IMG-20260428-WA0044.jpg'),
        ],
      },
      {
        title: 'Leather bag cover',
        description: 'Rich leather-finish covers for luxury presentation and long-term storage.',
        images: [
          images2('Lather bag cover', 'IMG-20260428-WA0000.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0002.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0003.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0004.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0006.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0007.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0010.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0017.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0021.jpg'),
          images2('Lather bag cover', 'IMG-20260428-WA0031.jpg'),
        ],
      },
    ],
  },
  {
    id: 'corporate-printing',
    title: 'Corporate Printing',
    category: 'Corporate Printing',
    intro:
      'Consistent brand colour on brochures, leaflets, menus, and sales kits—short runs or bulk for launches, dealerships, hospitality, and institutions.',
    specs: ['Brand-critical colour checks', 'Folded and stitched finishing', 'Bulk pricing for repeat corporate clients'],
    idealFor: 'Automotive, hospitality, education, and agencies.',
    images: [stock.corporateBrochure, stock.carBrochure, stock.hotelMenu],
  },
  {
    id: 'enlargement-printing',
    title: 'Enlargement Printing',
    category: 'Enlargement Printing',
    intro:
      'Large-format photo enlargements for walls, stages, and retail—including sizes up to 30×90 inch with careful file prep so big prints stay sharp and grain-controlled.',
    specs: ['File prep and cropping guidance', 'Indoor display media options', 'Pair with lamination or framing'],
    idealFor: 'Weddings, offices, showrooms, and home statement walls.',
    images: [stock.enlargementWall, images2('5 in 1 combo', 'IMG-20260428-WA0056.jpg')],
    videos: [images2('Enlargement machine', 'VID-20260502-WA0004.mp4')],
    videoPosters: [images2('5 in 1 combo', 'IMG-20260428-WA0056.jpg')],
  },
  {
    id: 'glass-printing',
    title: 'Glass Printing',
    category: 'Glass Printing',
    intro:
      'Printed or film-applied graphics on glass for signage, partitions, and décor—crisp detail with a premium architectural look. Share dimensions and indoor vs outdoor use for the right specification.',
    idealFor: 'Offices, retail façades, and designer interiors.',
    images: [stock.glassPrint],
  },
  {
    id: 'backlight-printing',
    title: 'Backlight Printing',
    category: 'Backlight Printing',
    intro:
      'Translucent prints designed for LED panels and lightboxes—vivid colour that wakes up when illuminated. Ideal for menus, retail posters, and exhibition graphics.',
    idealFor: 'Cafés, malls, exhibitions, and night-visible signage.',
    images: [stock.backlight],
  },
  {
    id: 'machine-sales',
    title: 'Machine sales & spares',
    category: 'Machine Sales',
    intro:
      'HP Indigo digital presses, genuine spares, consumables, blankets, PIP, and enlargement hardware including Imetto—sold with practical advice from a working lab. Product photos on the machine page stay easy to update when you supply final shots.',
    specs: [
      'HP Indigo family: 5500 through 12000 (ask for current availability)',
      'Imetto enlargement systems — see video on the machine sales page',
      'Consumables and parts support for commercial buyers',
    ],
    idealFor: 'Photo labs, print entrepreneurs, and industrial print units across India.',
  },
]

export function sectionSearchBlob(section: ServiceSection): string {
  const parts = [
    section.title,
    section.intro,
    section.idealFor ?? '',
    ...(section.specs ?? []),
    ...(section.subsections?.flatMap((s) => [s.title, s.description]) ?? []),
  ]
  return parts.join(' ').toLowerCase()
}
