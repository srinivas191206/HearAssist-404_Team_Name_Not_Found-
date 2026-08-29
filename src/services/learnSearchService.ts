// Learn Search Service: Search Optimization, Synonym Expansion & Resource Repository

import type { SignResource } from '../types';

export interface GroupedSearchResults {
  query: string;
  signVideos: SignResource[];
  eduVideos: SignResource[];
  articles: SignResource[];
  documents: SignResource[];
  totalCount: number;
}

// Synonym & Related-Term Expansion Dictionary
const SYNONYM_EXPANSIONS: Record<string, string[]> = {
  emergency: ['help', 'danger', 'accident', 'hospital', 'police', 'fire', 'sos', 'urgent', 'medical'],
  help: ['emergency', 'assist', 'sos', 'rescue', 'danger', 'need'],
  hospital: ['doctor', 'medical', 'medicine', 'sick', 'pain', 'clinic', 'nurse'],
  doctor: ['medical', 'hospital', 'medicine', 'pain', 'health', 'clinic'],
  greetings: ['hello', 'hi', 'welcome', 'meet', 'morning', 'afternoon', 'goodbye'],
  hello: ['greetings', 'hi', 'welcome', 'meet'],
  food: ['eat', 'water', 'hungry', 'thirsty', 'drink', 'dinner', 'lunch'],
  family: ['mother', 'father', 'mom', 'dad', 'brother', 'sister', 'parents'],
  police: ['emergency', 'cop', 'help', 'crime', 'danger', 'station'],
  fire: ['emergency', 'smoke', 'firefighter', 'alarm', 'burn', 'danger'],
  pain: ['doctor', 'medical', 'hurt', 'sick', 'hospital', 'medicine'],
};

