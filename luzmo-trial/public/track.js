// Trial funnel events. Every event goes to window.dataLayer (Google Tag Manager, Segment and most
// tag managers read it) and fires a "luzmo-trial-event" DOM event. Set window.LUZMO_TRIAL_TRACK_URL
// (in public/trial-settings.js) to also POST events to your own endpoint. No keys are ever sent.
(function () {
  const started = Date.now();
  const sid = Math.random().toString(36).slice(2, 10);
  const send = (name, props = {}) => {
    const event = { event: `luzmo_trial_${name}`, name, ...props, session: sid, t: Date.now(), sinceStartMs: Date.now() - started };
    try { (window.dataLayer = window.dataLayer || []).push(event); } catch { /* ignore */ }
    try { window.dispatchEvent(new CustomEvent('luzmo-trial-event', { detail: event })); } catch { /* ignore */ }
    const url = window.LUZMO_TRIAL_TRACK_URL;
    if (url) {
      try {
        const body = JSON.stringify(event);
        if (!(navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'application/json' })))) fetch(url, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      } catch { /* ignore */ }
    }
    if (window.LUZMO_TRIAL_DEBUG) console.debug('[trial]', event);
  };
  // Activation: setup finished plus one of AI question, dashboard edit or export in the same session.
  const done = new Set();
  const track = (name, props) => {
    send(name, props);
    done.add(name);
    if (!done.has('activated') && done.has('setup_finished') && ['ai_question_asked', 'dashboard_saved', 'edit_opened', 'export_created', 'schedule_created'].some((n) => done.has(n))) {
      done.add('activated');
      send('activated');
    }
  };
  window.LuzmoTrack = track;
})();
