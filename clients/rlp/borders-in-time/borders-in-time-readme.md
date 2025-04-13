# Borders in Time  
*Recursive Learning HTML5 Timeline Game Demo*

---

## 📚 Overview

**Borders in Time** is a playable HTML5 learning game designed to showcase the power of the Recursive Learning platform. It combines responsive SVG maps with a segmented, interactive timeline mechanic to help learners build historical reasoning through placement, sequencing, and geographic clues.

This is a demo piece—but also a modular system. The timeline logic and interactive canvas built here will be reused across future learning assets: from science diagrams to literature sequencing to narrative branching.

---

## ✉️ Kickoff Email to Asha & Cara

> **Subject:** Kickoff: “Borders in Time” – Our First Recursive Demo Game  
>
> Hi Asha and Cara,  
>
> I'm excited to kick off a new demo project that pulls together the best of our learning architecture, design thinking, and future platform potential. This is your invitation to help shape it from the ground up.  
>
> ### Project: **Borders in Time**  
> A five-step, map-based timeline game designed to live in our Recursive Learning platform. This will be a public-facing, HTML5 game that anyone can play—and it's also a modular, reusable system for many kinds of interactive learning.  
>
> ### Why it matters:
> - **For Asha**: This is your sandbox to shape the visual language of our **core learning layout**.
> - **For Cara**: This gives you a first full run at the **tab-based instructional logic** that we’re using across learning flows.
>
> ### What this project unlocks:
> 1. **The Timeline Bar** – a universal interaction pattern for sequencing ideas, events, or logic.
> 2. **The Play Bar** – a layered SVG canvas (starting with maps) where learners click, drag, and pin ideas into place.
> 3. **Replayable, social-friendly growth** – including “Map of the Week,” challenge links, leaderboards, and timed vs. relaxed game modes.
>
> I’ll follow up shortly with:
> - A human-friendly design spec  
> - Structural layout and tab logic  
> - Instructional scoring and gating model  
> - Design asset needs  
> - MVP workflow for how we’ll generate maps and clues  
>
> This is a real chance for us to show off what Recursive can be—visually, instructionally, and playfully. Let’s make something beautiful.  
>
> Best,  
> David

---

## 🧩 Components

### Timeline Play Bar (`/components/TimelinePlayBar.jsx`)
- Segmented horizontal bar for placing cards
- Snap-to behavior on hover
- Active zone highlighting and fixed submit button
- Modular and scalable: supports 3–10 zone segments

### Interactive Map (`/components/MapCanvas.jsx`)
- SVG map with hover-sensitive `<path>` zones
- Each country is an object with associated metadata: `id`, `hint`, `year`, etc.
- On click → reveals a draggable fact card

### Game Logic (`/lib/gameLogic.js`)
- Scoring rules (time + accuracy)
- Gating logic: must place correctly to proceed
- Card sequencing and snap zone mapping

---

## 🎮 Game Flow

1. **Tab 1** – Select and place first anchor card (year revealed)
2. **Tab 2+** – Place cards before/after/between known anchors
3. **Feedback** – Correct = lock and reveal; incorrect = retry
4. **Score** – Based on placement accuracy + time bonus
5. **Challenge a Friend** – Shareable link with obfuscated score

---

## 🛠️ Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/recursive-learning/borders-in-time.git
   cd borders-in-time
