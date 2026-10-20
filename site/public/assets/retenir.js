// Page /retenir : la réponse à la question (oui / moyen / non) est jointe à l'inscription via le champ « source »
// (ex. « retenir:oui »). Aucun traceur. site.js lit form.dataset.source au moment de l'envoi.
(function () {
  "use strict";
  var form = document.querySelector("form.wl[data-source^='retenir']");
  if (!form) return;
  [].forEach.call(form.querySelectorAll("input[name='rt']"), function (r) {
    r.addEventListener("change", function () {
      form.dataset.source = "retenir:" + r.value;
    });
  });
})();
