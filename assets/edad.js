// Aviso de mayoría de edad al entrar. Recuerda un "Sí" en este navegador (localStorage).
(function () {
  var KEY = 'estanco275-18';
  try { if (localStorage.getItem(KEY) === '1') return; } catch (e) {}

  var prev = document.activeElement;
  var root = document.createElement('div');
  root.className = 'age-gate';
  root.innerHTML =
    '<div class="age-box" role="dialog" aria-modal="true" aria-labelledby="age-title" aria-describedby="age-text">' +
    '<div class="age-badge" aria-hidden="true">18</div>' +
    '<h2 id="age-title">¿Eres mayor de 18 años?</h2>' +
    '<p id="age-text">Esta web es para mayores de edad. La venta de tabaco está prohibida a menores.</p>' +
    '<div class="age-actions"><button type="button" class="button button-primary" id="age-yes">Sí, soy mayor de 18</button>' +
    '<button type="button" class="button button-outline" id="age-no">No</button></div>' +
    '</div>';
  document.body.appendChild(root);
  document.documentElement.classList.add('age-lock');

  var yes = document.getElementById('age-yes'), no = document.getElementById('age-no');
  yes.focus();

  yes.addEventListener('click', function () {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    root.remove();
    document.documentElement.classList.remove('age-lock');
    if (prev && prev.focus) prev.focus();
  });

  no.addEventListener('click', function () {
    root.querySelector('.age-box').innerHTML =
      '<div class="age-badge" aria-hidden="true">18</div><h2>Acceso no permitido</h2>' +
      '<p>Lo sentimos, esta web es solo para mayores de 18 años.</p>';
  });

  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var items = root.querySelectorAll('button');
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
