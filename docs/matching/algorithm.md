# Skill Matching Algorithm

The SkillSwap Match Engine calculates a compatibility score (0 - 100%) between User A and User B based on reciprocal skill interests:

1. **Direct Reciprocal Match (50% weight)**:
   - Does User A offer a skill that User B wants?
   - Does User B offer a skill that User A wants?
   - Perfect two-way direct swap earns highest weight.

2. **Category / Interest Proximity (25% weight)**:
   - Overlap between skill categories in mutual profiles.

3. **Reputation & Review Score (15% weight)**:
   - Users with high ratings and verified badges gain higher visibility.

4. **Availability & Location Alignment (10% weight)**:
   - Matching schedules (e.g. Weekends, Evenings) and timezone proximity.

