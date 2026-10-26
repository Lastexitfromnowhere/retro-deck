// Pack de fiches offert contre un email. Les blocs marqués [data-pack] restent CACHÉS tant que le Worker
// n'annonce pas que l'envoi d'emails est actif (/api/pack/config) : rien n'est promis avant que ce soit vrai.
// Aucun traceur. Seuls l'email, la langue choisie et la case cochée sont envoyés à /api/pack/subscribe.
(function () {
  "use strict";
  var T = {
    fr: {
      sending: "Envoi…",
      invalid: "Cette adresse email semble invalide.",
      slow: "Un instant : réessaie dans une minute.",
      fail: "Indisponible pour le moment. Réessaie plus tard.",
      ready: "Ton pack est prêt.",
      dl: "Télécharger le pack ",
      other: "Plutôt la version ",
      names: { fr: "française", en: "anglaise" },
      sent: "Un email avec ce lien vient de t'être envoyé (regarde aussi les indésirables). Les 2 suivants arriveront dans environ 3 et 7 jours, puis plus rien.",
      none: "Aucun autre email ne sera envoyé.",
      lang: { fr: "(français)", en: "(anglais)" }
    },
    en: {
      sending: "Sending…",
      invalid: "That email address looks invalid.",
      slow: "One moment: please try again in a minute.",
      fail: "Unavailable right now. Please try again later.",
      ready: "Your pack is ready.",
      dl: "Download the pack ",
      other: "Prefer the ",
      names: { fr: "French version", en: "English version" },
      sent: "An email with this link has just been sent to you (check your spam folder too). The next 2 will arrive in about 3 and 7 days, then nothing more.",
      none: "No other email will be sent.",
      lang: { fr: "(French)", en: "(English)" }
    }
  };
  var doc = document.documentElement;
  function lang() { return doc.lang === "en" ? "en" : "fr"; }

  var forms = [].slice.call(document.querySelectorAll("form.pack-form"));
  if (!forms.length) return;

  fetch("/api/pack/config", { cache: "no-store", credentials: "omit" })
    .then(function (r) { return r.ok ? r.json() : { emails: false }; })
    .then(function (c) {
      if (!c.emails) return;
      [].forEach.call(document.querySelectorAll("[data-pack]"), function (el) { el.hidden = false; });
      doc.classList.add("pack-on");
    })
    .catch(function () { /* fonction inactive : rien à afficher */ });

  forms.forEach(function (form) {
    var wrap = form.parentNode;
    var msg = wrap.querySelector(".pack-msg");
    var done = wrap.querySelector(".pack-done");
    var say = function (t) { if (msg) msg.textContent = t; };

    function syncRadio() {
      if (form.dataset.touched) return;
      var r = form.querySelector('input[name="pl"][value="' + lang() + '"]');
      if (r) r.checked = true;
    }
    syncRadio();
    new MutationObserver(syncRadio).observe(doc, { attributes: true, attributeFilter: ["lang"] });
    form.addEventListener("change", function (e) { if (e.target && e.target.name === "pl") form.dataset.touched = "1"; });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = T[lang()];
      var chosen = form.querySelector('input[name="pl"]:checked');
      var plang = chosen ? chosen.value : lang();
      say(m.sending);
      fetch("/api/pack/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.value.trim(),
          lang: plang,
          seq: !!(form.seq && form.seq.checked),
          website: form.website ? form.website.value : "",
          source: form.dataset.source || "pack"
        })
      }).then(function (r) {
        if (r.status === 400) { say(m.invalid); return null; }
        if (r.status === 429) { say(m.slow); return null; }
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (j) {
        if (!j) return;
        say("");
        form.hidden = true;
        if (!done) return;
        done.textContent = "";
        var p = document.createElement("p"); p.style.fontWeight = "700"; p.textContent = m.ready;
        var a = document.createElement("a"); a.className = "btn"; a.href = j.dl; a.textContent = m.dl + m.lang[plang];
        var alt = plang === "fr" ? "en" : "fr";
        var b = document.createElement("p"); b.className = "small";
        var a2 = document.createElement("a"); a2.href = j.dlAlt; a2.textContent = m.other + m.names[alt];
        b.appendChild(a2);
        var n = document.createElement("p"); n.className = "small"; n.textContent = j.seq ? m.sent : m.none;
        done.append(p, a, b, n);
        done.hidden = false;
      }).catch(function () { say(m.fail); });
    });
  });
})();
