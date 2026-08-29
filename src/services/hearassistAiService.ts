// HearAssist AI Educational Assistant & Multi-Key Rotation Engine

import type { Flashcard, QuizQuestion } from '../types';

export const HEARASSIST_SYSTEM_PROMPT = `
You are HearAssist Assistant, an accessible, friendly, and educational AI assistant inside the HearAssist mobile ecosystem.
Your primary role is to help users learn sign language (ASL, ISL), practical communication concepts, and accessibility education.

Key Behavioral Guidelines:
1. Explain concepts simply, clearly, and concisely using high-readability language.
2. Clearly distinguish between different sign language systems (e.g., ASL vs. Indian Sign Language ISL).
3. Do NOT invent or fabricate fake sign gestures. If you are unsure of an exact sign, recommend searching the HearAssist Learn resource database.
4. Educational Boundary & Medical Disclaimer: You provide educational explanations for communication terms. You are NOT a doctor, lawyer, or emergency responder. Always advise consulting verified medical or emergency personnel in real crises.
`;

class HearAssistAiService {
  // Pool of 10 Groq API Keys for automatic rotation & rate-limit fallback
  private groqKeys: string[] = (
    import.meta.env.VITE_GROQ_API_KEYS ||
    import.meta.env.VITE_GROQ_API_KEY ||
    ''
  ).split(',').map((k: string) => k.trim()).filter(Boolean);

  private geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // Active Key Index for round-robin rotation
  private currentGroqKeyIdx = 0;

  private getNextGroqKey(): string {
    if (this.groqKeys.length === 0) return '';
    const key = this.groqKeys[this.currentGroqKeyIdx];
    this.currentGroqKeyIdx = (this.currentGroqKeyIdx + 1) % this.groqKeys.length;
    return key;
  }

