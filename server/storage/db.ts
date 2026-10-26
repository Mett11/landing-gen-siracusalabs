/**
 * Persistent Storage Adapter
 * File-backed atomic JSON database for Siracusa Labs Landing Studio.
 * Stores projects, version histories, and server-side Cloudflare secrets.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Project, ProjectVersion, CloudflareSettings, BusinessBrief } from '../../src/types/index.js';
import { generateAstroProject } from '../services/astroGenerator.js';
import { runQualityAudit } from '../services/audit.js';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Ignore if already exists
  }
}

// Seed initial projects so the studio has instant, high-quality reference data
function getInitialSeedProjects(): Project[] {
  const brief1: BusinessBrief = {
    businessName: 'Atelier Sartoriale Barbera',
    slug: 'atelier-barbera',
    industry: 'Alta Sartoria Maschile su Misura',
    websiteUrl: 'https://atelierbarbera.it',
    serviceToPromote: 'Abito su Misura Tre Pezzi con Prima Prova Gratuita',
    landingType: 'seller',
    businessGoal: 'Generare richieste di appuntamento in atelier e contatti qualificati WhatsApp',
    targetAudience: 'Imprenditori, dirigenti e professionisti esigenti a Milano',
    geographicArea: 'Milano (Quadrilatero della Moda)',
    primaryOffer: 'Consulenza sartoriale privata di 45 minuti e prima prova su sagoma inclusa',
    realBenefits: [
      'Tessuti esclusivi Loro Piana, Ermenegildo Zegna e Vitale Barberis Canonico',
      'Oltre 42 ore di lavorazione artigianale per ogni capo',
      'Vestibilità garantita a vita con modifiche gratuite',
    ],
    primaryCtaLabel: 'Prenota Consulenza in Atelier su WhatsApp',
    primaryCtaType: 'whatsapp',
    primaryCtaDestination: 'https://wa.me/393409876543?text=Vorrei%20prenotare%20una%20consulenza%20in%20atelier',
    secondaryCtaLabel: 'Guarda i Tessuti Disponibili',
    secondaryCtaDestination: '#dettagli',
    contactMethod: 'whatsapp',
    availableMaterials: {
      logoAvailable: true,
      hasRealPhotos: true,
      reviewsCount: 38,
      hasVerifiedTestimonials: true,
      customNotes: 'Fondata nel 1984, bottega artigiana storica.',
    },
    stylePreferences: {
      aesthetic: 'editorial_luxury',
      tone: 'esclusivo',
      accentColor: '#D4AF37',
    },
    desiredSubdomain: 'atelier-barbera',
  };

  const strategy1 = {
    idealCustomerProfile: 'Professionisti 35-60 anni che non accettano il fit industriale e cercano status discreto e comodità sartoriale.',
    mainProblem: 'Gli abiti pronti si stropicciano, tirano sulle spalle e non valorizzano la silhouette.',
    desiredOutcome: 'Un abito impeccabile cucito a mano che trasmetta autorevolezza senza ostentazione.',
    valueProposition: 'Tradizione sartoriale milanese autentica: tessuti nobili e oltre 40 ore di rifinitura a mano.',
    provableDifferentiators: [
      'Bottega attiva dal 1984 nel centro di Milano',
      'Garanzia a vita sulla vestibilità e aggiusti inclusi',
      'Selezione di oltre 1.200 pezze certificate Loro Piana e Zegna',
    ],
    offerAndPositioning: 'Atelier di lusso accessibile ma rigorosamente artigianale, con accesso solo su appuntamento.',
    mainObjections: [
      { objection: 'I tempi di attesa sono troppo lunghi?', counterArgument: 'Consegna garantita in 21 giorni lavorativi con 2 prove intermedie.' },
      { objection: 'E se la vestibilità cambia nel tempo?', counterArgument: 'Tutti gli aggiusti futuri sono gratuiti per tutta la durata del capo.' },
    ],
    availableProof: ['38 recensioni verificate a 5 stelle su Google Maps', 'Foto storiche della sartoria e campioni fisici'],
    persuasiveAngle: 'L’eleganza autentica non si compra in boutique prêt-à-porter: si costruisce sulla tua persona.',
    conversionFunnelPath: ['Hero autorevole', 'Criticità abiti industriali', 'Vantaggi artigianato puro', 'Listino e tempi', 'FAQ obiezioni', 'CTA WhatsApp diretta'],
    primaryCta: 'Prenota Consulenza in Atelier su WhatsApp',
    secondaryCta: 'Scopri il Metodo Sartoriale',
    narrativeStructure: [
      { sectionKey: 'hero', title: 'Hero Esclusivo', objective: 'Catturare attenzione qualificata', keyPoints: ['Posizionamento lusso', 'CTA WhatsApp'] },
      { sectionKey: 'problem', title: 'Il compromesso industriale', objective: 'Evidenziare i difetti del fast tailoring', keyPoints: ['Cuciture incollate', 'Tessuti sintetici'] },
      { sectionKey: 'solution', title: 'La via dell’Atelier', objective: 'Presentare il valore del fatto a mano', keyPoints: ['42 ore di mano d’opera', 'Pezze nobili'] },
      { sectionKey: 'offer', title: 'Pacchetto Completo su Misura', objective: 'Trasparenza dell’offerta', keyPoints: ['Prezzo trasparente', 'Prima prova inclusa'] },
      { sectionKey: 'faq', title: 'Domande e Risposte', objective: 'Risolvere dubbi su tempi e modifiche', keyPoints: ['21 giorni di consegna'] },
    ],
    croHypotheses: [
      'Il contatto diretto WhatsApp riduce del 60% la frizione rispetto a un form lungo per clienti alto-spendenti.',
      'Dichiarare le 42 ore di lavorazione artigianale giustifica il prezzo e filtra i curiosi.',
    ],
    concepts: [
      {
        id: 'concept-1',
        title: 'Atelier Privato & Status Silenzioso (Consigliato)',
        angle: 'Focus su artigianalità nobile, riservatezza e fitting sartoriale.',
        pros: 'Massima credibilità ed esclusività per target alto-spendente.',
        cons: 'Richiede clienti che apprezzano il valore del tempo e dell’artigianato.',
        recommendedFor: 'Target professionisti, avvocati, manager e sposi raffinati.',
        selected: true,
      },
      {
        id: 'concept-2',
        title: 'Velocità & Precisione Moderna',
        angle: 'Focus su consegna in 21 giorni e scansione digitale delle misure.',
        pros: 'Attrattivo per professionisti con poco tempo.',
        cons: 'Rischia di sembrare meno romantico ed esclusivo.',
        recommendedFor: 'Clientela corporate ad alto ritmo.',
        selected: false,
      },
    ],
    selectedConceptId: 'concept-1',
    approved: true,
    approvedAt: new Date().toISOString(),
    version: 1,
  };

  const copy1 = {
    language: 'it',
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero' as const,
        eyebrow: 'MILANO — VIA MONTENAPOLEONE',
        headline: 'L’abito perfetto non esiste nei negozi. Esiste solo cucito sulla tua silhouette.',
        subheadline: 'Oltre 42 ore di maestria sartoriale milanese, tessuti Loro Piana e Zegna, e una garanzia a vita sulla vestibilità.',
        ctaText: 'Richiedi il tuo Fitting su WhatsApp',
        ctaSecondaryText: 'Esplora la Collezione Tessuti',
        badge: 'SOLO SU APPUNTAMENTO PRIVATO',
        guaranteeText: 'Prima prova e rettifiche future gratuite a vita.',
      },
      {
        id: 'problem',
        type: 'problem_agitation' as const,
        eyebrow: 'IL COMPROMESSO INDUSTRIALE',
        headline: 'Perché anche i migliori completi prêt-à-porter non cadono mai a pennello?',
        subheadline: 'Le taglie standard sono studiate per la media statistica, non per la postura e le proporzioni uniche del tuo corpo.',
        bulletPoints: [
          'Tessuti termoadesivati che perdono struttura dopo pochi lavaggi a secco',
          'Spalle rigide e maniche imprecise che limitano i movimenti naturali',
          'Mancanza di un sarto di fiducia che conosca l’evoluzione delle tue misure',
        ],
      },
      {
        id: 'solution',
        type: 'solution_value' as const,
        eyebrow: 'IL METODO BARBERA',
        headline: 'Tre prove intermedie per una vestibilità anatomica e senza pieghe',
        subheadline: 'Dalla prima presa misure su tela di prova fino alla cucitura a mano delle asole con filo di seta.',
        bulletPoints: [
          'Tessuti Nobili Certificati: Solo lane ritorte fino a Super 180s, cachemire e sete naturali.',
          'Costruzione Interamente intelata: Nessun adesivo sintetico, il capo respira e dura decenni.',
          'Modifiche e Assistenza a Vita: Se il tuo peso cambia, rettifichiamo l’abito gratuitamente.',
        ],
      },
      {
        id: 'how',
        type: 'how_it_works' as const,
        headline: 'Come nasce il tuo capo esclusivo',
        bulletPoints: [
          '1. Incontro riservato in atelier per la scelta di tessuto, taglio e dettagli personali',
          '2. Realizzazione del cartamodello su misura e prima prova su sagoma grezza',
          '3. Rifinitura a mano e consegna del completo finito entro 21 giorni',
        ],
      },
      {
        id: 'offer',
        type: 'offer_pricing' as const,
        headline: 'Proposte Sartoriali Dedicate',
        subheadline: 'Prezzi chiari comprensivi di tutte le prove, fodere in pura seta e asole aperte a mano.',
        pricingCards: [
          {
            name: 'Completo Business Due Pezzi',
            price: 'da € 1.450',
            features: [
              'Tessuto 100% Lana Vergine Super 130s',
              'Costruzione semintelata leggera',
              '2 prove di conformazione in atelier',
              'Consegna custodia da viaggio inclusa',
            ],
            ctaText: 'Prenota su WhatsApp',
          },
          {
            name: 'Tre Pezzi Cerimonia & Gala',
            price: 'da € 2.100',
            features: [
              'Tessuto Loro Piana o Vitale Barberis Canonico',
              'Gilet abbinato su misura',
              'Costruzione interamente intelata a mano',
              'Garanzia di vestibilità a vita',
            ],
            ctaText: 'Richiedi Disponibilità Fitting',
            isPopular: true,
          },
        ],
      },
      {
        id: 'faq',
        type: 'faq' as const,
        headline: 'Domande Frequenti sulla Sartoria su Misura',
        faqItems: [
          {
            question: 'Quanto tempo richiede la realizzazione completa?',
            answer: 'Dalla prima presa misure alla consegna finale trascorrono circa 3-4 settimane, con due prove intermedie fissate secondo la tua agenda.',
          },
          {
            question: 'Posso portare un modello fotografico di ispirazione?',
            answer: 'Certamente. Durante il primo incontro analizzeremo insieme i dettagli stilistici (revers, tasche, spalle morbide o strutturate) per personalizzarlo sulla tua fisionomia.',
          },
        ],
      },
      {
        id: 'final_cta',
        type: 'final_cta' as const,
        headline: 'Prenota la tua prima sessione sartoriale a Milano',
        subheadline: 'Senza alcun obbligo di acquisto: incontra il Maestro Sarto e tocca con mano i campionari esclusivi.',
        ctaText: 'Scrivici su WhatsApp per Concordare l’Orario',
      },
    ],
  };

  const design1 = {
    aesthetic: 'editorial_luxury' as const,
    themeColors: {
      background: '#0D1117',
      foreground: '#E6EDF3',
      card: '#161B22',
      cardForeground: '#FFFFFF',
      primary: '#C5A059',
      primaryForeground: '#000000',
      accent: '#E5C158',
      muted: '#8B949E',
      border: '#30363D',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap',
      headingWeight: '700',
      typeScaleRatio: '1.25',
    },
    visualLayout: {
      heroLayout: 'split_statement' as const,
      containerWidth: 'max-w-6xl',
      borderRadius: 'rounded-2xl',
      verticalSpacing: 'py-24',
      buttonStyle: 'geometric_sharp' as const,
    },
    cardStyle: 'bordered' as const,
  };

  const astroCode1 = generateAstroProject({
    brief: brief1,
    strategy: strategy1 as any,
    copywriting: copy1,
    designPlan: design1,
  });

  const audit1 = runQualityAudit({
    brief: brief1,
    copywriting: copy1,
    designPlan: design1,
    astroCode: astroCode1,
  });

  const p1: Project = {
    id: 'proj_barbera_1984',
    brief: brief1,
    status: 'ready',
    strategy: strategy1 as any,
    copywriting: copy1,
    designPlan: design1,
    astroCode: astroCode1,
    auditResults: audit1,
    cloudflare: {
      projectName: 'atelier-barbera-landing',
      subdomain: 'atelier-barbera',
      status: 'none',
      history: [],
    },
    versions: [
      {
        versionId: 'v1_initial',
        versionNumber: 1,
        createdAt: new Date().toISOString(),
        description: 'Bozza strategica iniziale approvata',
        snapshot: {
          brief: brief1,
          strategy: strategy1 as any,
          copywriting: copy1,
          designPlan: design1,
          astroCode: astroCode1,
          auditResults: audit1,
        },
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Project 2: Opt-in / Call booking
  const brief2: BusinessBrief = {
    businessName: 'Dott.ssa Elena Valenti — Odontoiatria Estetica',
    slug: 'elena-valenti-sorriso',
    industry: 'Odontoiatria Estetica & Ortodonzia Invisibile',
    websiteUrl: 'https://studiovalenti.it',
    serviceToPromote: 'Check-Up Estetico del Sorriso con Scansione Digitale 3D',
    landingType: 'optin',
    businessGoal: 'Acquisire lead qualificati per prime visite con simulazione estetica del sorriso',
    targetAudience: 'Adulti 25-55 anni che desiderano allineare o sbiancare i denti senza apparecchi visibili',
    geographicArea: 'Roma (Parioli)',
    primaryOffer: 'Check-up estetico completo con scansione 3D e simulazione digitale del risultato',
    realBenefits: [
      'Nessuna impronta tradizionale con pasta sgradevole',
      'Anteprima 3D del tuo futuro sorriso prima di iniziare il percorso',
      'Oltre 12 anni di specializzazione esclusiva in allineamento invisibile',
    ],
    primaryCtaLabel: 'Prenota il tuo Check-up 3D Gratuito',
    primaryCtaType: 'form',
    primaryCtaDestination: '/api/lead',
    contactMethod: 'form',
    availableMaterials: {
      logoAvailable: true,
      hasRealPhotos: true,
      reviewsCount: 64,
      hasVerifiedTestimonials: true,
      customNotes: 'Studio moderno con scanner intraorale iTero Element 5D.',
    },
    stylePreferences: {
      aesthetic: 'architectural_modern',
      tone: 'scientifico',
      accentColor: '#0EA5E9',
    },
    desiredSubdomain: 'valenti-sorriso',
  };

  const strategy2 = {
    idealCustomerProfile: 'Uomini e donne a Roma che provano disagio per denti affollati o macchiati ma temono trattamenti invasivi.',
    mainProblem: 'La paura del dolore, dei costi poco chiari e l’ansia di indossare piastrine metalliche antiestetiche.',
    desiredOutcome: 'Un sorriso armonioso e allineato ottenuto in modo discreto e con tecnologia all’avanguardia.',
    valueProposition: 'Simula il tuo nuovo sorriso in 3D prima di scegliere: precisione digitale e trasparenza totale.',
    provableDifferentiators: [
      'Scanner intraorale iTero 5D: rendering tridimensionale immediato',
      'Oltre 700 casi trattati con certificazione Diamond Invisalign',
      'Piani di pagamento rateali a tasso zero concordati prima dell’avvio',
    ],
    offerAndPositioning: 'Poliambulatorio premium focalizzato sull’estetica dentale minimamente invasiva.',
    mainObjections: [
      { objection: 'L’apparecchio invisibile funziona anche per casi complessi?', counterArgument: 'Nel 95% dei casi sì: lo scanner 3D determina la fattibilità in tempo reale.' },
      { objection: 'Ci sono costi nascosti per radiografie o controlli?', counterArgument: 'La prima sessione con scansione 3D è a tariffa fissa promozionale senza obblighi.' },
    ],
    availableProof: ['64 recensioni a 5 stelle certificate su MioDottore', 'Certificazione Invisalign Diamond Provider'],
    persuasiveAngle: 'Vedi il risultato finale in anteprima 3D ancor prima di decidere.',
    conversionFunnelPath: ['Promessa 3D', 'Differenza rispetto ai metodi tradizionali', 'Form di qualificazione veloce', 'Recensioni pazienti', 'CTA invio'],
    primaryCta: 'Prenota il tuo Check-up 3D',
    secondaryCta: 'Scopri come funziona la Scansione Digitale',
    narrativeStructure: [
      { sectionKey: 'hero', title: 'Hero Visuale', objective: 'Chiarire la proposta di valore immediata', keyPoints: ['Anteprima 3D', 'Roma Parioli'] },
      { sectionKey: 'problem', title: 'I timori dei trattamenti classici', objective: 'Empatizzare con l’ansia', keyPoints: ['Niente impronte tradizionali'] },
      { sectionKey: 'solution', title: 'La Scansione Digitale', objective: 'Mostrare la tecnologia', keyPoints: ['Simulazione immediata'] },
      { sectionKey: 'form', title: 'Candidatura Check-up', objective: 'Raccogliere contatti qualificati', keyPoints: ['Form breve'] },
      { sectionKey: 'faq', title: 'FAQ Pazienti', objective: 'Risolvere dubbi clinici', keyPoints: ['Durata e rate'] },
    ],
    croHypotheses: [
      'Offrire la simulazione 3D senza impegno trasforma i lead freddi in appuntamenti reali in studio con un tasso del 40%+.',
    ],
    concepts: [
      {
        id: 'concept-1',
        title: 'Scienza Digitale & Trasparenza 3D (Consigliato)',
        angle: 'Focus su innovazione medica, assenza di dolore e visualizzazione immediata.',
        pros: 'Altissima fiducia e qualificazione del paziente.',
        cons: 'Richiede che il paziente venga fisicamente in studio.',
        recommendedFor: 'Tutti i pazienti interessati ad allineamento estetico.',
        selected: true,
      },
    ],
    selectedConceptId: 'concept-1',
    approved: true,
    approvedAt: new Date().toISOString(),
    version: 1,
  };

  const copy2 = {
    language: 'it',
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: 'hero',
        type: 'hero' as const,
        eyebrow: 'ROMA PARIOLI — ODONTOIATRIA DIGITALE',
        headline: 'Scopri come sarà il tuo sorriso prima ancora di iniziare il trattamento.',
        subheadline: 'Prenota il check-up estetico con scansione 3D intraorale: anteprima visiva immediata, senza paste sgradevoli né impegno.',
        ctaText: 'Richiedi il Check-Up con Scansione 3D',
        badge: 'DISPONIBILITÀ LIMITATA QUESTA SETTIMANA',
        guaranteeText: 'Referto e simulazione 3D consegnati direttamente sul tuo smartphone.',
      },
      {
        id: 'problem',
        type: 'problem_agitation' as const,
        eyebrow: 'IL VECCHIO MODO DI ANDARE DAL DENTISTA',
        headline: 'Perché rimandi da mesi l’allineamento del tuo sorriso?',
        subheadline: 'Le vecchie impronte con pasta nauseante e la paura di interventi dolorosi bloccano milioni di persone.',
        bulletPoints: [
          'Paura di spendere cifre elevate senza avere certezza del risultato estetico finale',
          'Fastidio per apparecchi metallici visibili che creano imbarazzo in contesti professionali',
          'Preventivi poco chiari con costi imprevisti per ogni controllo successivo',
        ],
      },
      {
        id: 'solution',
        type: 'solution_value' as const,
        eyebrow: 'LA NOSTRA TECNOLOGIA',
        headline: 'Scansione digitale a luce ottica in meno di 60 secondi',
        subheadline: 'Uno scanner ad alta definizione cattura 6.000 fotogrammi al secondo per generare il modello tridimensionale della tua bocca.',
        bulletPoints: [
          'Zero Fastidio: Nessun calco in gesso o materiale plastico in bocca.',
          'Simulazione Immediata: Visualizza l’allineamento progressivo prima e dopo su schermo touch.',
          'Mascherine Trasparenti Quasi Invisibili: Rimovibili per mangiare e lavare i denti in totale libertà.',
        ],
      },
      {
        id: 'how',
        type: 'how_it_works' as const,
        headline: 'Il percorso del tuo nuovo sorriso',
        bulletPoints: [
          '1. Scansione 3D ad alta definizione e diagnosi estetica completa',
          '2. Presentazione del piano terapeutico e simulazione digitale fotorealistica',
          '3. Consegna degli allineatori trasparenti personalizzati',
        ],
      },
      {
        id: 'form',
        type: 'optin_form' as const,
        headline: 'Richiedi il tuo appuntamento per la scansione 3D',
        subheadline: 'Compila il form per verificare i giorni liberi e ricevere conferma dal nostro team entro 2 ore lavorative.',
        ctaText: 'Conferma Richiesta Check-Up',
      },
      {
        id: 'faq',
        type: 'faq' as const,
        headline: 'Domande dei Pazienti sull’Allineamento Invisibile',
        faqItems: [
          {
            question: 'La scansione 3D è dolorosa o emette radiazioni?',
            answer: 'Assolutamente no. Utilizza una telecamera ottica a luce visibile, completamente innocua anche per donne in gravidanza.',
          },
          {
            question: 'È possibile rateizzare il costo del trattamento?',
            answer: 'Sì, offriamo convenzioni per piani rateali mensili a tasso zero personalizzabili in base alle tue esigenze.',
          },
        ],
      },
      {
        id: 'final_cta',
        type: 'final_cta' as const,
        headline: 'Il primo passo per ritrovare la sicurezza nel tuo sorriso',
        subheadline: 'Ti aspettiamo nel nostro studio a Roma Parioli in un ambiente confortevole e rilassante.',
        ctaText: 'Prenota la Scansione 3D Ora',
      },
    ],
  };

  const design2 = {
    aesthetic: 'architectural_modern' as const,
    themeColors: {
      background: '#090D16',
      foreground: '#F1F5F9',
      card: '#0F172A',
      cardForeground: '#FFFFFF',
      primary: '#0284C7',
      primaryForeground: '#FFFFFF',
      accent: '#38BDF8',
      muted: '#94A3B8',
      border: '#1E293B',
    },
    typography: {
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap',
      headingWeight: '800',
      typeScaleRatio: '1.2',
    },
    visualLayout: {
      heroLayout: 'centered_impact' as const,
      containerWidth: 'max-w-5xl',
      borderRadius: 'rounded-3xl',
      verticalSpacing: 'py-20',
      buttonStyle: 'pill' as const,
    },
    cardStyle: 'elevated_subtle' as const,
  };

  const astroCode2 = generateAstroProject({
    brief: brief2,
    strategy: strategy2 as any,
    copywriting: copy2,
    designPlan: design2,
  });

  const audit2 = runQualityAudit({
    brief: brief2,
    copywriting: copy2,
    designPlan: design2,
    astroCode: astroCode2,
  });

  const p2: Project = {
    id: 'proj_valenti_roma',
    brief: brief2,
    status: 'ready',
    strategy: strategy2 as any,
    copywriting: copy2,
    designPlan: design2,
    astroCode: astroCode2,
    auditResults: audit2,
    cloudflare: {
      projectName: 'valenti-sorriso-roma',
      subdomain: 'valenti-sorriso',
      status: 'none',
      history: [],
    },
    versions: [
      {
        versionId: 'v1_initial',
        versionNumber: 1,
        createdAt: new Date().toISOString(),
        description: 'Configurazione iniziale e check diagnostico',
        snapshot: {
          brief: brief2,
          strategy: strategy2 as any,
          copywriting: copy2,
          designPlan: design2,
          astroCode: astroCode2,
          auditResults: audit2,
        },
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return [p1, p2];
}

function normalizeProject(project: Project): Project {
  if (project.designPlan) {
    if (!project.designPlan.visualLayout) {
      project.designPlan.visualLayout = {
        heroLayout: 'split_statement',
        containerWidth: 'max-w-6xl',
        borderRadius: 'rounded-2xl',
        verticalSpacing: 'py-24',
        buttonStyle: 'geometric_sharp',
      };
    } else {
      if (!project.designPlan.visualLayout.heroLayout) {
        project.designPlan.visualLayout.heroLayout = 'split_statement';
      }
      if (!project.designPlan.visualLayout.buttonStyle) {
        project.designPlan.visualLayout.buttonStyle = 'geometric_sharp';
      }
      if (!project.designPlan.visualLayout.borderRadius) {
        project.designPlan.visualLayout.borderRadius = 'rounded-2xl';
      }
      if (!project.designPlan.visualLayout.containerWidth) {
        project.designPlan.visualLayout.containerWidth = 'max-w-6xl';
      }
      if (!project.designPlan.visualLayout.verticalSpacing) {
        project.designPlan.visualLayout.verticalSpacing = 'py-24';
      }
    }
  }
  return project;
}

export async function listProjects(): Promise<Project[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(PROJECTS_FILE, 'utf-8');
    const projects: Project[] = JSON.parse(raw);
    return projects.map(normalizeProject);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      const seeded = getInitialSeedProjects();
      await fs.writeFile(PROJECTS_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
      return seeded.map(normalizeProject);
    }
    console.error('Error reading projects:', err);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await listProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function saveProject(project: Project): Promise<Project> {
  await ensureDataDir();
  const normalized = normalizeProject(project);
  const projects = await listProjects();
  const existingIdx = projects.findIndex((p) => p.id === normalized.id);

  normalized.updatedAt = new Date().toISOString();

  if (existingIdx >= 0) {
    projects[existingIdx] = normalized;
  } else {
    projects.unshift(normalized);
  }

  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  await ensureDataDir();
  const projects = await listProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  return true;
}

export async function createVersionSnapshot(projectId: string, description: string): Promise<ProjectVersion | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const currentVersions = project.versions || [];
  const nextNum = currentVersions.length + 1;
  const version: ProjectVersion = {
    versionId: `v${nextNum}_${Date.now()}`,
    versionNumber: nextNum,
    createdAt: new Date().toISOString(),
    description: description || `Versione ${nextNum}`,
    snapshot: {
      brief: JSON.parse(JSON.stringify(project.brief)),
      strategy: project.strategy ? JSON.parse(JSON.stringify(project.strategy)) : undefined,
      copywriting: project.copywriting ? JSON.parse(JSON.stringify(project.copywriting)) : undefined,
      designPlan: project.designPlan ? JSON.parse(JSON.stringify(project.designPlan)) : undefined,
      astroCode: project.astroCode ? JSON.parse(JSON.stringify(project.astroCode)) : undefined,
      auditResults: project.auditResults ? JSON.parse(JSON.stringify(project.auditResults)) : undefined,
    },
  };

  project.versions = [version, ...currentVersions];
  await saveProject(project);
  return version;
}

export async function restoreVersionSnapshot(projectId: string, versionId: string): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const version = project.versions.find((v) => v.versionId === versionId);
  if (!version) return null;

  // Restore snapshot data
  project.brief = JSON.parse(JSON.stringify(version.snapshot.brief));
  if (version.snapshot.strategy) project.strategy = JSON.parse(JSON.stringify(version.snapshot.strategy));
  if (version.snapshot.copywriting) project.copywriting = JSON.parse(JSON.stringify(version.snapshot.copywriting));
  if (version.snapshot.designPlan) project.designPlan = JSON.parse(JSON.stringify(version.snapshot.designPlan));
  if (version.snapshot.astroCode) project.astroCode = JSON.parse(JSON.stringify(version.snapshot.astroCode));
  if (version.snapshot.auditResults) project.auditResults = JSON.parse(JSON.stringify(version.snapshot.auditResults));

  await saveProject(project);
  return project;
}

// Server-side Cloudflare settings
export async function getCloudflareSettings(): Promise<CloudflareSettings> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err: any) {
    return {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
      baseDomain: process.env.CLOUDFLARE_BASE_DOMAIN || 'pages.dev',
      zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
    };
  }
}

export async function saveCloudflareSettings(settings: CloudflareSettings): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}