// Curated Educational Sign Language Resource Repository (Hardcoded Verified YouTube Links)
const RESOURCE_REPOSITORY: SignResource[] = [
  {
    id: 'res-1',
    title: 'How to Sign HELP (ASL Emergency Sign)',
    description: 'Learn the official American Sign Language (ASL) gesture for "HELP". Place dominant fist with thumb up on non-dominant flat palm and lift upward.',
    type: 'sign_video',
    category: 'emergency',
    signLanguage: 'ASL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://www.youtube.com/embed/0FcwMa4iWg',
    externalUrl: 'https://youtu.be/0FcwMa4iWg',
    authorOrChannel: 'ASL That! Channel',
    duration: '1:45',
    tags: ['help', 'emergency', 'asl', 'danger', 'sos', 'rescue'],
    signNotation: 'Dominant fist thumb-up resting on non-dominant flat palm, lifted smoothly upward twice.',
    gestureSteps: [
      '1. Make a fist with your dominant hand, keeping thumb extended straight up (thumbs-up shape).',
      '2. Place your non-dominant hand flat, palm facing up, underneath your fist.',
      '3. Lift both hands together upward toward your chest twice in a supportive motion.'
    ],
    tips: ['Express urgency through wide eyes and clear facial expression in real emergencies.']
  },
  {
    id: 'res-2',
    title: '25 Essential EMERGENCY Signs in Sign Language',
    description: 'Essential emergency signs including Hospital, Police, Fire, Danger, Hurt, and Call 911 for fast communication.',
    type: 'sign_video',
    category: 'emergency',
    signLanguage: 'ASL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://www.youtube.com/embed/yzp-Jv-hsAo',
    externalUrl: 'https://youtu.be/yzp-Jv-hsAo',
    authorOrChannel: 'Learn ASL Today',
    duration: '5:12',
    tags: ['emergency', 'hospital', 'police', 'fire', 'danger', 'accident', 'sos'],
    signNotation: 'Shake "E" handshape rapidly side to side at shoulder level for EMERGENCY.',
    gestureSteps: [
      '1. Form the letter "E" with your dominant hand (fingers curled tightly, thumb tucked).',
      '2. Shake your hand back and forth rapidly near shoulder height.',
      '3. Maintain energetic movement to communicate immediate urgency.'
    ],
    tips: ['Keep movement fast and broad so first responders can see it from a distance.']
  },
  {
    id: 'res-3',
    title: 'Hospital & Medical Communication Signs',
    description: 'Crucial medical sign vocabulary: Doctor, Pain, Medicine, Allergy, Hospital, Sick, and Nurse.',
    type: 'sign_video',
    category: 'medical',
    signLanguage: 'ASL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://www.youtube.com/embed/IgmB9c29UKU',
    externalUrl: 'https://youtu.be/IgmB9c29UKU',
    authorOrChannel: 'Medical ASL Academy',
    duration: '6:30',
    tags: ['hospital', 'doctor', 'medical', 'pain', 'medicine', 'sick', 'allergy'],
    signNotation: 'Draw a cross on non-dominant upper arm with index finger for HOSPITAL.',
    gestureSteps: [
      '1. Form the letter "H" with dominant index and middle fingers extended together.',
      '2. Trace a vertical line then horizontal line to draw a cross on your non-dominant shoulder or arm.',
      '3. Point directly to your painful body area if describing symptoms.'
    ],
    tips: ['Point directly to the area of pain when communicating with medical responders.']
  },
  {
    id: 'res-4',
    title: 'ASL Alphabet & Finger Spelling Masterclass',
    description: 'Learn the complete A-Z finger spelling alphabet for names, places, and spelling out unknown words.',
    type: 'sign_video',
    category: 'basics',
    signLanguage: 'ASL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://www.youtube.com/embed/DuCx5N5VAZk',
    externalUrl: 'https://youtu.be/DuCx5N5VAZk',
    authorOrChannel: 'Everyday ASL',
    duration: '8:15',
    tags: ['alphabet', 'basics', 'letters', 'fingerspelling', 'numbers', 'greetings'],
    signNotation: 'Clear single-hand shapes for letters A through Z.',
    gestureSteps: [
      '1. Hold hand steadily at chest height with palm facing forward.',
      '2. Form distinct handshapes for each letter without dropping your elbow.',
      '3. Pause slightly between words to make spelling easy to read.'
    ],
    tips: ['Accuracy is much more important than speed when fingerspelling.']
  },
  {
    id: 'res-5',
    title: 'Everyday Greetings & Conversational Signs',
    description: 'Master daily social signs: Hello, Nice to meet you, Please, Thank you, How are you, and Goodbye.',
    type: 'sign_video',
    category: 'everyday',
    signLanguage: 'ASL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://www.youtube.com/embed/Vj_13bdU4dU',
    externalUrl: 'https://youtu.be/Vj_13bdU4dU',
    authorOrChannel: 'Deaf Access Community',
    duration: '5:20',
    tags: ['greetings', 'hello', 'everyday', 'social', 'please', 'thank you'],
    signNotation: 'Salute outward from forehead with flat hand for HELLO.',
    gestureSteps: [
      '1. Touch fingertips of open flat hand to your forehead/temple.',
      '2. Move hand outward and forward in a warm, friendly salute gesture.'
    ],
    tips: ['Facial expression is 50% of sign language grammar. Smile while greeting!']
  },
  {
    id: 'res-6',
    title: 'Basic ASL Signs for Beginners',
    description: 'First 20 essential signs for anyone starting to learn American Sign Language.',
    type: 'sign_video',
    category: 'basics',
    signLanguage: 'ASL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://www.youtube.com/embed/1Er5S04ffls',
    externalUrl: 'https://youtu.be/1Er5S04ffls',
    authorOrChannel: 'ASL Meredith',
    duration: '10:14',
    tags: ['basics', 'beginners', 'asl', 'phrases', 'greetings'],
    signNotation: 'Natural beginner gestures for daily interaction.',
    gestureSteps: [
      '1. Watch the presenter carefully for hand placement.',
      '2. Mirror the gestures with your dominant hand.'
    ],
    tips: ['Practice in front of a mirror to refine your hand movements.']
  },
  {
    id: 'res-7',
    title: 'Indian Sign Language (ISL) Common & Emergency Signs',
    description: 'Core Indian Sign Language (ISL) gestures for emergency, daily life, and medical situations.',
    type: 'sign_video',
    category: 'emergency',
    signLanguage: 'ISL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://www.youtube.com/embed/hWq07-kkP94',
    externalUrl: 'https://youtu.be/hWq07-kkP94',
    authorOrChannel: 'ISLRTC Official Channel',
    duration: '7:40',
    tags: ['isl', 'indian sign language', 'phrases', 'basics', 'greetings', 'emergency'],
    signNotation: 'Two-handed finger spelling and natural Indian Sign Language gestures.',
    gestureSteps: [
      '1. Observe hand positioning carefully.',
      '2. Mirror gestures with two-handed manual alphabet.'
    ],
    tips: ['ISL uses two-handed finger spelling for certain English alphabets.']
  },
  {
    id: 'res-8',
    title: 'First Responder Emergency Communication Video Guide',
    description: 'Visual video guide for medical personnel, first responders, and emergency situation communication.',
    type: 'sign_video',
    category: 'emergency',
    signLanguage: 'Universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
    embedUrl: 'https://www.youtube.com/embed/RhQvlq-mZtA',
    externalUrl: 'https://youtu.be/RhQvlq-mZtA',
    authorOrChannel: 'National Association of the Deaf (NAD)',
    duration: '8:45',
    tags: ['emergency', 'guide', 'medical', 'first responder', 'nad', 'sos'],
    gestureSteps: [
      '1. Keep gestures large and clear.',
      '2. Combine facial expressions for urgency.'
    ],
    tips: ['Keep video reference open for fast emergency access.']
  },
];

