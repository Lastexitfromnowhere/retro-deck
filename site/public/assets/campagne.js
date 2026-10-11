  // sommaire : met en avant le chapitre visible
  (function () {
    var links = [].slice.call(document.querySelectorAll("#toc a"));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var secs = [].slice.call(document.querySelectorAll(".story section"));
    function spy() {
      var cur = secs[0], y = window.scrollY + 120;
      secs.forEach(function (s) { if (s.offsetTop <= y) cur = s; });
      links.forEach(function (a) { a.classList.toggle("on", a === map[cur.id]); });
    }
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  })();

  // liste d'attente : à brancher sur un Worker + D1 (même endpoint que la landing)
  var WAITLIST_ENDPOINT = "/api/waitlist";
  var form = document.getElementById("wl"), msg = document.getElementById("msg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    msg.textContent = t("Envoi…", "Sending…");
    fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email.value.trim(), website: form.website.value, lang: window.RD_LANG || "fr", source: "retro-deck-campagne" })
    }).then(function (r) {
      if (r.status === 400) { msg.textContent = t("Cette adresse email semble invalide.", "That email address looks invalid."); return; }
      if (r.status === 429) { msg.textContent = t("Un instant : réessaie dans une minute.", "One moment: please try again in a minute."); return; }
      if (!r.ok) throw new Error(r.status);
      msg.textContent = t("■ C'est noté. Merci !", "■ Got it. Thanks!");
      form.reset();
    }).catch(function () {
      msg.textContent = t("Inscription indisponible pour le moment. Réessaie plus tard.", "Sign-up unavailable right now. Please try again later.");
    });
  });