  // 1. Chat Response Generator (Multi-Key Groq Pool -> Gemini -> Local Fallback)
  public async sendChatMessage(userMessage: string, contextTopic = 'Emergency & Accessibility'): Promise<string> {
    const trimmed = userMessage.trim();
    if (!trimmed) return "Please type a question about sign language or communication.";

    // Tier 1: Try Groq API Key Pool with automatic key rotation & retry
    for (let attempt = 0; attempt < Math.min(this.groqKeys.length, 3); attempt++) {
      const apiKey = this.getNextGroqKey();
      if (!apiKey) break;

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: HEARASSIST_SYSTEM_PROMPT },
              { role: 'user', content: `Current Learning Topic Context: ${contextTopic}\nUser Question: ${trimmed}` },
            ],
            temperature: 0.6,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) return reply;
        } else {
          console.warn(`Groq key index ${this.currentGroqKeyIdx} rate limited or failed, rotating key...`);
        }
      } catch (err) {
        console.warn('Groq API call error, trying next key:', err);
      }
    }

    // Tier 2: Try Gemini API
    if (this.geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${HEARASSIST_SYSTEM_PROMPT}\n\nCurrent Learning Topic Context: ${contextTopic}\n\nUser Question: ${trimmed}` }]
            }]
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return reply;
        }
      } catch (err) {
        console.warn('Gemini API call error:', err);
      }
    }

    // Tier 3: Rich Educational AI Fallback Generator
    await new Promise((resolve) => setTimeout(resolve, 350));

    const lower = trimmed.toLowerCase();

    if (lower.includes('help') || lower.includes('emergency') || lower.includes('sos') || lower.includes('danger')) {
      return `🚨 **Emergency Sign Language Guide**:\n\n1. **HELP**: Place dominant fist (thumb up) on your non-dominant flat palm and lift upward twice.\n2. **EMERGENCY**: Form an 'E' handshape with your dominant hand and shake it rapidly near shoulder height.\n3. **HOSPITAL**: Trace a cross on your non-dominant upper arm using your index and middle fingers.\n4. **POLICE**: Make a 'C' handshape and tap over your left chest like a police badge.\n5. **FIRE**: Wiggle your fingers upward near chest height mimicking flames.\n\n*Tip: Always use wide facial expressions to signal immediate urgency!*`;
    }

    if (lower.includes('asl') || lower.includes('american')) {
      return `🤟 **ASL (American Sign Language)** is a complete, natural language used widely in North America.\n\n- Uses a one-handed manual alphabet for finger spelling.\n- Uses facial expressions for grammatical punctuation (e.g. raised eyebrows for yes/no questions).\n- Essential beginner signs: *Hello*, *Please*, *Thank You*, *Help*, *Water*.`;
    }

    if (lower.includes('isl') || lower.includes('indian')) {
      return `🇮🇳 **ISL (Indian Sign Language)** is the official sign language used across India.\n\n- Uses two-handed finger spelling for specific alphabets.\n- Shares universal natural gestures for core survival concepts like *HELP*, *WATER*, *EAT*, and *HOSPITAL*.\n- Developed by the Indian Sign Language Research and Training Centre (ISLRTC).`;
    }

    if (lower.includes('greeting') || lower.includes('hello') || lower.includes('hi') || lower.includes('meet')) {
      return `👋 **Basic Daily Greetings**:\n\n- **HELLO**: Salute outward from your forehead with a flat hand.\n- **THANK YOU**: Touch fingertips to your chin and move hand forward towards the person.\n- **PLEASE**: Rub your flat palm in a smooth clockwise circle over your chest.\n- **NICE TO MEET YOU**: Slide one flat palm over the other ("nice") then bring index fingers together ("meet").`;
    }

    if (lower.includes('medical') || lower.includes('doctor') || lower.includes('hospital') || lower.includes('pain') || lower.includes('sick')) {
      return `🏥 **Medical & Hospital Communication**:\n\n- **DOCTOR**: Tap 'M' or curved fingertips on your non-dominant wrist pulse point.\n- **PAIN / HURT**: Twist two index fingers pointing toward each other near the affected area.\n- **SICK**: Touch middle finger to forehead and other middle finger to abdomen.\n- **MEDICINE**: Rub middle finger in non-dominant palm like crushing a pill.`;
    }

    if (lower.includes('hearing') || lower.includes('aid') || lower.includes('deaf') || lower.includes('sound')) {
      return `👂 **Hearing Aid & Sound Awareness Advice**:\n\n- Keep hearing aid batteries fresh and clean wax filters regularly.\n- Use HearAssist's **Sound Awareness** mode to detect real-world doorbells, sirens, and car horns.\n- Use the **Communicate** tab for continuous live speech-to-text when talking to hearing friends!`;
    }

    // Dynamic contextual fallback
    return `📘 **${contextTopic} Insight**:\n\nTo master **${trimmed}**, practice hand shape, hand placement, and facial expression.\n\n- **Handshape**: Ensure fingers are distinct.\n- **Location**: Place hands at chest height for best visibility.\n- **Movement**: Smooth, steady motion.\n\nWould you like me to generate **Flashcards** or a **Practice Quiz** on this topic?`;
  }

  // 2. Exactly 17 Sign Language Flashcards Mapped to /images/1.gif Through /images/17.gif
  public async generateFlashcards(topic = 'Emergency Signs'): Promise<Flashcard[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.log('Generating 17 flashcards for topic:', topic);

    return [
      {
        id: 'fc-1',
        frontTopic: 'Emergency Signs',
        frontQuestion: 'What is the sign for "HELP"?',
        backAnswer: 'Lift fist (thumb up) on flat palm',
        explanation: 'Place your dominant fist with thumb pointing up on your open non-dominant palm, then lift both hands upward twice.',
        imageUrl: '/images/1.gif',
        relatedResourceId: 'res-1',
      },
      {
        id: 'fc-2',
        frontTopic: 'Emergency Signs',
        frontQuestion: 'How do you sign "EMERGENCY"?',
        backAnswer: 'Shake "E" handshape at shoulder level',
        explanation: 'Form the letter "E" with your dominant hand and shake it back and forth rapidly near shoulder height.',
        imageUrl: '/images/2.gif',
        relatedResourceId: 'res-2',
      },
      {
        id: 'fc-3',
        frontTopic: 'Emergency Signs',
        frontQuestion: 'What is the gesture for "POLICE"?',
        backAnswer: 'Tap "C" handshape over left chest',
        explanation: 'Form a "C" with your right hand and tap it over the left side of your chest (where a badge is worn).',
        imageUrl: '/images/3.gif',
        relatedResourceId: 'res-2',
      },
      {
        id: 'fc-4',
        frontTopic: 'Medical Signs',
        frontQuestion: 'How do you sign "HOSPITAL"?',
        backAnswer: 'Trace a cross on upper arm',
        explanation: 'Use the "H" handshape to draw a cross pattern on your upper non-dominant arm.',
        imageUrl: '/images/4.gif',
        relatedResourceId: 'res-3',
      },
      {
        id: 'fc-5',
        frontTopic: 'Emergency Signs',
        frontQuestion: 'How do you sign "FIRE"?',
        backAnswer: 'Wiggle fingers upward mimicking flames',
        explanation: 'Hold open hands in front of body and wiggle fingers while moving hands up and down alternatingly.',
        imageUrl: '/images/5.gif',
        relatedResourceId: 'res-2',
      },
      {
        id: 'fc-6',
        frontTopic: 'Emergency Signs',
        frontQuestion: 'How do you sign "DANGER"?',
        backAnswer: 'Swipe thumbs-up upward past knuckles',
        explanation: 'Make a thumbs-up with non-dominant hand, then brush dominant thumbs-up upward past non-dominant knuckles.',
        imageUrl: '/images/6.gif',
        relatedResourceId: 'res-2',
      },
      {
        id: 'fc-7',
        frontTopic: 'Medical Signs',
        frontQuestion: 'How do you sign "DOCTOR"?',
        backAnswer: 'Tap fingertips on inside wrist',
        explanation: 'Tap the fingertips of your dominant bent-hand on the inside wrist of your non-dominant arm (like taking a pulse).',
        imageUrl: '/images/7.gif',
        relatedResourceId: 'res-3',
      },
      {
        id: 'fc-8',
        frontTopic: 'Medical Signs',
        frontQuestion: 'How do you communicate "PAIN / HURT"?',
        backAnswer: 'Jab index fingertips toward each other',
        explanation: 'Bring two index fingers together repeatedly near the location of discomfort.',
        imageUrl: '/images/8.gif',
        relatedResourceId: 'res-3',
      },
      {
        id: 'fc-9',
        frontTopic: 'Emergency Signs',
        frontQuestion: 'How do you sign "STOP"?',
        backAnswer: 'Chop edge of open hand into open palm',
        explanation: 'Bring the downward edge of your dominant flat hand firmly onto the open palm of your non-dominant hand.',
        imageUrl: '/images/9.gif',
        relatedResourceId: 'res-1',
      },
      {
        id: 'fc-10',
        frontTopic: 'Everyday Signs',
        frontQuestion: 'How do you sign "WATER"?',
        backAnswer: 'Tap "W" handshape on chin',
        explanation: 'Form the letter "W" with 3 middle fingers and tap your index finger to your chin twice.',
        imageUrl: '/images/10.gif',
        relatedResourceId: 'res-5',
      },
      {
        id: 'fc-11',
        frontTopic: 'Everyday Signs',
        frontQuestion: 'How do you sign "FOOD / EAT"?',
        backAnswer: 'Tap fingertips to mouth twice',
        explanation: 'Form a flattened "O" with hand and tap fingertips against your lips twice.',
        imageUrl: '/images/11.gif',
        relatedResourceId: 'res-5',
      },
      {
        id: 'fc-12',
        frontTopic: 'Social Signs',
        frontQuestion: 'How do you sign "THANK YOU"?',
        backAnswer: 'Move open flat hand forward from chin',
        explanation: 'Touch fingertips of open flat hand to your chin and move hand forward toward the person.',
        imageUrl: '/images/12.gif',
        relatedResourceId: 'res-5',
      },
      {
        id: 'fc-13',
        frontTopic: 'Social Signs',
        frontQuestion: 'How do you sign "PLEASE"?',
        backAnswer: 'Rub flat palm in circle over chest',
        explanation: 'Place open palm flat over center of chest and move hand in smooth circular motion.',
        imageUrl: '/images/13.gif',
        relatedResourceId: 'res-5',
      },
      {
        id: 'fc-14',
        frontTopic: 'Everyday Signs',
        frontQuestion: 'How do you sign "YES"?',
        backAnswer: 'Nod fist up and down like a head',
        explanation: 'Form the letter "S" fist and nod your wrist up and down repeatedly.',
        imageUrl: '/images/14.gif',
        relatedResourceId: 'res-5',
      },
      {
        id: 'fc-15',
        frontTopic: 'Everyday Signs',
        frontQuestion: 'How do you sign "NO"?',
        backAnswer: 'Snap index & middle fingers to thumb',
        explanation: 'Extend index and middle finger and snap them down to meet your thumb twice.',
        imageUrl: '/images/15.gif',
        relatedResourceId: 'res-5',
      },
      {
        id: 'fc-16',
        frontTopic: 'Everyday Signs',
        frontQuestion: 'How do you sign "HELLO"?',
        backAnswer: 'Salute outward from forehead',
        explanation: 'Touch fingertips to forehead and move hand outward in a friendly salute.',
        imageUrl: '/images/16.gif',
        relatedResourceId: 'res-5',
      },
      {
        id: 'fc-17',
        frontTopic: 'Everyday Signs',
        frontQuestion: 'How do you sign "GOODBYE"?',
        backAnswer: 'Open & close fingers in a wave',
        explanation: 'Hold open hand up and flex fingers open and closed in a friendly farewell motion.',
        imageUrl: '/images/17.gif',
        relatedResourceId: 'res-5',
      },
    ];
  }

  // 3. Quiz Questions Mapped to /images/1.gif Through /images/17.gif
  public async generateQuiz(topic = 'Emergency Signs'): Promise<QuizQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.log('Generating quiz for topic:', topic);

    return [
      {
        id: 'qz-1',
        questionText: 'Which sign is most urgent when requesting immediate assistance in an emergency?',
        options: ['A. Goodbye', 'B. 🤟 HELP (Fist lifted on palm)', 'C. Welcome', 'D. Please'],
        correctOptionIndex: 1,
        explanation: 'The sign for HELP (lifting a thumb-up fist on a flat palm) is the primary emergency gesture.',
        imageUrl: '/images/1.gif',
      },
      {
        id: 'qz-2',
        questionText: 'What handshape is used when shaking your hand to sign "EMERGENCY"?',
        options: ['A. Letter "A"', 'B. Open Palm', 'C. 🤟 Letter "E" handshape', 'D. Index Finger'],
        correctOptionIndex: 2,
        explanation: 'EMERGENCY is signed by forming the letter "E" and shaking it back and forth at shoulder level.',
        imageUrl: '/images/2.gif',
      },
      {
        id: 'qz-3',
        questionText: 'Where do you place the "C" handshape when signing "POLICE"?',
        options: ['A. Over the forehead', 'B. 🤟 Over left chest (badge position)', 'C. Behind the ear', 'D. On the elbow'],
        correctOptionIndex: 1,
        explanation: 'POLICE is signed by tapping a "C" handshape over the left chest where an officer badge is located.',
        imageUrl: '/images/3.gif',
      },
      {
        id: 'qz-4',
        questionText: 'How do you communicate "PAIN / HURT" to a first responder?',
        options: ['A. 🤟 Pointing index fingers toward each other near pain area', 'B. Waving goodbye', 'C. Saluting forehead', 'D. Clapping hands'],
        correctOptionIndex: 0,
        explanation: 'PAIN is communicated by jabbing two index fingers toward each other near the location of discomfort.',
        imageUrl: '/images/8.gif',
      },
      {
        id: 'qz-5',
        questionText: 'How do you trace the sign for "HOSPITAL"?',
        options: ['A. Draw a circle on palm', 'B. 🤟 Draw a cross on upper arm with "H" fingers', 'C. Touch nose twice', 'D. Clap hands'],
        correctOptionIndex: 1,
        explanation: 'HOSPITAL is signed by tracing a cross pattern on your non-dominant shoulder or upper arm with the letter "H".',
        imageUrl: '/images/4.gif',
      },
    ];
  }
}

export const hearassistAiService = new HearAssistAiService();
