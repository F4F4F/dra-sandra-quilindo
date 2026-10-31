// =====================================================================
//  DRA. SANDRA QUILINDO · CONFIGURACIÓN
//  Para cambiar servicios, horas o días de atención, edita solo esta parte.
// =====================================================================
const WHATSAPP = '573147712324'; // 57 + número, sin espacios

const SERVICIOS = [
  { id: 'valoracion', nombre: 'Valoración gratuita', desc: 'Primera cita sin costo: revisión completa y plan de tratamiento.' },
  { id: 'limpieza', nombre: 'Limpieza dental', desc: 'Profilaxis y remoción de sarro.' },
  { id: 'resinas', nombre: 'Resinas', desc: 'Arreglo de caries con material del color del diente.' },
  { id: 'blanqueamiento', nombre: 'Blanqueamiento', desc: 'Aclarado del tono de los dientes en consultorio.' },
  { id: 'control', nombre: 'Control odontológico', desc: 'Revisión periódica para mantener tu salud oral al día.' },
  { id: 'sellantes', nombre: 'Sellantes', desc: 'Protección de las muelas contra la caries.' },
  { id: 'extracciones', nombre: 'Extracciones dentales', desc: 'Retiro de dientes o muelas que lo necesiten.' },
  { id: 'urgencia', nombre: 'Urgencia dental', desc: 'Atención oportuna por dolor, fractura o inflamación.' },
];

