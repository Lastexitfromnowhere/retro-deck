// Boutons d'achat : affichés UNIQUEMENT si le Worker de paiement annonce des ventes ouvertes.
(function () {
  "use strict";
  var L = { fr: { buy: "Acheter", wait: "Redirection…", err: "Paiement indisponible pour le moment." },
            en: { buy: "Buy", wait: "Redirecting…", err: "Payment unavailable right now." } };
  var lang = function () { return document.documentElement.lang === "en" ? "en" : "fr"; };
  // Origine de la visite (?from=essayer), gardée le temps de la session ; envoyée avec la demande de paiement.
  var from = (function () {
    try {
      var q = new URLSearchParams(location.search).get("from");
      if (q && /^[a-z0-9_-]{1,20}$/i.test(q)) sessionStorage.setItem("rd-from", q.toLowerCase());
      return sessionStorage.getItem("rd-from") || "";
    } catch (e) { return ""; }
  })();
  fetch("/api/pay/config").then(function (r) { return r.ok ? r.json() : { open: false }; }).then(function (cfg) {
    if (!cfg.open) return;
    [].forEach.call(document.querySelectorAll(".rw[data-tier]"), function (card) {
      var tier = card.dataset.tier;
      if (cfg.tiers.indexOf(tier) === -1) return;
      var wrap = card.querySelector(".b"), b = document.createElement("button");
      b.type = "button"; b.className = "btn"; b.style.cssText = "width:100%;margin-top:12px";
      var note = document.createElement("div"); note.className = "note"; note.style.marginTop = "6px";
      var render = function () { b.textContent = L[lang()].buy; };
      render();
      new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      b.addEventListener("click", function () {
        b.disabled = true; b.textContent = L[lang()].wait; note.textContent = "";
        fetch("/api/pay/checkout", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: tier, lang: lang(), from: from }) })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
          .then(function (j) { location.href = j.url; })
          .catch(function () { b.disabled = false; render(); note.textContent = L[lang()].err; });
      });
      wrap.appendChild(b); wrap.appendChild(note);
    });
  }).catch(function () { /* ventes fermées ou hors ligne : rien à afficher */ });
})();
