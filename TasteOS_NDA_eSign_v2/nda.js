const canvas=document.getElementById('sig');const ctx=canvas.getContext('2d');
function resize(){canvas.width=canvas.clientWidth;canvas.height=canvas.clientHeight;ctx.lineWidth=2;ctx.lineCap='round';ctx.strokeStyle='#21d4a7';ctx.clearRect(0,0,canvas.width,canvas.height);}resize();
let draw=false;canvas.addEventListener('mousedown',e=>{draw=true;ctx.beginPath();ctx.moveTo(e.offsetX,e.offsetY)});
canvas.addEventListener('mousemove',e=>{if(!draw)return;ctx.lineTo(e.offsetX,e.offsetY);ctx.stroke()});
canvas.addEventListener('mouseup',()=>draw=false);
document.getElementById('clearSig').onclick=()=>resize();
document.getElementById('download').onclick=()=>{
  const {jsPDF}=window.jspdf;
  if(!document.getElementById('agree').checked){alert('Please agree first');return;}
  const name=document.getElementById('fullName').value;const email=document.getElementById('email').value;const date=document.getElementById('date').value;
  const pdf=new jsPDF();pdf.text('NDA Agreement',20,20);
  pdf.text('Name: '+name,20,40);pdf.text('Email: '+email,20,60);pdf.text('Date: '+date,20,80);
  pdf.text('By signing below, Party B agrees to confidentiality terms.',20,120);
  const img=canvas.toDataURL('image/png');pdf.addImage(img,'PNG',20,140,150,50);
  pdf.save('TasteOS_NDA.pdf');
};