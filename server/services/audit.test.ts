import test from 'node:test';
import assert from 'node:assert/strict';
import { runQualityAudit } from './audit.js';
import { BusinessBrief, CopywritingPlan } from '../../src/types/index.js';

const mockBrief: BusinessBrief = {
  businessName: 'Atelier Sartoriale Barbera',
  slug: 'atelier-barbera',
  industry: 'Sartoria su misura di lusso',
  serviceToPromote: 'Abiti su misura fatti a mano',
  landingType: 'seller',
  businessGoal: 'Richiesta di appuntamento in atelier',
  targetAudience: 'Professionisti e imprenditori esigenti',
  geographicArea: 'Milano e Nord Italia',
  primaryOffer: 'Consulenza di stile e primo fitting sartoriale gratuito',
  realBenefits: ['Tessuti Loro Piana e Zegna', 'Oltre 40 ore di lavorazione artigianale'],
  primaryCtaLabel: 'Prenota il tuo Fitting',
  primaryCtaType: 'whatsapp',
  primaryCtaDestination: 'https://wa.me/393401234567',
  contactMethod: 'whatsapp',
  availableMaterials: {
    logoAvailable: true,
    hasRealPhotos: true,
    hasVerifiedTestimonials: true,
  },
};

const mockCopy: CopywritingPlan = {
  language: 'it',
  generatedAt: new Date().toISOString(),
  sections: [
    {
      id: 's1',
      type: 'hero',
      headline: "L'eleganza su misura autentica nel cuore di Milano",
      subheadline: 'Abiti cuciti a mano secondo la tradizione artigianale italiana.',
      ctaText: 'Prenota Fitting Gratuito',
    },
  ],
};

test('runQualityAudit passes with complete verified data', () => {
  const result = runQualityAudit({
    brief: mockBrief,
    copywriting: mockCopy,
  });

  assert.equal(result.passed, true);
  assert.equal(result.blockingCount, 0);
  assert.ok(result.score >= 80);
});

test('runQualityAudit flags blocking failure on empty H1 and missing CTA destination', () => {
  const brokenBrief: BusinessBrief = {
    ...mockBrief,
    primaryCtaDestination: '',
  };
  const brokenCopy: CopywritingPlan = {
    language: 'it',
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: 's1',
        type: 'hero',
        headline: '', // Missing H1
      },
    ],
  };

  const result = runQualityAudit({
    brief: brokenBrief,
    copywriting: brokenCopy,
  });

  assert.equal(result.passed, false);
  assert.ok(result.blockingCount >= 2);
});

test('runQualityAudit flags placeholders as blocking', () => {
  const placeholderCopy: CopywritingPlan = {
    language: 'it',
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: 's1',
        type: 'hero',
        headline: "Lorem ipsum dolor sit amet consectetur [TODO]",
      },
    ],
  };

  const result = runQualityAudit({
    brief: mockBrief,
    copywriting: placeholderCopy,
  });

  assert.equal(result.passed, false);
  const placeholderCheck = result.checks.find((c) => c.id === 'placeholder-detection');
  assert.ok(placeholderCheck);
  assert.equal(placeholderCheck?.severity, 'blocking');
});