// Días que atiende: 0 = domingo, 1 = lunes ... 6 = sábado
const DIAS_ATENCION = [1, 2, 3, 4, 5, 6];
const DIAS_A_MOSTRAR = 6;
const HORAS = ['8:00 am', '9:00 am', '10:00 am', '11:00 am', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm'];
// =====================================================================

const $ = (s) => document.querySelector(s);
const COLORES = [
  { ink: '#4A7A12', tint: '#EEF6E2' },
  { ink: '#B8006A', tint: '#FCE6F2' },
  { ink: '#A85F00', tint: '#FEF1DE' },
  { ink: '#0B6FA8', tint: '#E6F4FB' },
];
const DIENTE = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3c-2.5 0-4 2-4 4.5 0 2.2 1 3.8 1.6 6 .6 2.4.9 7.5 2.9 7.5 1.8 0 1.7-5 4.5-5s2.7 5 4.5 5c2 0 2.3-5.1 2.9-7.5.6-2.2 1.6-3.8 1.6-6C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/></svg>';

const estado = { servicio: null, dia: null, hora: null };

function proximosDias() {
  const dias = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1); // desde mañana
  while (dias.length < DIAS_A_MOSTRAR) {
    if (DIAS_ATENCION.includes(d.getDay())) dias.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dias;
}
const DIAS = proximosDias();
const fmtDiaLargo = (d) => d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
const claveDia = (d) => d.toISOString().slice(0, 10);

function button(attrs, html) {
  const b = document.createElement('button');
  b.type = 'button';
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.innerHTML = html;
  return b;
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderServicios() {
  $('#services').replaceChildren(...SERVICIOS.map((s, i) => {
    const c = COLORES[i % COLORES.length];
    const b = button({ class: 'service' + (estado.servicio === s.id ? ' active' : '') },
      `<span class="service-icon" style="background:${c.tint};color:${c.ink}">${DIENTE}</span>
       <span class="service-name">${esc(s.nombre)}</span>
       <span class="service-desc">${esc(s.desc)}</span>
       <span class="service-cta">Agendar →</span>`);
    b.addEventListener('click', () => {
      estado.servicio = s.id;
      render();
      $('#agendar').scrollIntoView({ behavior: 'smooth' });
    });
    return b;
  }));
}

function renderFormulario() {
  $('#service-pills').replaceChildren(...SERVICIOS.map((s) => {
    const b = button({ class: 'pill', 'aria-pressed': String(estado.servicio === s.id) }, esc(s.nombre));
    b.addEventListener('click', () => { estado.servicio = s.id; render(); });
    return b;
  }));

  $('#days').replaceChildren(...DIAS.map((d) => {
    const k = claveDia(d);
    const dow = d.toLocaleDateString('es-CO', { weekday: 'short' }).replace(/\./g, '');
    const mon = d.toLocaleDateString('es-CO', { month: 'short' }).replace(/\./g, '');
    const b = button({ class: 'day', 'aria-pressed': String(estado.dia === k), 'aria-label': fmtDiaLargo(d) },
      `<span class="day-dow">${dow}</span><span class="day-num">${d.getDate()}</span><span class="day-mon">${mon}</span>`);
    b.addEventListener('click', () => { estado.dia = k; render(); });
    return b;
  }));

  $('#no-day').hidden = !!estado.dia;
  $('#slots').replaceChildren(...(estado.dia ? HORAS.map((h) => {
    const b = button({ class: 'slot', 'aria-pressed': String(estado.hora === h) }, h);
    b.addEventListener('click', () => { estado.hora = h; render(); });
    return b;
  }) : []));

  const svc = SERVICIOS.find((s) => s.id === estado.servicio);
  const dia = DIAS.find((d) => claveDia(d) === estado.dia);
  $('#sum-service').textContent = svc ? svc.nombre : '—';
  $('#sum-day').textContent = dia ? fmtDiaLargo(dia) : '—';
  $('#sum-slot').textContent = estado.hora || '—';
  validar();
}

function faltantes() {
  const f = [];
  if (!estado.servicio) f.push('el servicio');
  if (!estado.dia) f.push('el día');
  if (!estado.hora) f.push('la hora');
  if (!$('#nombre').value.trim()) f.push('tu nombre');
  if ($('#celular').value.replace(/\D/g, '').length < 10) f.push('un celular de 10 dígitos');
  if (!$('#habeas').checked) f.push('aceptar la política de datos');
  return f;
}

function validar() {
  const f = faltantes();
  $('#submit').disabled = f.length > 0;
  $('#hint').textContent = f.length ? 'Falta: ' + f.join(', ') + '.' : '';
}

function mensaje() {
  const svc = SERVICIOS.find((s) => s.id === estado.servicio);
  const dia = DIAS.find((d) => claveDia(d) === estado.dia);
  return [
    '¡Hola Dra. Sandra! Quiero solicitar una cita:',
    `• Servicio: ${svc.nombre}`,
    `• Día: ${fmtDiaLargo(dia)}`,
    `• Hora preferida: ${estado.hora}`,
    `• Nombre: ${$('#nombre').value.trim()}`,
    `• Celular: ${$('#celular').value.trim()}`,
    '',
    'Autorizo el tratamiento de mis datos personales.',
  ].join('\n');
}

$('#booking').addEventListener('submit', (e) => {
  e.preventDefault();
  if (faltantes().length) return validar();
  const url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje());
  window.open(url, '_blank', 'noopener');
  const nombre = $('#nombre').value.trim().split(' ')[0];
  const dia = DIAS.find((d) => claveDia(d) === estado.dia);
  $('#done-title').textContent = `¡Listo, ${nombre}! Solo falta enviar el mensaje.`;
  $('#done-text').textContent = `Te abrimos WhatsApp con tu solicitud (${SERVICIOS.find((s) => s.id === estado.servicio).nombre}, ${fmtDiaLargo(dia)}, ${estado.hora}). Envíalo y la doctora te confirma la cita.`;
  $('#done-wa').href = url;
  $('#booking').hidden = true;
  $('#done').hidden = false;
});

$('#reset').addEventListener('click', () => {
  estado.servicio = estado.dia = estado.hora = null;
  $('#done').hidden = true;
  $('#booking').hidden = false;
  render();
});

['nombre', 'celular', 'habeas'].forEach((id) => {
  $('#' + id).addEventListener('input', validar);
  $('#' + id).addEventListener('change', validar);
});

function render() {
  renderServicios();
  renderFormulario();
}

$('#year').textContent = new Date().getFullYear();
render();
