export const symptomGroups = [
  [
    "generalSymptoms",
    "General",
    [
      ["fever", "Fever"],
      ["chills", "Chills"],
      ["fatigue", "Fatigue"],
      ["weakness", "Weakness"],
      ["weightChange", "Weight changes"],
      ["nightSweats", "Night sweats"],
    ],
  ],
  [
    "respiratorySymptoms",
    "Respiratory",
    [
      ["cough", "Cough"],
      ["shortnessOfBreath", "Shortness of breath"],
      ["wheezing", "Wheezing"],
      ["soreThroat", "Sore throat"],
      ["nasalCongestion", "Nasal congestion"],
      ["chestPain", "Chest pain"],
    ],
  ],
  [
    "gastrointestinalSymptoms",
    "Digestive",
    [
      ["nausea", "Nausea"],
      ["vomiting", "Vomiting"],
      ["diarrhea", "Diarrhea"],
      ["constipation", "Constipation"],
      ["abdominalPain", "Abdominal pain"],
      ["appetiteLoss", "Loss of appetite"],
    ],
  ],
  [
    "neurologicalSymptoms",
    "Neurological",
    [
      ["headache", "Headache"],
      ["dizziness", "Dizziness"],
      ["numbness", "Numbness"],
      ["confusion", "Confusion"],
      ["memoryLoss", "Memory loss"],
      ["seizures", "Seizures"],
    ],
  ],
  [
    "musculoskeletalSymptoms",
    "Muscles & joints",
    [
      ["jointPain", "Joint pain"],
      ["musclePain", "Muscle pain"],
      ["stiffness", "Stiffness"],
      ["backPain", "Back pain"],
    ],
  ],
  [
    "cardiovascularSymptoms",
    "Cardiovascular",
    [
      ["palpitations", "Palpitations"],
      ["swellinglegsAnkles", "Swelling in legs or ankles"],
      ["chestPain", "Chest pain"],
      ["acceleratedHeartbeat", "Fast heartbeat"],
    ],
  ],
  [
    "skinSymptoms",
    "Skin",
    [
      ["rash", "Rash"],
      ["itching", "Itching"],
      ["bruising", "Bruising"],
      ["wounds", "Wounds or sores"],
    ],
  ],
  [
    "psychologicalSymptoms",
    "Wellbeing",
    [
      ["anxiety", "Anxiety"],
      ["depression", "Depression"],
      ["moodSwings", "Mood swings"],
      ["sleepPatternChanges", "Changes in sleep"],
    ],
  ],
];
export const initialSymptoms = () =>
  Object.fromEntries(
    symptomGroups.map(([key, , fields]) => [
      key,
      Object.fromEntries(fields.map(([name]) => [name, false])),
    ]),
  );
export const priorityLabels = [
  "Immediate",
  "Critical",
  "Urgent",
  "Subacute",
  "Moderate",
  "Low",
  "Very low",
  "Minimal",
  "Non-urgent",
];
