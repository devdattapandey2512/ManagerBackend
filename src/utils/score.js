// Scoring constants mirrored from frontend OPTIONS
export const OPTIONS = {
  occupation: [
    { label: 'Software Engineer / Good 🌟', value: 'swe_good', score: 3 },
    { label: 'Non-SWE (Acceptable) ✅', value: 'non_swe_ok', score: 2 },
    { label: 'Not Acceptable ❌', value: 'reject', score: 0 },
  ],
  looks: [
    { label: 'Perfect 🌟', value: 'perfect', score: 3 },
    { label: 'Acceptable ✅', value: 'acceptable', score: 2 },
    { label: 'Not Acceptable ❌', value: 'reject', score: 0 },
  ],
  height: [
    { label: "> 5'8\" 🌟", value: 'tall', score: 3 },
    { label: "5'6\" - 5'8\" ✅", value: 'medium', score: 2 },
    { label: "< 5'6\" 🔻", value: 'short', score: -1 },
  ],
  managedBy: [
    { label: 'Parents/Siblings 🌟', value: 'family', score: 3 },
    { label: 'Self 😐', value: 'self', score: 0 },
  ],
  native: [
    { label: 'UP 🌟', value: 'up', score: 3 },
    { label: 'Non-UP (Acceptable) ✅', value: 'non_up_ok', score: 2 },
    { label: 'Not Acceptable ❌', value: 'reject', score: 0 },
  ],
  resident: [
    { label: 'India 🌟', value: 'india', score: 3 },
    { label: 'India (Not Acceptable) ⚠️', value: 'india_reject', score: 2 },
    { label: 'Abroad 😐', value: 'abroad', score: 2 },
    { label: 'Abroad (Not Acceptable) ❌', value: 'abroad_reject', score: 0 },
  ],
  college: [
    { label: 'IIT/NIT (Good Branch) 🌟', value: 'tier1_good', score: 3 },
    { label: 'IIT/NIT (Poor Branch) ✅', value: 'tier1_poor', score: 2 },
    { label: 'Non-IIT/NIT (Acceptable) 🆗', value: 'tier2_ok', score: 1.5 },
    { label: 'Other / Acceptable 😐', value: 'tier3', score: 0 },
  ],
  surname: [
    { label: 'Acceptable 🌟', value: 'ok', score: 3 },
    { label: 'Not Acceptable ❌', value: 'reject', score: 0 },
  ],
  gotra: [
    { label: 'Non-Kashyap (Acceptable) 🌟', value: 'ok', score: 3 },
    { label: 'Kashyap 😐', value: 'kashyap', score: 1 },
    { label: 'Non-Kashyap (Not Acceptable) ❌', value: 'reject', score: 0 },
  ],
  food: [
    { label: 'Vegetarian 🌟', value: 'veg', score: 3 },
    { label: 'Eggetarian 😐', value: 'egg', score: 1 },
    { label: 'Non-Vegetarian 🔻', value: 'nonveg', score: -1 },
  ],
  maanglik: [
    { label: 'No 🌟', value: 'no', score: 0 },
    { label: 'Yes 💀', value: 'yes', score: -100 },
  ],
  familyBackground: [
    { label: 'Excellent 🌟', value: 'excellent', score: 3 },
    { label: 'Acceptable 😐', value: 'acceptable', score: 1 },
    { label: 'Not Acceptable 💀', value: 'reject', score: -10 },
  ],
};

export function calculateScore(data) {
  let score = 0;

  const pick = (arr, val) => arr.find(o => o.value === val)?.score || 0;

  score += pick(OPTIONS.occupation, data.occupation);
  score += pick(OPTIONS.looks, data.looks);
  score += pick(OPTIONS.height, data.height);
  score += pick(OPTIONS.managedBy, data.managedBy);
  score += pick(OPTIONS.native, data.native);
  score += pick(OPTIONS.resident, data.resident);
  score += pick(OPTIONS.college, data.college);
  score += pick(OPTIONS.surname, data.surname);
  score += pick(OPTIONS.gotra, data.gotra);
  score += pick(OPTIONS.food, data.food);
  score += pick(OPTIONS.maanglik, data.maanglik);
  score += pick(OPTIONS.familyBackground, data.familyBackground);

  const age = parseFloat(data.age);
  if (!Number.isNaN(age)) {
    if (age < 26) score += 1;
    else if (age >= 26 && age < 30) score += 3;
    else if (age >= 30 && age < 32) score += 2;
    else if (age >= 32) score += 1;
  }

  const salary = parseFloat(data.salary);
  if (!Number.isNaN(salary) && !Number.isNaN(age) && age > 0) {
    const ratio = salary / age;
    if (ratio > 2) score += 3;
    else if (ratio > 1) score += 2;
    else score += 1;
  }
  return score;
}
