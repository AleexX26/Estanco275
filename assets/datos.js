// Carga los datos editables desde el panel (/api/config) y actualiza la página.
// Si la API no responde se queda el contenido estático del HTML.
(function () {
  function get(o, path) { return path.split('.').reduce(function (a, k) { return a && a[k]; }, o); }
  function apply(c) {
    document.querySelectorAll('[data-bind]').forEach(function (el) {
      var v = get(c, el.getAttribute('data-bind'));
      if (typeof v === 'string' && v) el.textContent = v;
    });
    if (c.telefono) {
      var digits = c.telefono.replace(/[^\d+]/g, '');
      if (!/^\+/.test(digits)) digits = '+34' + digits;
      document.querySelectorAll('[data-bind-tel]').forEach(function (a) { a.setAttribute('href', 'tel:' + digits); });
    }
    var mail = document.getElementById('correo-fotocopias');
    if (mail && c.correo) {
      var a = document.createElement('a');
      a.href = 'mailto:' + encodeURIComponent(c.correo).replace('%40', '@');
      a.textContent = c.correo;
      mail.textContent = '';
      mail.appendChild(a);
      mail.classList.remove('pending');
    }
    var dom = document.querySelector('#tabla-horario tr[data-d="0"]');
    if (dom && c.horario) dom.classList.toggle('closed', /cerrado/i.test(c.horario.domingo || ''));
    var ld = document.querySelector('script[type="application/ld+json"]');
    if (ld) {
      try {
        var j = JSON.parse(ld.textContent);
        if (c.telefono) j.telephone = document.querySelector('[data-bind-tel]').getAttribute('href').slice(4);
        if (c.direccion) j.address.streetAddress = c.direccion;
        ld.textContent = JSON.stringify(j);
      } catch (e) {}
    }
  }
  fetch('/api/config', { headers: { accept: 'application/json' } })
    .then(function (r) { return r.status === 200 ? r.json() : null; })
    .then(function (c) { if (c) apply(c); })
    .catch(function () {});
})();
