import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAstroProject } from './astroGenerator.js';
import { BusinessBrief } from '../../src/types/index.js';

const baseBrief: BusinessBrief = {
  businessName: 'Studio Medico Dr. Rossi',
  slug: 'dr-rossi-implantologia',
  industry: 'Odontoiatria Specialistica',
  serviceToPromote: 'Implantologia a carico immediato',
  landingType: 'optin',
  businessGoal: 'Prenotazione prima visita e TAC 3D',
  targetAudience: 'Pazienti con edentulia parziale o totale',
  geographicArea: 'Bologna',
  primaryOffer: 'Prima visita diagnostica con TAC 3D inclusa',
  realBenefits: ['Tecnologia computer-guidata', 'Denti fissi in 24 ore'],
  primaryCtaLabel: 'Richiedi Disponibilità Visita',
  primaryCtaType: 'form',
  primaryCtaDestination: '/api/lead',
  contactMethod: 'form',
  availableMaterials: {
    logoAvailable: true,
    hasRealPhotos: true,
    hasVerifiedTestimonials: true,
  },
};

test('generateAstroProject produces complete standalone Astro code for opt-in landing', () => {
  const result = generateAstroProject({ brief: baseBrief });

  assert.ok(result.packageJson.includes('astro'));
  assert.ok(result.astroConfig.includes('defineConfig'));
  assert.ok(result.indexAstro.includes('OptinForm'));
  assert.ok(result.layoutAstro.includes('Studio Medico Dr. Rossi'));
  assert.ok(result.components['OptinForm.astro']);
  assert.ok(result.components['Hero.astro']);
  assert.ok(result.robotsTxt.includes('User-agent'));
  assert.ok(result.sitemapXml.includes('urlset'));
});

test('generateAstroProject produces OfferPricing for seller landing', () => {
  const sellerBrief: BusinessBrief = {
    ...baseBrief,
    landingType: 'seller',
    primaryCtaType: 'whatsapp',
    primaryCtaDestination: 'https://wa.me/393331234567',
  };

  const result = generateAstroProject({ brief: sellerBrief });
  assert.ok(result.indexAstro.includes('OfferPricing'));
  assert.ok(result.components['OfferPricing.astro']);
});
