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

  // 3. Dynamic Funnel Blocks Renderer
  const renderFunnel = (data) => {
    funnelBlocksContainer.innerHTML = '';
    
    // Funnel Steps metadata (stages, colors, labels, width scaling percentages)
    const stages = [
      { key: 'reach', name: 'Alcance Mensual', color: '#06b6d4', width: '100%', sub: 'Personas que ven tus anuncios' },
      { key: 'clicks', name: 'Clics en Anuncios', color: '#8b5cf6', width: '92%', sub: 'Interés inicial en campañas' },
      { key: 'visits', name: 'Visitas en Landing', color: '#10b981', width: '84%', sub: 'Llegaron a tu página web' },
      { key: 'leads', name: 'Contactos WhatsApp', color: '#f59e0b', width: '76%', sub: 'Abrieron chat o registraron datos' },
      { key: 'interested', name: 'Prospectos Reales', color: '#ec4899', width: '68%', sub: 'Filtro por Inteligencia Artificial' },
      { key: 'sales', name: 'Ventas Estimadas', color: '#ef4444', width: '60%', sub: 'Cierres de clientes logrados' }
    ];

    stages.forEach((stage, idx) => {
      const stageWrapper = document.createElement('div');
      stageWrapper.className = 'funnel-stage-wrapper';
      
      // 1. Stage Block
      const range = data[stage.key];
      const stageBlock = document.createElement('div');
      stageBlock.className = 'funnel-stage';
      stageBlock.style.setProperty('--stage-width', stage.width);
      stageBlock.style.setProperty('--stage-color', stage.color);
      
      stageBlock.innerHTML = `
        <div class="stage-name">
          <span style="font-size: 1.1rem;">${getStageIcon(stage.key)}</span>
          <div>
            <strong>${stage.name}</strong>
            <div style="font-size: 0.65rem; color: rgba(255,255,255,0.7); font-weight: normal; margin-top: 2px;">${stage.sub}</div>
          </div>
        </div>
        <div class="stage-value">${formatNum(range[0])} - ${formatNum(range[1])}</div>
      `;
      
      stageWrapper.appendChild(stageBlock);

      // 2. Conversion/CTR connector tags (draw between blocks except the last)
      if (idx < stages.length - 1) {
        const nextStageKey = stages[idx + 1].key;
        
        // Calculate dynamic conversion rate
        const currentAvg = avg(data[stage.key]);
        const nextAvg = avg(data[nextStageKey]);
        const rate = currentAvg > 0 ? ((nextAvg / currentAvg) * 100).toFixed(1) : 0;
        
        const connector = document.createElement('div');
        connector.className = 'funnel-connector';
        connector.innerHTML = `
          <span class="conversion-tag">${getConversionLabel(stage.key)}: ${rate}%</span>
        `;
        stageWrapper.appendChild(connector);
      }
      
      funnelBlocksContainer.appendChild(stageWrapper);
    });
  };

  // Helper icons for the funnel stages
  const getStageIcon = (key) => {
    switch (key) {
      case 'reach': return '📢';
      case 'clicks': return '🖱️';
      case 'visits': return '🌐';
      case 'leads': return '💬';
      case 'interested': return '🎯';
      case 'sales': return '💰';
      default: return '⚡';
    }
  };

  // Helper labels for conversion rates
  const getConversionLabel = (key) => {
    switch (key) {
      case 'reach': return 'CTR (Clics)';
      case 'clicks': return 'Eficiencia de Carga';
      case 'visits': return 'Conversión a Lead';
      case 'leads': return 'Calificación IA';
      case 'interested': return 'Ratio de Cierre';
      default: return 'Conversión';
    }
  };

  // 4. Submit & AJAX form processor
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI states switching
    emptyState.style.display = 'none';
    dashboardContent.style.display = 'none';
    loaderWrapper.style.display = 'flex';
    
    // Prepare payload from selected elements
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
        
        // Update header badge
        if (payload.mode === 'investment') {
          modeBadge.textContent = 'Proyección por Inversión';
          modeBadge.style.borderColor = 'var(--primary-color)';
          modeBadge.style.color = 'var(--primary-color)';
          modeBadge.style.background = 'rgba(6, 182, 212, 0.1)';
        } else {
          modeBadge.textContent = 'Embudo Inverso por Meta de Ventas';
          modeBadge.style.borderColor = 'var(--secondary-color)';
          modeBadge.style.color = 'var(--secondary-color)';
          modeBadge.style.background = 'rgba(217, 70, 239, 0.1)';
        }

        // Fill in KPI Metrics Grid
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

        // Render Funnel Visual representation
        renderFunnel(data);

        // Transition views
        loaderWrapper.style.display = 'none';
        dashboardContent.style.display = 'flex';
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
});
