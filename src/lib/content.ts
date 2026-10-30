export type ExerciseId = 'masseter' | 'neck' | 'upperBack';

export type Exercise = {
  id: ExerciseId;
  title: string;
  target: string;
  summary: string;
  steps: string[];
  reps: number;
  holdSeconds: number;
  restSeconds: number;
  cautions: string[];
};

export const DAILY_TARGETS = {
  exercisePracticesPerDay: 5,
  breathingSessionsPerDay: 2,
  breathingSessionMinutes: 15,
};

export const EXERCISES: Exercise[] = [
  {
    id: 'masseter',
    title: 'Jaw (Masseter) Relaxation Stretch',
    target: 'Masseters – the chewing muscles at the side of the jaw',
    summary:
      'Gently lengthens and relaxes the masseter muscles to reduce jaw muscle tension from clenching.',
    steps: [
      'Sit upright with your shoulders relaxed.',
      'Rest the tip of your tongue lightly on the roof of your mouth, just behind your upper front teeth. Lips together, teeth apart.',
      'Place your fingertips on your cheeks, over the masseter muscles just in front of your ears.',
      'Keeping your tongue on the roof of your mouth, slowly open your mouth only as far as is comfortable.',
      'Hold the gentle stretch while lightly massaging the muscles in small circles with your fingertips.',
      'Slowly close your mouth back to the rest position (teeth apart) and let your jaw go loose.',
    ],
    reps: 5,
    holdSeconds: 10,
    restSeconds: 5,
    cautions: [
      'The stretch should feel mild. Do not force your jaw open.',
      'Stop if you hear new clicking with pain or the stretch increases your jaw pain.',
    ],
  },
  {
    id: 'neck',
    title: 'Side Neck Stretch',
    target: 'Neck – upper trapezius and side neck muscles',
    summary:
      'Releases tension in the side of the neck that commonly builds up together with jaw clenching.',
    steps: [
      'Sit tall with both feet flat on the floor and shoulders relaxed down, away from your ears.',
      'Gently tuck your chin slightly, as if making a small double chin.',
      'Slowly tilt your right ear toward your right shoulder until you feel a gentle stretch on the left side of your neck.',
      'Optionally rest your right hand lightly on top of your head for a very gentle extra stretch – do not pull.',
      'Hold, breathing slowly, then return to center.',
      'Repeat on the other side. Alternate sides for each repetition.',
    ],
    reps: 4,
    holdSeconds: 20,
    restSeconds: 5,
    cautions: [
      'Keep the movement slow and gentle; never bounce.',
      'Stop if you feel tingling, numbness, dizziness, or increased pain.',
    ],
  },
  {
    id: 'upperBack',
    title: 'Upper Back Opener (Shoulder Blade Squeeze)',
    target: 'Upper back – rhomboids and mid trapezius',
    summary:
      'Counteracts forward-head and rounded-shoulder posture and relaxes the upper back.',
    steps: [
      'Sit or stand tall with your arms relaxed at your sides.',
      'Gently draw your chin back so your ears line up over your shoulders.',
      'Squeeze your shoulder blades back and down, as if trying to place them into your back pockets.',
      'Let your chest open naturally. Keep your neck and jaw relaxed (teeth apart).',
      'Hold the squeeze while breathing normally, then slowly release.',
    ],
    reps: 6,
    holdSeconds: 8,
    restSeconds: 4,
    cautions: [
      'Avoid shrugging your shoulders toward your ears.',
      'Stop if this exercise increases your pain.',
    ],
  },
];

export const exerciseById = (id: string) => EXERCISES.find((e) => e.id === id);

export const CLENCHING_EDUCATION = {
  intro:
    'Clenching and grinding are "parafunctional" habits – jaw activity that is not part of chewing, talking, or swallowing. Many people clench during the day without noticing, especially while concentrating, driving, using the phone, or feeling stressed. Sustained muscle activity in the jaw, face, and neck can increase pain in the jaw muscles (mTMD).',
  restPosition: {
    title: 'The relaxed jaw position',
    text: 'Lips together, teeth apart, tongue resting lightly on the roof of the mouth behind the upper front teeth. Your teeth should only touch briefly when you chew or swallow.',
  },
  signs: [
    'Teeth touching or pressing together',
    'Tongue pushing against the teeth',
    'Tightness in the cheeks or temples',
    'Holding the jaw forward or to one side',
    'Tension in the neck or shoulders',
  ],
};

export type StrategyId = 'alarm' | 'anchors' | 'tracking';

export const MONITORING_STRATEGIES: { id: StrategyId; title: string; description: string }[] = [
  {
    id: 'alarm',
    title: 'Recurring phone reminder',
    description:
      'A recurring alarm prompts you to check your jaw throughout the day. When it goes off, notice whether you are clenching and return to the relaxed jaw position.',
  },
  {
    id: 'anchors',
    title: 'Use existing habits as reminders',
    description:
      'Link a jaw check-in to things you already do many times a day – e.g., checking your phone, drinking water, stopping at a red light, opening email, or walking through a doorway.',
  },
  {
    id: 'tracking',
    title: 'Track clenching episodes',
    description:
      'Count each time you catch yourself clenching. Tracking builds awareness and shows patterns (times, places, activities) linked to clenching.',
  },
];

export const SUGGESTED_ANCHORS = [
  'Checking my phone',
  'Drinking water or coffee',
  'Stopping at a red light',
  'Opening email',
  'Walking through a doorway',
  'Sitting down at my desk',
  'Washing my hands',
];

export const BREATHING = {
  intro:
    'Diaphragmatic (belly) breathing uses the diaphragm rather than the chest and shoulders. Slow belly breathing increases parasympathetic ("rest and digest") activity, which helps the body and jaw muscles relax.',
  steps: [
    'Sit comfortably or lie on your back with knees bent. Relax your jaw: lips together, teeth apart.',
    'Place one hand on your upper chest and the other on your belly, just below the ribs.',
    'Breathe in slowly through your nose. Let your belly rise into your hand while the hand on your chest stays mostly still.',
    'Breathe out slowly through pursed lips or your nose, letting your belly fall.',
    'Keep the breath smooth and unforced. Follow the pacer: a little longer out than in.',
  ],
  inhaleSeconds: 4,
  exhaleSeconds: 6,
};

export const SESSION_TEXT = {
  session1Homework: [
    'Use your chosen monitoring strategies to check in on clenching throughout the day.',
    'Track the number of clenching episodes you notice each day.',
    'Practice each of the three stretches 5 times per day (about 15–30 minutes total).',
    'If an exercise increases your pain, stop doing that exercise and tell your interventionist.',
  ],
  session2Homework: [
    'Practice diaphragmatic breathing for two 15-minute sessions each day (30 minutes total).',
    'Continue clenching check-ins and the stretches as agreed with your interventionist.',
  ],
};
