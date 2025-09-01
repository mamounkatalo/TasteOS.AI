// Simple signature + PDF generator
const canvas = document.getElementById('sig');
const ctx = canvas.getContext('2d');
let drawing = false;

function resizeCanvas(){
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2dd3b5';
  ctx.clearRect(0,0,canvas.width,canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('mousedown', e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
canvas.addEventListener('mousemove', e => { if (!drawing) return; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); });
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

document.getElementById('clearSig').onclick = () => resizeCanvas();

document.getElementById('download').onclick = () => {
  const { jsPDF } = window.jspdf;
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const date = document.getElementById('date').value.trim();
  if(!name || !email || !date){ alert('Please fill your name, email, and date.'); return; }

  const pdf = new jsPDF({unit:'pt', format:'a4'});
  const pad = 36; let y = pad + 6; const width = pdf.internal.pageSize.getWidth();
  pdf.setFontSize(18); pdf.text('TasteOS — Mutual NDA (Signed Copy)', pad, y); y += 22;
  pdf.setFontSize(12);
  function line(t){ pdf.text(t, pad, y); y += 16; if(y>780){ pdf.addPage(); y = pad; } }

  line('Party A: TasteOS (contact: mamounkatalo@gmail.com)');
  line('Party B: ' + name + ' (' + email + ')');
  line('Effective Date: ' + date);
  y += 10;
  line('By signing below, Party B agrees to the confidentiality terms shared on the TasteOS website or via the official NDA PDF.');
  y += 10;

  const img = canvas.toDataURL('image/png');
  pdf.text('Signature (Party B):', pad, y + 20);
  pdf.addImage(img, 'PNG', pad, y + 28, 180, 70);
  y += 110;
  line('Signed on: ' + date);

  pdf.save('TasteOS_NDA_Signed.pdf');
};
