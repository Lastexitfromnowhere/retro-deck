// RETRO-DECK MD-1 — langue FR/EN et liste d'attente. Aucun traceur, aucun appel tiers.
(function () {
  "use strict";
  var doc = document.documentElement;
  var MSG = {
    fr: {
      sending: "Envoi…",
      ok: "■ C'est noté. Merci !",
      invalid: "Cette adresse email semble invalide.",
      slow: "Un instant : réessaie dans une minute.",
      fail: "Inscription indisponible pour le moment. Réessaie plus tard."
    },
    en: {
      sending: "Sending…",
      ok: "■ Got it. Thanks!",
      invalid: "That email address looks invalid.",
      slow: "One moment: please try again in a minute.",
      fail: "Sign-up unavailable right now. Please try again later."
    }
  };

  function currentLang() { return doc.dataset.lang === "en" ? "en" : "fr"; }

  function setLang(l) {
    doc.dataset.lang = l;
    doc.lang = l;
    var t = document.querySelector("title");
    if (t && t.dataset[l]) document.title = t.dataset[l];
    var d = document.querySelector('meta[name="description"]');
    if (d && d.dataset[l]) d.content = d.dataset[l];
    [].forEach.call(document.querySelectorAll(".lang button"), function (b) {
      b.classList.toggle("on", b.dataset.l === l);
      b.setAttribute("aria-pressed", b.dataset.l === l ? "true" : "false");
    });
    try { localStorage.setItem("rd-lang", l); } catch (e) { /* facultatif */ }
  }

  var start = "fr";
  try {
    var q = new URLSearchParams(location.search).get("lang");
    var saved = localStorage.getItem("rd-lang");
    start = (q === "en" || q === "fr") ? q : saved ? saved
      : ((navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");
  } catch (e) { /* français par défaut */ }
  setLang(start);
  [].forEach.call(document.querySelectorAll(".lang button"), function (b) {
    b.onclick = function () { setLang(b.dataset.l); };
  });

  // liste d'attente : toutes les formulaires .wl envoient vers /api/waitlist (même domaine)
  [].forEach.call(document.querySelectorAll("form.wl"), function (form) {
    var msg = form.parentNode.querySelector(".msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = MSG[currentLang()];
      if (msg) msg.textContent = m.sending;
      fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.value.trim(),
          website: form.website ? form.website.value : "",
          lang: currentLang(),
          source: form.dataset.source || "site"
        })
      }).then(function (r) {
        if (r.status === 400) { if (msg) msg.textContent = m.invalid; return; }
        if (r.status === 429) { if (msg) msg.textContent = m.slow; return; }
        if (!r.ok) throw new Error(r.status);
        if (msg) msg.textContent = m.ok;
        form.reset();
      }).catch(function () { if (msg) msg.textContent = m.fail; });
    });
  });
})();
