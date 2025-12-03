(function(){
  const { jsPDF } = window.jspdf;
  const studentSelect = document.getElementById('studentSelect');
  const clearanceId = document.getElementById('clearanceId');
  const notes = document.getElementById('notes');
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pdfPreview = document.getElementById('pdfPreview');

  let lastPdfBlobUrl = null;

  function formatDate(d){
    return d.toLocaleDateString();
  }

  function buildCertificatePdf(name, id, clrId, note){
    const doc = new jsPDF({unit:'pt',format:'a4'});
    const pageW = doc.internal.pageSize.getWidth();

    // White background (explicit) and border
    doc.setFillColor(255,255,255);
    doc.rect(0,0,pageW, doc.internal.pageSize.getHeight(), 'F');

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica','bold');
    doc.text('UNIVERSITY CLEARANCE CERTIFICATE', pageW/2, 80, {align:'center'});

    doc.setFontSize(12);
    doc.setFont('helvetica','normal');
    doc.text('This is to certify that the following student has completed all clearance requirements and is cleared by the university departments.', 40, 120, {maxWidth: pageW-80});

    // Student info box
    doc.setDrawColor(220);
    doc.rect(40,140,pageW-80,110);

    doc.setFontSize(14);
    doc.text(`Name: ${name}`, 60, 165);
    doc.text(`Student ID: ${id}`, 60, 190);
    doc.text(`Clearance ID: ${clrId}`, 60, 215);

    const today = new Date();
    doc.text(`Date: ${formatDate(today)}`, pageW-120, 165);

    // Note
    if(note && note.trim()!==''){
      doc.setFontSize(12);
      doc.text('Notes: ' + note, 60, 255, {maxWidth: pageW-120});
    }

    // Signature area
    doc.setFontSize(12);
    doc.text('Approved by:', 60, 320);
    doc.text('___________________________', 60, 360);
    doc.text('Department Head', 60, 380);

    // Footer small
    doc.setFontSize(9);
    doc.text('This is a system-generated certificate. For verification, contact the University Administration.', 40, doc.internal.pageSize.getHeight()-40);

    return doc;
  }

  function revokeLastBlob(){
    if(lastPdfBlobUrl){
      URL.revokeObjectURL(lastPdfBlobUrl);
      lastPdfBlobUrl = null;
    }
  }

  generateBtn.addEventListener('click', ()=>{
    const selected = studentSelect.value;
    if(!selected){ alert('Please select a student.'); return; }
    const [name,id] = selected.split('|');
    const clrId = clearanceId.value.trim() || `CLR-${Math.floor(Math.random()*9000)+1000}`;
    const noteVal = notes.value.trim();

    // build pdf
    const doc = buildCertificatePdf(name.trim(), id.trim(), clrId, noteVal);

    // open in iframe by creating blob url
    const blob = doc.output('blob');
    revokeLastBlob();
    lastPdfBlobUrl = URL.createObjectURL(blob);
    pdfPreview.src = lastPdfBlobUrl;

    // enable download
    downloadBtn.disabled = false;
    downloadBtn.dataset.blob = lastPdfBlobUrl;
  });

  downloadBtn.addEventListener('click', ()=>{
    if(!lastPdfBlobUrl){ alert('No PDF generated yet. Click "Generate & Preview" first.'); return; }
    // trigger download
    const a = document.createElement('a');
    a.href = lastPdfBlobUrl;
    a.download = (function(){
      const s = studentSelect.value.split('|')[0].trim().replace(/\s+/g,'_');
      const cid = clearanceId.value.trim() || 'certificate';
      return `${s}_${cid}.pdf`;
    })();
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  resetBtn.addEventListener('click', ()=>{
    studentSelect.value = '';
    clearanceId.value = '';
    notes.value = '';
    pdfPreview.src = '';
    revokeLastBlob();
    downloadBtn.disabled = true;
  });

  // cleanup on page unload
  window.addEventListener('unload', ()=>{ revokeLastBlob(); });
})();