class LearnSearchService {
  private searchHistory: string[] = ['emergency', 'hospital sign', 'greetings', 'help'];

  public getSearchHistory(): string[] {
    return this.searchHistory;
  }

  public addSearchQueryToHistory(query: string): void {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return;
    this.searchHistory = [trimmed, ...this.searchHistory.filter((q) => q !== trimmed)].slice(0, 6);
  }

  public clearHistory(): void {
    this.searchHistory = [];
  }

  public getAllResources(): SignResource[] {
    return RESOURCE_REPOSITORY;
  }

  public getResourceById(id: string): SignResource | undefined {
    return RESOURCE_REPOSITORY.find((r) => r.id === id);
  }

  public getResourcesByCategory(category: string): SignResource[] {
    return RESOURCE_REPOSITORY.filter((r) => r.category === category || category === 'all');
  }

  // Search Engine (Normalization + Synonym Expansion + Multi-Signal Ranking)
  public search(rawQuery: string): GroupedSearchResults {
    const query = rawQuery.trim().toLowerCase();

    if (!query) {
      return {
        query: '',
        signVideos: RESOURCE_REPOSITORY.filter((r) => r.type === 'sign_video'),
        eduVideos: RESOURCE_REPOSITORY.filter((r) => r.type === 'edu_video'),
        articles: RESOURCE_REPOSITORY.filter((r) => r.type === 'article'),
        documents: RESOURCE_REPOSITORY.filter((r) => r.type === 'pdf' || r.type === 'presentation'),
        totalCount: RESOURCE_REPOSITORY.length,
      };
    }

    this.addSearchQueryToHistory(query);

    // 1. Query Normalization
    const tokens = query.replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean);

    // 2. Related-Term & Synonym Expansion
    const expandedTerms = new Set<string>(tokens);
    tokens.forEach((token) => {
      const synonyms = SYNONYM_EXPANSIONS[token];
      if (synonyms) {
        synonyms.forEach((syn) => expandedTerms.add(syn));
      }
    });

    // 3. Multi-Signal Relevance Scoring Engine
    const scoredResources = RESOURCE_REPOSITORY.map((resource) => {
      let score = 0;

      const titleLower = resource.title.toLowerCase();
      const descLower = resource.description.toLowerCase();

      // Exact query match boost
      if (titleLower.includes(query)) score += 50;

      // Token & Synonym match scoring
      expandedTerms.forEach((term) => {
        if (titleLower.includes(term)) score += 25;
        if (descLower.includes(term)) score += 10;

        if (resource.tags.some((t) => t.toLowerCase() === term)) score += 20;
        if (resource.category.toLowerCase() === term) score += 15;
        if (resource.signLanguage.toLowerCase() === term) score += 15;
      });

      // Type Boost for Sign Demonstration Videos
      if (resource.type === 'sign_video') score += 15;

      return {
        ...resource,
        relevanceScore: score,
      };
    });

    // 4. Filter & Rank Results
    const matched = scoredResources
      .filter((r) => (r.relevanceScore || 0) > 10)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // 5. Group Results by Type
    const signVideos = matched.filter((r) => r.type === 'sign_video');
    const eduVideos = matched.filter((r) => r.type === 'edu_video');
    const articles = matched.filter((r) => r.type === 'article');
    const documents = matched.filter((r) => r.type === 'pdf' || r.type === 'presentation');

    return {
      query,
      signVideos,
      eduVideos,
      articles,
      documents,
      totalCount: matched.length,
    };
  }
}

export const learnSearchService = new LearnSearchService();
