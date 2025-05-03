# Restore UX to Asha Spec (May 3, 2025)

## Review Summary

- Baseline commit: 2e5fe957e06a460844a3b764541f8795b873bae1
- Last good UX commit: a105a92eb59a3ad24663875b0e83f6df0cf53453
- Many changes between these commits affected layout, CSS, and chat logic.
- Some improvements (typography, grade selection, chat UI) are worth cherry-picking, but core layout and cascading were broken by too many overlapping CSS files and variable conflicts.

## Action Plan

1. **Restore baseline layout and CSS structure**
   - Use only essential global CSS in `elpl/assets/css/`
   - Limit `merit/assets/css/` to chat-specific and avatar styles
   - Remove redundant or conflicting variables and imports

2. **Cherry-pick improvements**
   - Typography and font improvements (from 92038bb and related commits)
   - Grade selection UI/UX (star icons, multi-select, validation)
   - Chat message alignment, avatars, and date separators
   - Responsive layout fixes (sidebar, header, footer)
   - Button and color fixes (ELPL red, white text, etc.)

3. **Incrementally reapply and test**
   - After each cherry-pick, verify layout and UX against Asha's spec
   - Ensure no CSS conflicts or overrides
   - Confirm chat and welcome flows work as intended

## Target Welcome Tab UX (from screenshots)

- Sidebar: White, EL Education logo, "Professional Learning" subtitle, vertical nav (Welcome, Chat). Welcome is selected with left border.
- Main Area:
  - Background: Light blue (#eaf6fa or similar)
  - Header: Large "Merit" in EL red, "CURRICULUM SUPPORT ASSISTANT" subtitle
  - Section Title: "Customize your assistant:" in large, bold EL red
  - Grade Card: White card with shadow, "Select all that apply", "Grade Level(s)" bold, horizontal divider, star icons for each grade, clean spacing
  - Create Assistant Button: Large, EL red, right-aligned, with arrow icon
  - User Profile: Top right, avatar, name, bell icon
  - Footer: Platform name, social icons, left-aligned logo

## Current State (as of a105a92 and live)
- Sidebar exists, but logo, subtitle, and nav styling may not match (font, color, margin, selected state)
- Main area background may be white or off-white, not light blue
- "Merit" and subtitle present, but font size, weight, and color may not match (should be much larger and bolder)
- "Customize your assistant:" may not be as bold or large as in screenshot
- Grade card may lack correct shadow, padding, or border radius; text and icons may not match
- Button may not be as large, bold, or right-aligned; arrow icon may be missing or misaligned
- User profile area may lack bell icon or correct spacing
- Footer may not have left-aligned logo, social icons, or correct copyright
- **Not responsive:** Layout does not adapt for smaller screens; button and card placement break

## Prioritized Changes Needed

1. **Fix responsiveness:**
   - Use CSS grid/flexbox for layout
   - Ensure sidebar, header, card, and button adapt for mobile/tablet
2. **Set main background color to light blue**
3. **Typography:**
   - Make "Merit" and "Customize your assistant:" much larger, bolder, and in EL red
   - Adjust subtitle font and spacing
4. **Sidebar:**
   - Match logo, subtitle, and nav styling (font, color, margin, selected state)
5. **Grade Card:**
   - Add box-shadow, border-radius, and padding
   - Style "Select all that apply" and "Grade Level(s)" as in screenshot
   - Use correct star icons and spacing for grades
6. **Button:**
   - Make "CREATE ASSISTANT" large, EL red, right-aligned, with arrow icon
   - Ensure button is in correct div and does not break on resize
7. **User Profile:**
   - Add bell icon, adjust avatar/name spacing
8. **Footer:**
   - Add left-aligned logo, social icons, and copyright

## Next Steps
- Apply changes in priority order, testing after each
- After each fix, verify against Asha's screenshot
- Ensure no CSS conflicts or overrides
- Confirm chat and welcome flows work as intended

---

## Changes Needed (to be filled in after spec is provided)

- [ ] ... 

## HTML-Only Fixes (First Pass)

After this update to merit.html, you should see:

- [ ] Main container uses semantic divs and is responsive (flex/grid structure)
- [ ] Main background color set to light blue (via class or inline style)
- [ ] Header section contains:
    - [ ] Large "Merit" heading (h1) and subtitle (h2/h3) with correct text
    - [ ] "Customize your assistant:" as a prominent heading (h2/h3)
- [ ] Grade card is a single div with:
    - [ ] "Select all that apply" and "Grade Level(s)" in correct order
    - [ ] List of grades, each with a star icon and label
- [ ] "CREATE ASSISTANT" button is in its own div, right-aligned, with arrow icon (SVG or Unicode)
- [ ] Sidebar contains:
    - [ ] EL Education logo and "Professional Learning" subtitle
    - [ ] Nav items for Welcome and Chat, with Welcome selected
- [ ] User profile area in header: avatar, name, bell icon
- [ ] Footer div present (even if empty for now)
- [ ] All sections use semantic HTML (header, main, nav, section, footer, etc.)
- [ ] No duplicate or unnecessary divs
- [ ] No inline event handlers (move to JS in next step)
- [ ] No console errors related to missing elements (e.g., footer) 