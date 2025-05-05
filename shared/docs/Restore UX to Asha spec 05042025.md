 Restore UX to Asha Spec: Architecture-First Checklist
1. HTML Architecture
[ ] Use a single <main class="client-content"> container.
[ ] Inside main, have two sibling sections:
<section id="welcome-section" class="section" data-section="welcome"> (welcome tab content)
<section id="chat-section" class="section" data-section="chat"> (chat tab content)
[ ] Only one section is .active and visible at a time (JS toggles this).
[ ] Sidebar and footer are outside main and always visible.
2. Sidebar
[ ] Logo and subtitle at top
[ ] Nav links
[ ] Timestamp at bottom
[ ] Platform logo at bottom left
3. Footer
[ ] Footer content in bottom left and right corners
[ ] Social icons in bottom right
4. Tab Content: Welcome
[ ] Header: "Merit" (large, bold) and "CURRICULUM SUPPORT ASSISTANT" (subtitle, directly under)
[ ] Card: left-aligned, contains only grade selection and heading (no button inside)
[ ] Heading: two lines ("Select all that apply" and "Grade Level(s)")
[ ] Grade options: vertical list, full-width, multi-select, selected row styled
[ ] Action button: large "CREATE ASSISTANT" button in a third column, right of the card, aligned with top of card, with arrow icon
[ ] User info: avatar, name, settings at top right of viewport
5. Tab Content: Chat
[ ] Only chat UI is visible in this section
[ ] Header, card, and action button are hidden
6. Responsiveness
[ ] On small screens, stack columns vertically (sidebar, header, card, button, user info, footer)
7. Tab Switching
[ ] JS toggles .active and hidden on the two main sections based on sidebar nav clicks