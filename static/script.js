// C:\Users\cruzs\Mis Proyectos\Herramientas\Proyecciones\static\script.js
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const selectCards = document.querySelectorAll('.select-card');
  const segmentedOptions = document.querySelectorAll('.segmented-option');
  const trueModeInput = document.getElementById('true-mode-input');
  const investmentInputGroup = document.getElementById('investment-input-group');
  const salesInputGroup = document.getElementById('sales-input-group');
  const form = document.getElementById('quiz-form');
  
  // Dashboard sections
  const emptyState = document.getElementById('dashboard-empty');
  const loaderWrapper = document.getElementById('dashboard-loader');
  const dashboardContent = document.getElementById('dashboard-content');
  const modeBadge = document.getElementById('mode-badge');
  
  // KPI displays
  const kpiInvestment = document.getElementById('kpi-investment');
  const kpiReach = document.getElementById('kpi-reach');
  const kpiClicks = document.getElementById('kpi-clicks');
  const kpiVisits = document.getElementById('kpi-visits');
  const kpiLeads = document.getElementById('kpi-leads');
  const kpiSales = document.getElementById('kpi-sales');
  const kpiRevenue = document.getElementById('kpi-revenue');
  
  const funnelBlocksContainer = document.getElementById('funnel-blocks-container');

  // 1. Interactive Selection Cards Logic
  selectCards.forEach(card => {
    card.addEventListener('click', () => {
      const group = card.getAttribute('data-group');
      const value = card.getAttribute('data-value');
      
      // Deselect siblings in the same group
      document.querySelectorAll(`.select-card[data-group="${group}"]`).forEach(sibling => {
        sibling.classList.remove('selected');
      });
      
      // Select clicked
      card.classList.add('selected');
      
      // Update the underlying hidden radio button
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
    });
  });

  // 2. Segmented Mode Switcher Logic
  segmentedOptions.forEach(option => {
    option.addEventListener('click', () => {
      segmentedOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      const mode = option.getAttribute('data-mode');
      trueModeInput.value = mode;
      
      if (mode === 'investment') {
        investmentInputGroup.style.display = 'block';
        salesInputGroup.style.display = 'none';
      } else {
        investmentInputGroup.style.display = 'none';
        salesInputGroup.style.display = 'block';
      }
    });
  });

  // Helper: Number Formatter
  const formatNum = (val) => {
    if (val === undefined || val === null) return '0';
    return Math.round(val).toLocaleString('es-PE');
  };

  // Helper: Calculate average from min-max array
  const avg = (arr) => (arr[0] + arr[1]) / 2;

  // 3. Dynamic Funnel Renderer — Full-width bars with text inside
  const renderFunnel = (data) => {
    funnelBlocksContainer.innerHTML = '';

    // Nota visible solo en móvil
    const mobileHint = document.createElement('div');
    mobileHint.className = 'funnel-mobile-hint';
    mobileHint.innerHTML = '👆 Toca cada barra para ver el detalle completo';
    funnelBlocksContainer.appendChild(mobileHint);
    
    const stages = [
      { key: 'reach',      name: '1. Alcance Mensual',    color: '#2D2B5E', offset: '0px',   sub: 'Personas que ven tus anuncios',     icon: '📢' },
      { key: 'clicks',     name: '2. Clics en Anuncios',  color: '#3D3A8C', offset: '55px',  sub: 'Interés inicial en campañas',        icon: '🖱️' },
      { key: 'visits',     name: '3. Visitas en Landing', color: '#5C5AAD', offset: '110px', sub: 'Llegaron a tu página web',           icon: '🌐' },
      { key: 'leads',      name: '4. Contactos WhatsApp', color: '#0E7490', offset: '165px', sub: 'Abrieron chat o registraron datos',  icon: '💬' },
      { key: 'interested', name: '5. Prospectos Reales',  color: '#B45309', offset: '220px', sub: 'Filtro por Inteligencia Artificial', icon: '🎯' },
      { key: 'sales',      name: '6. Ventas Estimadas',   color: '#15803D', offset: '275px', sub: 'Cierres de clientes logrados',       icon: '💰' }
    ];

    const conversionLabels = {
      reach: 'CTR (Clics)',
      clicks: 'Eficiencia de Carga',
      visits: 'Conversión a Lead',
      leads: 'Conversión IA',
      interested: 'Ratio de Cierre'
    };

    stages.forEach((stage, idx) => {
      const range = data[stage.key];

      // Barra
      const row = document.createElement('div');
      row.className = 'funnel-row';
      row.innerHTML = `
        <div class="funnel-bar" style="--bar-offset: ${stage.offset}; --bar-color: ${stage.color};">
          <span class="funnel-bar-icon">${stage.icon}</span>
          <div class="funnel-bar-text">
            <strong>${stage.name}</strong>
            <p>${stage.sub}</p>
          </div>
          <div class="funnel-value">${formatNum(range[0])} – ${formatNum(range[1])}</div>
        </div>
      `;
      funnelBlocksContainer.appendChild(row);

      // Tooltip al tocar la barra (en móvil el texto se trunca)
      row.querySelector('.funnel-bar').addEventListener('click', (e) => {
        document.querySelectorAll('.funnel-tooltip').forEach(t => t.remove());
        const tip = document.createElement('div');
        tip.className = 'funnel-tooltip';
        tip.innerHTML = `
          <span class="funnel-tooltip-icon">${stage.icon}</span>
          <div class="funnel-tooltip-body">
            <strong>${stage.name}</strong>
            <span>${stage.sub}</span>
          </div>
          <div class="funnel-tooltip-value">${formatNum(range[0])} – ${formatNum(range[1])}</div>
        `;
        row.after(tip);
        setTimeout(() => {
          document.addEventListener('click', () => tip.remove(), { once: true });
        }, 50);
        e.stopPropagation();
      });

      // Badge flotante entre barras — solapa la barra de arriba y la de abajo
      if (idx < stages.length - 1) {
        const nextKey = stages[idx + 1].key;
        const curAvg  = avg(data[stage.key]);
        const nextAvg = avg(data[nextKey]);
        const rate = curAvg > 0 ? ((nextAvg / curAvg) * 100).toFixed(1) : '0.0';

        const connector = document.createElement('div');
        connector.className = 'funnel-badge-connector' + (idx === stages.length - 2 ? ' funnel-last-separator' : '');
        connector.innerHTML = `
          <div class="funnel-badge-circle">
            <svg width="7" height="8" viewBox="0 0 10 12" fill="none">
              <line x1="5" y1="1" x2="5" y2="8" stroke="#5707D6" stroke-width="2" stroke-linecap="round"/>
              <path d="M1.5 6.5L5 10.5L8.5 6.5" stroke="#5707D6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <span class="funnel-badge-pill">${conversionLabels[stage.key]}: ${rate}%</span>
        `;
        funnelBlocksContainer.appendChild(connector);
      }
    });
  };

  // 4. Submit & AJAX form processor
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI states switching
    emptyState.style.display = 'none';
    dashboardContent.style.display = 'none';
    loaderWrapper.style.display = 'flex';
    
    // Prepare payload
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await response.json();
      
      if (json.success) {
        const data = json.data;
        
        // Fill hidden KPI fields (backward compat)
        if (data.investment) {
          kpiInvestment.textContent = `S/. ${formatNum(data.investment[0])} - ${formatNum(data.investment[1])}`;
        } else {
          kpiInvestment.textContent = `S/. ${formatNum(payload.investment)}`;
        }
        kpiReach.textContent = `${formatNum(data.reach[0])} - ${formatNum(data.reach[1])}`;
        kpiClicks.textContent = `${formatNum(data.clicks[0])} - ${formatNum(data.clicks[1])}`;
        kpiVisits.textContent = `${formatNum(data.visits[0])} - ${formatNum(data.visits[1])}`;
        kpiLeads.textContent = `${formatNum(data.leads[0])} - ${formatNum(data.leads[1])}`;
        kpiSales.textContent = `${formatNum(data.sales[0])} - ${formatNum(data.sales[1])}`;

        // Company name + date/time bar
        const companyName = (payload.company_name || '').trim();
        const companyEl = document.getElementById('results-company-name');
        const datetimeEl = document.getElementById('results-datetime');
        if (companyEl) companyEl.textContent = companyName || 'Sin nombre';
        if (datetimeEl) {
          const now = new Date();
          const dateStr = now.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
          const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
          datetimeEl.textContent = `${dateStr} · ${timeStr}`;
        }

        // Render Funnel
        renderFunnel(data);

        // Populate sidebar summary
        const summaryInvestment = document.getElementById('summary-investment');
        const summaryConversion = document.getElementById('summary-conversion');
        const summarySales = document.getElementById('summary-sales');
        const summaryRevenue = document.getElementById('summary-revenue');

        if (data.investment) {
          summaryInvestment.textContent = `S/ ${formatNum(data.investment[0])} – ${formatNum(data.investment[1])}`;
        } else {
          summaryInvestment.textContent = `S/ ${formatNum(payload.investment)}`;
        }

        const avgInterested = avg(data.interested);
        const avgSales = avg(data.sales);
        const totalConversion = avgInterested > 0 ? ((avgSales / avgInterested) * 100).toFixed(1) : '0.0';
        summaryConversion.textContent = `${totalConversion}%`;
        summarySales.textContent = `${formatNum(data.sales[0])} – ${formatNum(data.sales[1])}`;

        if (data.revenue && summaryRevenue) {
          const revMin = formatNum(data.revenue[0]);
          const revMax = formatNum(data.revenue[1]);
          summaryRevenue.textContent = revMin === revMax
            ? `S/ ${revMin}`
            : `S/ ${revMin} – ${revMax}`;
          if (kpiRevenue) kpiRevenue.textContent = summaryRevenue.textContent;
        }

        // Transition views
        loaderWrapper.style.display = 'none';
        dashboardContent.style.display = 'flex';

        // Auto-scroll to results on mobile (delayed so content renders first)
        if (window.innerWidth < 900) {
          setTimeout(() => {
            dashboardContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      } else {
        alert('Ocurrió un error en el cálculo: ' + json.error);
        loaderWrapper.style.display = 'none';
        emptyState.style.display = 'flex';
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor.');
      loaderWrapper.style.display = 'none';
      emptyState.style.display = 'flex';
    }
  });

  // 5. "¿Qué es esto?" Modal Logic
  const modalOverlay = document.getElementById('modal-what-is');
  const btnWhatIs = document.getElementById('btn-what-is');
  const btnModalClose = document.getElementById('modal-close-what');

  if (btnWhatIs && modalOverlay) {
    btnWhatIs.addEventListener('click', () => {
      modalOverlay.style.display = 'flex';
    });

    btnModalClose.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.display = 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
        modalOverlay.style.display = 'none';
      }
    });
  }

  // 6. Toast helper
  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'export-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 320);
    }, 3200);
  }

  // 7. "Exportar proyección" — PDF via html2canvas + jsPDF
  const btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', async () => {

      // Validar que haya proyección generada
      if (dashboardContent.style.display !== 'flex') {
        showToast('⚠️ Primero genera tu proyección para poder exportarla.');
        return;
      }

      // Estado del botón mientras exporta
      const original = btnExport.innerHTML;
      btnExport.innerHTML = '⏳ Generando PDF...';
      btnExport.disabled = true;

      try {
        if (typeof html2canvas === 'undefined') {
          throw new Error('html2canvas no disponible. Recarga la página (Ctrl+Shift+R).');
        }
        if (typeof window.jspdf === 'undefined') {
          throw new Error('jsPDF no disponible. Recarga la página (Ctrl+Shift+R).');
        }

        // Precargar logo como dataURL para que html2canvas lo vea cargado
        const logoDataUrl = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            try {
              const c = document.createElement('canvas');
              c.width = img.naturalWidth; c.height = img.naturalHeight;
              c.getContext('2d').drawImage(img, 0, 0);
              resolve(c.toDataURL('image/png'));
            } catch(e) { resolve(null); }
          };
          img.onerror = () => resolve(null);
          img.src = '/static/logo-violet.png';
        });

        const element = document.getElementById('dashboard-content');
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (doc) => {
            // Eliminar propiedades que html2canvas no soporta
            const fix = doc.createElement('style');
            fix.textContent = `
              * { transition: none !important; animation: none !important; }
              .glass-panel, .results-dashboard, .summary-sidebar {
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
              }
              .funnel-bar { clip-path: none !important; border-radius: 8px !important; }
            `;
            doc.head.appendChild(fix);

            // Marca de agua: logo centrado con baja opacidad (usa dataURL precargado)
            const clonedDash = doc.getElementById('dashboard-content');
            if (clonedDash && logoDataUrl) {
              clonedDash.style.position = 'relative';
              const wm = doc.createElement('div');
              wm.style.cssText = [
                'position:absolute', 'top:50%', 'left:50%',
                'transform:translate(-50%,-50%)',
                'opacity:0.12', 'pointer-events:none', 'z-index:9999'
              ].join(';');
              const wmImg = doc.createElement('img');
              wmImg.src = logoDataUrl;
              wmImg.style.cssText = 'width:280px;height:auto;display:block;';
              wm.appendChild(wmImg);
              clonedDash.appendChild(wm);
            }

            // html2canvas no procesa CSS filter — invertir la imagen manualmente con canvas
            try {
              const originalIcon = document.querySelector('.results-title-icon');
              if (originalIcon && originalIcon.complete && originalIcon.naturalWidth > 0) {
                const cvs = document.createElement('canvas');
                cvs.width  = originalIcon.naturalWidth;
                cvs.height = originalIcon.naturalHeight;
                const ctx = cvs.getContext('2d');
                ctx.filter = 'brightness(0) invert(1)';
                ctx.drawImage(originalIcon, 0, 0);
                const whiteDataUrl = cvs.toDataURL('image/png');
                const clonedIcon = doc.querySelector('.results-title-icon');
                if (clonedIcon) {
                  clonedIcon.src = whiteDataUrl;
                  clonedIcon.style.filter = 'none';
                  clonedIcon.style.webkitFilter = 'none';
                }
              }
            } catch(e) {}
          }
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;

        // Márgenes blancos para aspecto profesional
        const margin = 14; // mm en cada lado
        const mmW = (canvas.width  / 2) * 0.264583;
        const mmH = (canvas.height / 2) * 0.264583;
        const pageW = mmW + margin * 2;
        const pageH = mmH + margin * 2;

        const pdf = new jsPDF({ orientation: pageW > pageH ? 'l' : 'p', unit: 'mm', format: [pageW, pageH] });

        // Fondo blanco explícito
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageW, pageH, 'F');

        // Contenido centrado con margen
        pdf.addImage(imgData, 'PNG', margin, margin, mmW, mmH);

        const companySlug = (document.getElementById('results-company-name')?.textContent || 'proyeccion')
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '');
        pdf.save(`proyeccion-${companySlug || 'alucinando'}.pdf`);

      } catch (err) {
        console.error('Export error:', err);
        showToast('❌ ' + (err.message || 'No se pudo generar el PDF. Intenta de nuevo.'));
      } finally {
        btnExport.innerHTML = original;
        btnExport.disabled = false;
      }
    });
  }
});

