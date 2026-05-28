import { images2 } from '../lib/mediaPath'
import { machineSpecsById } from './machineSpecs'

const M = 'Machine images'

export type MachineCatalogEntry = {
  id: string
  model: string
  image: string
  detailsImage?: string
  summary: string
  specs?: string[]
}

function entry(
  id: string,
  model: string,
  imageFile: string,
  detailsFile: string | undefined,
  summary: string,
): MachineCatalogEntry {
  return {
    id,
    model,
    image: images2(M, imageFile),
    detailsImage: detailsFile ? images2(M, detailsFile) : undefined,
    summary,
    specs: machineSpecsById[id],
  }
}

export const defaultMachineId = 'hp-5500'

export const machineCatalog: MachineCatalogEntry[] = [
  entry(
    'hp-3500',
    'Reconditioned HP Indigo 3500',
    'HP 3500.jpg',
    'HP 3500 details.jpg',
    'Reliable reconditioned HP Indigo 3500 for commercial photo and packaging workflows.',
  ),
  entry(
    'hp-5000',
    'Reconditioned HP Indigo 5000',
    'HP 5000.jpg',
    'HP 5000 details.jpg',
    'Reconditioned HP Indigo 5000 suited for growing print labs and production floors.',
  ),
  entry(
    'hp-5500',
    'Reconditioned HP Indigo 5500',
    'HP 5500.jpg',
    'HP 5600 details.jpg',
    'Reconditioned HP Indigo 5500 with specification reference matching the 5600 series details sheet.',
  ),
  entry(
    'hp-5600',
    'Reconditioned HP Indigo 5600',
    'HP 5600.jpg',
    'HP 5600 details.jpg',
    'Production-grade reconditioned HP Indigo 5600 for scalable digital print operations.',
  ),
  entry(
    'hp-5900',
    'Reconditioned HP Indigo 5900',
    'HP 5900.jpg',
    'HP 5900 details.jpg',
    'High-capacity reconditioned HP Indigo 5900 for demanding commercial output.',
  ),
  entry(
    'hp-7500',
    'Reconditioned HP Indigo 7500',
    'HP 7500.jpg',
    'HP 7500 details.jpg',
    'Reconditioned HP Indigo 7500 for premium colour consistency and higher volume.',
  ),
  entry(
    'hp-7600',
    'Reconditioned HP Indigo 7600',
    'HP 7600.jpg',
    'HP 7500 details.jpg',
    'Reconditioned HP Indigo 7600 with specification reference matching the 7500 series details sheet.',
  ),
  entry(
    'hp-7900',
    'Reconditioned HP Indigo 7900',
    'HP 7900.jpg',
    'HP 7900 details.jpg',
    'Industrial-capable reconditioned HP Indigo 7900 for heavy production workflows.',
  ),
  entry(
    'hp-10000',
    'Reconditioned HP Indigo 10000',
    'HP 10000.jpg',
    'HP-10000 -2.jpg',
    'Large-format reconditioned HP Indigo 10000 for enterprise-level commercial output.',
  ),
  entry(
    'hp-12000',
    'Reconditioned HP Indigo 12000',
    'HP 12000.jpg',
    'HP 12000 - 2 .jpg',
    'Top-tier reconditioned HP Indigo 12000 for the highest-volume production environments.',
  ),
]
