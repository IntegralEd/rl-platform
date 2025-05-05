// clients/elpl/merit/assets/js/client-merit-instructional-flow.js
// Lightweight two‑tab controller (welcome ▸ chat)
// --------------------------------------------------
import { MeritOpenAIClient } from './client-merit-openai.js';

export class MeritInstructionalFlow {
  #cfg = {
    sections: ['welcome', 'chat'],
        assistant: {
            id: window.env.MERIT_ASSISTANT_ID,
            project: window.env.OPENAI_PROJECT_ID,
            org: window.env.MERIT_ORG_ID
        },
    api: window.env.RL_API_GATEWAY_ENDPOINT
    };

  #el = {};
  #state = { sec: 'welcome' };
  #client;

  constructor () { document.addEventListener('DOMContentLoaded', () => this.#init()); }

  /* ---------- helpers ---------- */
  #q = (id) => document.getElementById(id);

  /* ---------- init ---------- */
  #init () {
    this.#el = {
      secs: [...document.querySelectorAll('[data-section]')],
      nav:  [...document.querySelectorAll('.client-nav__item')],
      grades: [...document.querySelectorAll('.grade-option')],
      next: this.#q('nextButton')
    };

    try { this.#client = new MeritOpenAIClient(); } catch { /* dev‑mode, ignore */ }

    this.#bindWelcome();
    this.#bindNav();
    this.#show('welcome');
  }

  /* ---------- welcome logic ---------- */
  #bindWelcome () {
    const sel = new Set();
    const upd = () => {
      // Enable next button only if at least one grade is selected
      this.#el.next.disabled = !sel.size;
      this.#el.next.classList.toggle('enabled', !!sel.size);
    };

    this.#el.grades.forEach(g => {
      const star = g.querySelector('.star-icon');
      g.addEventListener('click', () => {
        // Single-select: clear all others
        this.#el.grades.forEach(other => {
          other.classList.remove('selected');
          other.setAttribute('aria-selected', 'false');
          const s = other.querySelector('.star-icon');
          if (s) s.textContent = '☆';
        });
        g.classList.add('selected');
        g.setAttribute('aria-selected', 'true');
        if (star) star.textContent = '★';
        sel.clear();
        sel.add(g.dataset.grade);
        upd();
        // Log selection
        console.log('Selected grade:', g.dataset.grade);
      });
      // Keyboard accessibility: Enter/Space selects
      g.addEventListener('keypress', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          g.click();
        }
      });
    });

    // Launch chat when button pressed and at least one grade is selected
    this.#el.next.addEventListener('click', (e) => {
      e.preventDefault();
      if (sel.size) this.#show('chat');
    });
    upd(); // Initial state
  }

  /* ---------- nav ---------- */
  #bindNav () {
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.client-nav__item');
    navItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const target = item.getAttribute('data-section');
        sections.forEach(sec => {
          if (sec.getAttribute('data-section') === target) {
            sec.classList.add('active');
            sec.removeAttribute('hidden');
          } else {
            sec.classList.remove('active');
            sec.setAttribute('hidden', '');
          }
        });
      });
    });
  }

  #show (id) {
    if (!this.#cfg.sections.includes(id)) return;
    this.#state.sec = id;
    this.#el.secs.forEach(s => {
      const on = s.dataset.section === id;
      s.hidden = !on;
      s.classList.toggle('active', on);
    });
    this.#el.nav.forEach(n => n.classList.toggle('active', n.dataset.section === id));
    // Toggle chat-active class on body for CSS
    document.body.classList.toggle('is-chat-active', id === 'chat');
    if (id === 'chat') this.#hydrateChat();
  }

  /* ---------- chat hydrate ---------- */
  #hydrateChat () {
    if (this.#el.send) return; // already wired
    Object.assign(this.#el, {
      send: this.#q('sendButton'),
      input: this.#q('chatInput'),
      win:  this.#q('chatWindow')
    });

    const add = (txt, me) => {
      const msg = document.createElement('div');
      msg.className = `client-chat__message ${me ? 'user' : 'assistant'}`;
      const b = document.createElement('div');
      b.className = 'client-chat__bubble';
      b.textContent = txt;
      msg.appendChild(b);
      this.#el.win.appendChild(msg);
      this.#el.win.scrollTop = this.#el.win.scrollHeight;
    };

    const send = () => {
      const txt = this.#el.input.value.trim();
      if (!txt) return;
      add(txt, true);
      this.#el.input.value = '';
      add('Dev‑echo', false);
    };

    this.#el.input.addEventListener('keypress', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    this.#el.send.addEventListener('click', send);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.meritFlow = new MeritInstructionalFlow();
});
