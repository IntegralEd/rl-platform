# Merit E2E Integration – Next Steps (April 26, 2025)

## Context
- Backend API integration is stable and not a current blocker.
- Cara has made significant UX and icon updates to the Merit client (chat, navigation, icons, accessibility, responsive design).
- This checklist is for human QA/UX review in the browser console and UI before next API integration phase.

---

## What Changed Since Apr-22/Apr-21 Docs
- **New icons and SVGs**: Sidebar, chat actions, social links, settings, and profile now use consistent SVG assets and icon classes.
- **Class and variable standardization**: CSS variables for color, spacing, and layout; class names refactored for BEM/client convention.
- **Accessibility**: ARIA roles, keyboard navigation, screen reader support, high contrast mode, reduced motion.
- **Responsive layout**: Sidebar, header, chat, and footer adapt to mobile/tablet.
- **Profile/avatar**: Placeholder and real avatars, profile dropdown, settings button.
- **Chat input**: Action buttons for emoji, attach, send (SVG), input auto-resize (pending), loading/error states.
- **Footer**: Social icons, copyright, version.
- **Visual polish**: Button hover states, spacing, icon alignment, color contrast.
- **Console output**: Version, environment, and build info on load.

---

## Next Steps: Human Eyes/Console Review

### 1. Console Output
- [ ] Version, environment, and build info logs on page load
- [ ] No JS errors or warnings
- [ ] Console logs for navigation, chat, and error states

### 2. Visual/UX Checks
- [ ] Sidebar: icons, active state, navigation, logo
- [ ] Header: section name, profile/avatar, settings button
- [ ] Chat: input area, emoji/attach/send icons, loading/error banners
- [ ] Footer: social icons, copyright, version
- [ ] Responsive: layout adapts to mobile/tablet
- [ ] Accessibility: tab order, ARIA labels, screen reader output
- [ ] High contrast and reduced motion modes

### 3. Asset/Style Checks
- [ ] All icons are SVG, no broken images
- [ ] No hardcoded colors; all use CSS variables
- [ ] Consistent spacing, alignment, and font sizes
- [ ] Button and icon hover/focus states

### 4. Data Attributes
- [ ] All major elements have `data-test-id` for QA

---

## After Review
- Gather screenshots of any issues
- List any visual/console bugs or inconsistencies
- Prepare for API integration (next phase)

---

## Required UX and API Changes (April 26, 2025)

### UX Changes
- Grade selection must allow individual grades (K, 1, 2, 3, 4, 5) as separate options (not grouped).
- Curriculum is prefilled as 'English Language Arts (ELA)'; no selection needed for MVP.
- Intake form: Only grade selection is required for now.
- Change button text from 'Create Assistant' to 'Launch Chat'.
- After grade selection and clicking 'Launch Chat', immediately start a new chat thread and show the chat UI.

### Chat API Flow (MVP, no streaming)
1. **Create a thread**
   - `POST /v1/threads`
   - Response: `{ id: "thread_xxx", ... }`
2. **Add a message**
   - `POST /v1/threads/{thread_id}/messages` with `{ role: "user", content: [...] }`
   - Response: `{ id: "msg_xxx", ... }`
3. **Run the thread**
   - `POST /v1/threads/{thread_id}/runs` with `{ assistant_id: ..., ... }`
   - Response: event stream (for MVP, just wait for completion, no streaming UI)

### Implementation Notes
- Update @client-merit-instructional-flow.js to:
  - Render individual grade buttons (K, 1, 2, 3, 4, 5)
  - Prefill curriculum as ELA
  - Change button label to 'Launch Chat'
  - On launch, call thread/message/run API in sequence, then show chat
- Update @client-merit-openai.js to:
  - Implement the above thread/message/run API flow
  - Skip streaming for MVP; just show assistant reply when run completes

---

*These changes ensure the intake and chat flow match product requirements and backend contract for MVP.*

*This doc is for human QA before API integration. Backend is stable; focus is on front-end polish and UX.* 