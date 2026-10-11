// Page /merci : branche le bouton sur le téléchargement protégé (vérifié côté serveur).
(function () {
  "use strict";
  var q = new URLSearchParams(location.search), id = q.get("session_id") || "";
  var btn = document.getElementById("dl"), msg = document.getElementById("dlmsg");
  var lang = function () { return document.documentElement.dataset.lang === "en" ? "en" : "fr"; };
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(id)) {
    btn.style.display = "none";
    msg.textContent = lang() === "en" ? "No order found in this address. Use the link from your payment confirmation." : "Aucune commande dans cette adresse. Utilise le lien de ta confirmation de paiement.";
    return;
  }
  btn.href = "/api/pay/download?session_id=" + encodeURIComponent(id);
  btn.removeAttribute("aria-disabled");
  btn.addEventListener("click", function (e) {
    // Vérifie d'abord (sans télécharger) pour afficher un message clair, puis lance le vrai téléchargement en flux.
    e.preventDefault();
    msg.textContent = lang() === "en" ? "Preparing your download…" : "Préparation du téléchargement…";
    fetch(btn.href + "&check=1").then(function (r) {
      return r.json().then(function (j) {
        if (r.ok) { msg.textContent = ""; location.href = btn.href; return; }
        msg.textContent = j.message || (lang() === "en" ? "Download unavailable." : "Téléchargement indisponible.");
      });
    }).catch(function () { msg.textContent = lang() === "en" ? "Network error. Try again." : "Erreur réseau. Réessaie."; });
  });
})();
