/* ============================================================
   Prasad Family — Financial Dashboard
   Pure client-side JS — no frameworks, GitHub Pages ready
   ============================================================ */

const App = {
  data: null,
  currentView: 'family',
  charts: {},

  // ─── BOOTSTRAP ────────────────────────────────────────────
  async init() {
    try {
      const res = await fetch('./data.json');
      this.data = await res.json();
    } catch (e) {
      document.getElementById('main-content').innerHTML =
        '<div class="p-12 text-center text-red-400">❌ Failed to load data.json — make sure it is in the same directory.</div>';
      return;
    }

    this.renderSidebar();
    this.renderFamilyView();
    this.setupEventListeners();
    document.getElementById('last-updated').textContent = this.data.meta.lastUpdated;
  },

  // ─── NAVIGATION ───────────────────────────────────────────
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-view]');
      if (!link) return;
      e.preventDefault();
      const view = link.dataset.view;
      this.navigateTo(view);
    });
  },

  navigateTo(view) {
    this.currentView = view;
    document.querySelectorAll('.sidebar-link, .mobile-link').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });

    document.getElementById('family-view').classList.add('hidden');
    document.getElementById('member-view').classList.add('hidden');
    document.getElementById('crorepati-view').classList.add('hidden');

    if (view === 'family') {
      document.getElementById('family-view').classList.remove('hidden');
      document.getElementById('page-title').textContent = 'Family Overview';
      document.getElementById('page-subtitle').textContent = 'Consolidated portfolio across all members';
      this.renderFamilyView();
    } else if (view === 'crorepati') {
      document.getElementById('crorepati-view').classList.remove('hidden');
      document.getElementById('page-title').textContent = 'Crorepati Timeline';
      document.getElementById('page-subtitle').textContent = 'Debt-adjusted wealth projection — when will you hit ₹1 Crore?';
      this.renderCrorepatiView();
    } else {
      document.getElementById('member-view').classList.remove('hidden');
      const member = this.data.members.find(m => m.id === view);
      document.getElementById('page-title').textContent = member.name;
      document.getElementById('page-subtitle').textContent = `${member.role} · ${member.riskProfile} risk`;
      this.renderMemberView(view);
    }
  },

  renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const mobileNav = document.getElementById('mobile-nav-items');

    this.data.members.forEach(m => {
      const link = document.createElement('a');
      link.href = '#';
      link.dataset.view = m.id;
      link.className = 'sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300';
      link.innerHTML = `<span class="text-lg">${m.avatar}</span> ${m.name}`;
      nav.appendChild(link);

      const mobileLink = document.createElement('a');
      mobileLink.href = '#';
      mobileLink.dataset.view = m.id;
      mobileLink.className = 'flex flex-col items-center gap-1 text-xs text-slate-400 py-1 mobile-link';
      mobileLink.innerHTML = `<span class="text-lg">${m.avatar}</span> ${m.name.split(' ')[0]}`;
      mobileNav.appendChild(mobileLink);
    });

    // Update header NW (debt-adjusted)
    const totalGross = this.calculateFamilyNW();
    const totalLoans = this.data.members.reduce((s, m) => {
      if (!m.liabilities) return s;
      return s + Object.values(m.liabilities).reduce((ls, l) => ls + (l.value || 0), 0);
    }, 0);
    const realNW = totalGross - totalLoans;
    const headerEl = document.getElementById('header-nw');
    headerEl.textContent = this.formatINR(realNW);
    headerEl.className = `text-sm font-bold ${realNW >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
  },

  // ─── FAMILY DASHBOARD ────────────────────────────────────
  renderFamilyView() {
    const members = this.data.members;
    const totalGross = this.calculateFamilyNW();
    const totalLoans = members.reduce((s, m) => {
      if (!m.liabilities) return s;
      return s + Object.values(m.liabilities).reduce((ls, l) => ls + (l.value || 0), 0);
    }, 0);
    const realNW = totalGross - totalLoans;
    const totalSIP = members.reduce((sum, m) => sum + (m.monthlySIP || 0), 0);

    // Hero stats — show debt-adjusted NW
    this.animateValue('family-nw', 0, realNW, 1200, true);
    document.getElementById('family-sip').textContent = this.formatINR(totalSIP) + '/mo';
    document.getElementById('family-total-debt').textContent = totalLoans > 0 ? this.formatINR(totalLoans) : '₹0';

    // Debt summary below NW
    const debtSummaryEl = document.getElementById('family-debt-summary');
    debtSummaryEl.innerHTML = `
      <span class="text-slate-500">Gross: <span class="text-white font-medium">${this.formatCompact(totalGross)}</span></span>
      <span class="text-slate-500">Loans: <span class="text-red-400 font-medium">${totalLoans > 0 ? this.formatCompact(totalLoans) : '₹0'}</span></span>
    `;

    // Debt detail label
    const debtDetailEl = document.getElementById('family-debt-detail');
    const loanLabels = [];
    members.forEach(m => {
      if (m.liabilities) {
        Object.values(m.liabilities).forEach(l => loanLabels.push(`${m.name.split(' ')[0]}: ${l.label}`));
      }
    });
    debtDetailEl.textContent = loanLabels.length > 0 ? loanLabels.join(' · ') : 'No loans';

    // Calculate 6-month change
    const firstMonth = members.reduce((sum, m) => sum + (m.historical[0]?.netWorth || 0), 0);
    const growthPct = firstMonth > 0 ? ((realNW - firstMonth) / firstMonth * 100).toFixed(1) : '0.0';
    const changeEl = document.getElementById('family-nw-change');
    changeEl.innerHTML = `<span class="${growthPct >= 0 ? 'text-emerald-400' : 'text-red-400'}">
      ${growthPct >= 0 ? '▲' : '▼'} ${growthPct >= 0 ? '+' : ''}${growthPct}% in 6 months</span>
      <span class="text-slate-500 text-xs ml-1">(${this.formatINR(realNW - firstMonth)})</span>`;

    // Member cards
    this.renderMemberCards(members, realNW);

    // Charts
    this.renderFamilyAllocationChart(members);
    this.renderFamilyGrowthChart(members);

    // Alerts
    this.renderFamilyAlerts(members);
  },

  renderMemberCards(members, totalNW) {
    const container = document.getElementById('member-cards');
    const totalRealNW = members.reduce((s, m) => s + this.getMemberDebtAdjustedNW(m), 0);
    container.innerHTML = members.map(m => {
      const gross = this.getMemberNW(m);
      const loans = m.liabilities ? Object.values(m.liabilities).reduce((s, l) => s + (l.value || 0), 0) : 0;
      const realNW = gross - loans;
      const pct = totalRealNW !== 0 ? (realNW / totalRealNW * 100).toFixed(1) : '0.0';
      const hist = m.historical;
      const growth = hist.length >= 2
        ? ((hist[hist.length-1].netWorth - hist[0].netWorth) / hist[0].netWorth * 100).toFixed(1)
        : 0;
      return `
        <a href="#" data-view="${m.id}" class="glass-card p-5 cursor-pointer group">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl">${m.avatar}</span>
            <div>
              <div class="font-semibold text-white group-hover:text-brand-400 transition-colors">${m.name}</div>
              <div class="text-xs text-slate-500">${m.role}</div>
            </div>
          </div>
          <div class="text-xl font-bold ${realNW >= 0 ? 'text-white' : 'text-red-400'} mb-1">${this.formatINR(realNW)}</div>
          <div class="text-xs text-slate-500 mb-2">
            Assets: ${this.formatCompact(gross)}${loans > 0 ? ` · <span class="text-red-400">Loans: ${this.formatCompact(loans)}</span>` : ''}
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}">
              ${growth >= 0 ? '▲' : '▼'} ${growth >= 0 ? '+' : ''}${growth}% (6M)
            </span>
            <span class="text-xs text-slate-500">${pct}% of family</span>
          </div>
          <div class="progress-bar mt-3">
            <div class="progress-fill ${realNW >= 0 ? 'bg-brand-500' : 'bg-red-500'}" style="width: ${Math.abs(parseFloat(pct))}%"></div>
          </div>
        </a>`;
    }).join('');
  },

  renderFamilyAllocationChart(members) {
    const aggregated = {};
    members.forEach(m => {
      Object.entries(m.portfolio).forEach(([key, cat]) => {
        const label = cat.label;
        aggregated[label] = (aggregated[label] || 0) + cat.value;
      });
    });

    const labels = Object.keys(aggregated);
    const values = Object.values(aggregated);
    const colors = [
      '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
    ];

    this.destroyChart('familyAllocation');
    const ctx = document.getElementById('chart-family-allocation').getContext('2d');
    this.charts.familyAllocation = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, padding: 12, usePointStyle: true, pointStyleWidth: 8 }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = (ctx.raw / total * 100).toFixed(1);
                return ` ${ctx.label}: ${App.formatINR(ctx.raw)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  renderFamilyGrowthChart(members) {
    const months = members[0].historical.map(h => h.month);
    const familyData = months.map((_, i) =>
      members.reduce((sum, m) => sum + (m.historical[i]?.netWorth || 0), 0)
    );

    this.destroyChart('familyGrowth');
    const ctx = document.getElementById('chart-family-growth').getContext('2d');
    this.charts.familyGrowth = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Family Total',
            data: familyData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#0a0f1e',
            pointBorderWidth: 2
          },
          ...members.map((m, idx) => ({
            label: m.name.split(' ')[0],
            data: m.historical.map(h => h.netWorth),
            borderColor: ['#10b981', '#f59e0b', '#ec4899'][idx],
            borderWidth: 1.5,
            borderDash: [4, 4],
            fill: false,
            tension: 0.4,
            pointRadius: 2
          }))
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#64748b', font: { size: 10 } } },
          y: {
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: { color: '#64748b', font: { size: 10 }, callback: v => App.formatCompact(v) }
          }
        },
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, usePointStyle: true, pointStyleWidth: 8 } },
          tooltip: {
            backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
            borderColor: '#334155', borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${App.formatINR(ctx.raw)}` }
          }
        }
      }
    });
  },

  // ─── INDIVIDUAL MEMBER VIEW ───────────────────────────────
  renderMemberView(memberId) {
    const m = this.data.members.find(x => x.id === memberId);
    if (!m) return;

    const gross = this.getMemberNW(m);
    const loans = m.liabilities ? Object.values(m.liabilities).reduce((s, l) => s + (l.value || 0), 0) : 0;
    const realNW = gross - loans;

    // Hero
    document.getElementById('member-avatar').textContent = m.avatar;
    document.getElementById('member-name').textContent = m.name;
    document.getElementById('member-info').textContent = `Age ${m.age} · ${m.role}`;
    document.getElementById('member-risk').textContent = m.riskProfile;

    // Gross assets
    document.getElementById('member-gross-nw').textContent = this.formatINR(gross);

    // Loans
    const debtEl = document.getElementById('member-debt');
    debtEl.textContent = loans > 0 ? this.formatINR(loans) : '₹0';
    debtEl.className = `text-2xl font-bold ${loans > 0 ? 'text-red-400' : 'text-emerald-400'}`;

    // Real NW (debt-adjusted)
    const nwEl = document.getElementById('member-nw');
    this.animateValue('member-nw', 0, realNW, 800, true);
    nwEl.className = `text-2xl font-bold ${realNW >= 0 ? 'text-emerald-400' : 'text-red-400'}`;

    document.getElementById('member-sip').textContent = this.formatINR(m.monthlySIP) + '/mo';

    // Debt details breakdown
    const debtDetailsEl = document.getElementById('member-debt-details');
    if (m.liabilities && Object.keys(m.liabilities).length > 0) {
      debtDetailsEl.classList.remove('hidden');
      debtDetailsEl.innerHTML = `
        <div class="flex flex-wrap gap-3">
          ${Object.values(m.liabilities).map(l => `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);">
              <span class="text-red-400 text-xs font-semibold">🏦 ${l.label}</span>
              <span class="text-white text-xs font-bold">${this.formatCompact(l.value)}</span>
              ${l.emi ? `<span class="text-slate-500 text-xs">· EMI ${this.formatCompact(l.emi)}/mo</span>` : ''}
              ${l.roi ? `<span class="text-slate-500 text-xs">· ${l.roi}%</span>` : ''}
              ${l.monthsLeft ? `<span class="text-slate-500 text-xs">· ${Math.round(l.monthsLeft/12)}y left</span>` : ''}
            </div>
          `).join('')}
        </div>`;
    } else {
      debtDetailsEl.classList.add('hidden');
      debtDetailsEl.innerHTML = '';
    }

    // Allocation chart
    this.renderMemberAllocationChart(m);

    // Projection chart
    this.renderMemberProjectionChart(m);

    // Holdings table
    this.renderHoldingsTable(m, 'all');

    // Filter buttons
    document.querySelectorAll('.holdings-filter-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.holdings-filter-btn').forEach(b => b.classList.remove('active', 'pill-info'));
        btn.classList.add('active', 'pill-info');
        this.renderHoldingsTable(m, btn.dataset.filter);
      };
    });

    // Goals
    this.renderGoals(m);

    // Action Plan
    this.renderActionPlan(m);

    // Member Alerts
    this.renderMemberAlerts(m);
  },

  renderMemberAllocationChart(member) {
    const labels = [];
    const values = [];
    Object.values(member.portfolio).forEach(cat => {
      if (cat.value > 0) {
        labels.push(cat.label);
        values.push(cat.value);
      }
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    this.destroyChart('memberAllocation');
    const ctx = document.getElementById('chart-member-allocation').getContext('2d');
    this.charts.memberAllocation = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderWidth: 0, hoverOffset: 8 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10, family: 'Inter' }, padding: 10, usePointStyle: true, pointStyleWidth: 8 } },
          tooltip: {
            backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
            borderColor: '#334155', borderWidth: 1,
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                return ` ${ctx.label}: ${App.formatINR(ctx.raw)} (${(ctx.raw/total*100).toFixed(1)}%)`;
              }
            }
          }
        }
      }
    });
  },

  renderMemberProjectionChart(member) {
    const hist = member.historical || [];
    const proj = member.projections || [];

    const allLabels = [...hist.map(h => h.month), ...proj.slice(1).map(p => p.month)];
    const histData = hist.map(h => h.netWorth);
    const projData = new Array(hist.length - 1).fill(null).concat([hist[hist.length-1]?.netWorth || 0, ...proj.slice(1).map(p => p.netWorth)]);

    this.destroyChart('memberProjection');
    const ctx = document.getElementById('chart-member-projection').getContext('2d');
    this.charts.memberProjection = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Actual',
            data: [...histData, ...new Array(proj.length - 1).fill(null)],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 3
          },
          {
            label: 'Projected',
            data: projData,
            borderColor: '#6366f1',
            borderDash: [6, 4],
            borderWidth: 2, fill: false, tension: 0.4, pointRadius: 3,
            pointBackgroundColor: '#6366f1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { color: 'rgba(51, 65, 85, 0.3)' }, ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 45 } },
          y: {
            grid: { color: 'rgba(51, 65, 85, 0.3)' },
            ticks: { color: '#64748b', font: { size: 10 }, callback: v => App.formatCompact(v) }
          }
        },
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, usePointStyle: true } },
          tooltip: {
            backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
            borderColor: '#334155', borderWidth: 1,
            callbacks: { label: ctx => ctx.raw != null ? ` ${ctx.dataset.label}: ${App.formatINR(ctx.raw)}` : '' }
          }
        }
      }
    });
  },

  renderHoldingsTable(member, filter) {
    const tbody = document.getElementById('holdings-tbody');
    let rows = [];

    const mfs = member.holdings?.mutualFunds || [];
    const stocks = member.holdings?.stocks || [];
    const sgbs = member.holdings?.sgbs || [];
    const fds = member.holdings?.fixedDeposits || [];
    const insurance = member.holdings?.insurance || [];

    if (filter === 'all' || filter === 'mf') {
      mfs.forEach(h => rows.push({ ...h, type: 'MF' }));
    }
    if (filter === 'all' || filter === 'stocks') {
      stocks.forEach(h => rows.push({ ...h, type: 'Stock' }));
    }
    if (filter === 'all') {
      sgbs.forEach(h => rows.push({ ...h, type: 'SGB', returns: null, invested: null }));
      fds.forEach(h => rows.push({ ...h, type: 'FD', returns: null, invested: null }));
      insurance.forEach(h => rows.push({ ...h, type: 'Insurance', returns: null, invested: null }));
    }

    // Sort: by value descending
    rows.sort((a, b) => (b.value || 0) - (a.value || 0));

    tbody.innerHTML = rows.map(r => {
      const ret = r.returns;
      const retClass = ret == null ? 'text-slate-500' : ret >= 0 ? 'text-emerald-400' : 'text-red-400';
      const retText = ret == null ? '—' : `${ret >= 0 ? '+' : ''}${ret}%`;
      const tag = r.tag || r.action || r.type?.toLowerCase() || '';
      const tagClass = `tag-${tag}`;

      return `<tr class="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors">
        <td class="py-3 px-2">
          <div class="font-medium text-slate-200 text-xs">${r.name}</div>
          ${r.sip ? `<div class="text-xs text-slate-500 mt-0.5">SIP: ${App.formatINR(r.sip)}/mo</div>` : ''}
          ${r.maturity ? `<div class="text-xs text-slate-500 mt-0.5">Maturity: ${r.maturity}</div>` : ''}
          ${r.note ? `<div class="text-xs text-slate-600 mt-0.5">${r.note}</div>` : ''}
        </td>
        <td class="text-right py-3 px-2 font-semibold text-white text-xs">${App.formatINR(r.value)}</td>
        <td class="text-right py-3 px-2 text-slate-400 text-xs">${r.invested ? App.formatINR(r.invested) : '—'}</td>
        <td class="text-right py-3 px-2 font-medium ${retClass} text-xs">${retText}</td>
        <td class="text-center py-3 px-2">
          ${tag ? `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tagClass}">${tag}</span>` : ''}
        </td>
      </tr>`;
    }).join('');

    // Totals row
    const totalValue = rows.reduce((s, r) => s + (r.value || 0), 0);
    const totalInvested = rows.reduce((s, r) => s + (r.invested || 0), 0);
    tbody.innerHTML += `<tr class="border-t-2 border-slate-600/50 font-bold">
      <td class="py-3 px-2 text-slate-300 text-xs">TOTAL (${rows.length} holdings)</td>
      <td class="text-right py-3 px-2 text-white text-xs">${this.formatINR(totalValue)}</td>
      <td class="text-right py-3 px-2 text-slate-400 text-xs">${totalInvested > 0 ? this.formatINR(totalInvested) : '—'}</td>
      <td class="text-right py-3 px-2 ${totalValue >= totalInvested ? 'text-emerald-400' : 'text-red-400'} text-xs">
        ${totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested * 100).toFixed(1) + '%' : '—'}
      </td>
      <td></td>
    </tr>`;
  },

  renderGoals(member) {
    const container = document.getElementById('goals-container');
    const goals = member.goals || [];

    container.innerHTML = goals.map(g => {
      let pct;
      if (g.unit === '%') {
        pct = g.current;
      } else {
        pct = Math.min(100, (g.current / g.target * 100));
      }
      const pctDisplay = pct.toFixed(1);
      const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-brand-500' : 'bg-amber-500';

      return `<div class="flex items-center gap-4">
        <span class="text-2xl">${g.icon}</span>
        <div class="flex-1">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-medium text-slate-200">${g.name}</span>
            <span class="text-xs text-slate-400">${pctDisplay}% · by ${g.deadline}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${barColor}" style="width: ${pct}%"></div>
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-xs text-slate-500">${g.unit === '%' ? g.current + '%' : this.formatCompact(g.current)}</span>
            <span class="text-xs text-slate-500">${g.unit === '%' ? '100%' : this.formatCompact(g.target)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  },

  renderActionPlan(member) {
    const container = document.getElementById('action-plan-container');
    const plan = member.actionPlan || [];
    const completed = plan.filter(a => a.completed).length;

    document.getElementById('action-progress').textContent = `${completed}/${plan.length} completed`;

    container.innerHTML = plan.map(item => {
      const checked = item.completed ? 'checked' : '';
      const doneClass = item.completed ? 'line-through text-slate-600' : 'text-slate-200';
      return `<div class="flex items-start gap-3 p-3 rounded-lg priority-${item.priority} bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
        <input type="checkbox" ${checked} class="mt-1 accent-brand-500 cursor-pointer" 
          onchange="App.toggleAction('${member.id}', '${item.id}', this.checked)" />
        <div class="flex-1">
          <div class="text-sm ${doneClass}">${item.text}</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="pill text-xs ${item.priority === 'critical' ? 'pill-danger' : item.priority === 'high' ? 'pill-warn' : 'pill-info'}">${item.priority}</span>
            <span class="text-xs text-slate-500">⏰ ${item.deadline}</span>
            ${item.completed ? '<span class="pill pill-success text-xs">✓ Done</span>' : ''}
          </div>
        </div>
      </div>`;
    }).join('');
  },

  toggleAction(memberId, actionId, completed) {
    const member = this.data.members.find(m => m.id === memberId);
    const action = member?.actionPlan?.find(a => a.id === actionId);
    if (action) {
      action.completed = completed;
      this.renderActionPlan(member);
      this.renderMemberAlerts(member);
    }
  },

  // ─── ANALYSIS & ALERTS ───────────────────────────────────
  generateAlerts(member) {
    const alerts = [];
    const nw = this.getMemberNW(member);

    // Cash drag check (>40% in cash)
    const cashValue = member.portfolio.cash?.value || 0;
    const cashPct = (cashValue / nw * 100);
    if (cashPct > 40) {
      alerts.push({ type: 'danger', icon: '💸', text: `High Cash Drag — ${cashPct.toFixed(0)}% in cash. Consider investing.` });
    } else if (cashPct > 25) {
      alerts.push({ type: 'warn', icon: '💰', text: `Moderate Cash Position — ${cashPct.toFixed(0)}% in cash. Review if intentional.` });
    }

    // Emergency fund gap
    if (member.portfolio.cash && member.monthlyExpenses > 0) {
      const target = member.monthlyExpenses * 6;
      const current = cashValue;
      if (current < target) {
        const gap = target - current;
        alerts.push({ type: 'warn', icon: '🛡️', text: `Emergency fund gap: ₹${this.formatCompact(current)} of ₹${this.formatCompact(target)} target (need ₹${this.formatCompact(gap)} more)` });
      }
    }

    // Action plan completion
    const plan = member.actionPlan || [];
    const criticalPending = plan.filter(a => a.priority === 'critical' && !a.completed);
    if (criticalPending.length > 0) {
      alerts.push({ type: 'danger', icon: '🔴', text: `${criticalPending.length} critical action(s) pending: ${criticalPending.map(a => a.text.substring(0, 50) + '...').join('; ')}` });
    }

    const allDone = plan.length > 0 && plan.every(a => a.completed);
    if (allDone) {
      alerts.push({ type: 'success', icon: '✅', text: 'All action items completed! Portfolio is on track.' });
    }

    // Junk stocks (exit tagged)
    const exitStocks = (member.holdings?.stocks || []).filter(s => s.action === 'exit');
    if (exitStocks.length > 0) {
      const exitValue = exitStocks.reduce((s, st) => s + st.value, 0);
      alerts.push({ type: 'danger', icon: '🗑️', text: `${exitStocks.length} junk stocks to exit — ₹${this.formatCompact(exitValue)} in dead money. Sell and redeploy.` });
    }

    // Diversification score
    const categories = Object.values(member.portfolio).filter(c => c.value > 0);
    if (categories.length <= 2) {
      alerts.push({ type: 'warn', icon: '⚖️', text: 'Low diversification — portfolio concentrated in ≤2 asset classes.' });
    }

    // Legacy funds (STP needed)
    const legacyFunds = (member.holdings?.mutualFunds || []).filter(f => f.tag === 'legacy-stp');
    if (legacyFunds.length > 0) {
      const legacyValue = legacyFunds.reduce((s, f) => s + f.value, 0);
      alerts.push({ type: 'info', icon: '🔄', text: `${legacyFunds.length} legacy funds (₹${this.formatCompact(legacyValue)}) pending STP migration.` });
    }

    // Watch-tagged funds
    const watchFunds = (member.holdings?.mutualFunds || []).filter(f => f.tag === 'watch');
    if (watchFunds.length > 0) {
      alerts.push({ type: 'warn', icon: '👁️', text: `${watchFunds.length} fund(s) on watch list: ${watchFunds.map(f => f.name).join(', ')}` });
    }

    // SIP not started (target allocation pending)
    if (member.targetAllocation) {
      const pendingSIPs = Object.values(member.targetAllocation).filter(t => t.status === 'pending');
      if (pendingSIPs.length > 0) {
        alerts.push({ type: 'warn', icon: '📋', text: `${pendingSIPs.length} new SIPs pending setup: ${pendingSIPs.map(t => t.label).join(', ')}` });
      }
    }

    // No income check
    if (member.monthlyIncome === 0 && member.monthlySIP > 0) {
      alerts.push({ type: 'info', icon: 'ℹ️', text: `SIP funded by ${member.sipFundedBy || 'family member'}. No personal income.` });
    }

    return alerts;
  },

  renderFamilyAlerts(members) {
    const section = document.getElementById('alerts-section');
    let allAlerts = [];

    members.forEach(m => {
      const alerts = this.generateAlerts(m);
      alerts.forEach(a => allAlerts.push({ ...a, member: m.name, avatar: m.avatar }));
    });

    // Update badge
    const criticalCount = allAlerts.filter(a => a.type === 'danger' || a.type === 'warn').length;
    const badge = document.getElementById('alerts-badge');
    if (criticalCount > 0) {
      badge.classList.remove('hidden');
      document.getElementById('alerts-count').textContent = criticalCount;
    } else {
      badge.classList.add('hidden');
    }

    if (allAlerts.length === 0) {
      section.innerHTML = '<div class="glass-card p-6 text-center text-slate-500 text-sm">✅ No alerts — all portfolios look healthy!</div>';
      return;
    }

    section.innerHTML = `
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">⚡ Smart Alerts</h3>
      ${allAlerts.map(a => `
        <div class="glass-card p-4 flex items-start gap-3 border-l-3 ${a.type === 'danger' ? 'border-l-red-500' : a.type === 'warn' ? 'border-l-amber-500' : a.type === 'success' ? 'border-l-emerald-500' : 'border-l-blue-500'}" style="border-left-width: 3px;">
          <span class="text-lg flex-shrink-0">${a.icon}</span>
          <div class="flex-1">
            <div class="text-sm text-slate-200">${a.text}</div>
            <div class="text-xs text-slate-500 mt-1">${a.avatar} ${a.member}</div>
          </div>
          <span class="pill pill-${a.type} text-xs flex-shrink-0">${a.type}</span>
        </div>
      `).join('')}
    `;
  },

  renderMemberAlerts(member) {
    const container = document.getElementById('member-alerts');
    const alerts = this.generateAlerts(member);

    if (alerts.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">⚡ Insights & Alerts</h3>
      ${alerts.map(a => `
        <div class="glass-card p-4 flex items-start gap-3" style="border-left: 3px solid ${a.type === 'danger' ? '#ef4444' : a.type === 'warn' ? '#f59e0b' : a.type === 'success' ? '#10b981' : '#6366f1'};">
          <span class="text-lg flex-shrink-0">${a.icon}</span>
          <div class="flex-1 text-sm text-slate-200">${a.text}</div>
          <span class="pill pill-${a.type} text-xs flex-shrink-0">${a.type}</span>
        </div>
      `).join('')}
    `;
  },

  // ─── CROREPATI TIMELINE ──────────────────────────────────
  renderCrorepatiView() {
    const sim = this.runSimulation();
    this.renderPositionCards(sim);
    this.renderDebtTable(sim);
    this.renderDebtSplitChart(sim);
    this.renderArjunTimelineChart(sim);
    this.renderFamilyTimelineChart(sim);
    this.renderStackedMembersChart(sim);
    this.renderMilestones(sim);
    this.renderAssumptions(sim);
  },

  runSimulation() {
    // === CONFIG ===
    const EQUITY_CAGR = 0.12;
    const EPF_RATE = 0.0815;
    const GOLD_RATE = 0.08;
    const STOCK_CAGR = 0.10;
    const SIP_STEP_UP = 0.10;
    const YEARS = 16;

    // === ARJUN ===
    const arjun = this.data.members.find(m => m.id === 'arjun');
    const arjunPortfolio = arjun.portfolio;
    let a_mf = arjunPortfolio.equityMF.value;
    let a_stock = arjunPortfolio.stocks.value;
    let a_epf = (arjunPortfolio.epf && arjunPortfolio.epf.value) || 1057000;
    let a_sgb = (arjunPortfolio.sgb && arjunPortfolio.sgb.value) || 175000;
    let a_cash = (arjunPortfolio.cash && arjunPortfolio.cash.value) || 200000;
    let a_loan = 4656108;
    let a_sip = arjun.monthlySIP || 100000;
    let a_epf_mo = 27000;
    const a_emi = 43076;
    const a_roi = 0.0715 / 12;
    let a_months_left = 174;

    // === MOTHER ===
    const mother = this.data.members.find(m => m.id === 'mother');
    let m_assets = this.getMemberNW(mother);
    const m_sip = mother.monthlySIP || 9000;

    // === FATHER ===
    const father = this.data.members.find(m => m.id === 'father');
    let f_mf = 1108184;
    let f_stocks = (father && father.portfolio.stocks) ? father.portfolio.stocks.value : 441088;
    let f_gold = (father && father.portfolio.gold) ? father.portfolio.gold.value : 950000;
    let f_lic = (father && father.portfolio.insurance) ? father.portfolio.insurance.value : 750000;
    let f_cash = (father && father.portfolio.cash) ? father.portfolio.cash.value : 75000;
    let f_loan = (father && father.liabilities && father.liabilities.loans) ? father.liabilities.loans.value : 1400000;
    let f_sip = 5000;

    const arjunGross0 = a_mf + a_stock + a_epf + a_sgb + a_cash;
    const motherGross0 = m_assets;
    const fatherGross0 = f_mf + f_stocks + f_gold + f_lic + f_cash;

    // === SIMULATE ===
    const timeline = [];
    const arjunCroreMonth = { month: null };
    const familyCroreMonth = { month: null };

    for (let year = 0; year <= YEARS; year++) {
      const age = 27 + year;

      if (year > 0) {
        // Arjun
        a_mf = a_mf * (1 + EQUITY_CAGR) + a_sip * 12;
        a_stock = a_stock * (1 + STOCK_CAGR);
        a_epf = a_epf * (1 + EPF_RATE) + a_epf_mo * 12;
        a_sgb = a_sgb * (1 + GOLD_RATE);
        for (let m = 0; m < 12; m++) {
          if (a_loan > 0 && a_months_left > 0) {
            const interest = a_loan * a_roi;
            a_loan = Math.max(0, a_loan - (a_emi - interest));
            a_months_left--;
          }
        }
        a_sip = Math.round(a_sip * (1 + SIP_STEP_UP));

        // Mother
        m_assets = m_assets * (1 + EQUITY_CAGR) + m_sip * 12;

        // Father
        f_mf = f_mf * (1 + EQUITY_CAGR) + f_sip * 12;
        if (year === 1) {
          f_mf += f_stocks * 0.7;
          f_stocks = f_stocks * 0.15;
        } else {
          f_stocks = f_stocks * (1 + STOCK_CAGR) * 0.95;
        }
        f_gold = f_gold * (1 + GOLD_RATE);
        if (year >= 5 && f_lic > 0) { f_mf += f_lic; f_lic = 0; }
        if (f_loan > 0) { f_loan = Math.max(0, f_loan - 300000); }
        f_sip = Math.round(f_sip * (1 + SIP_STEP_UP));
      }

      const aGross = a_mf + a_stock + a_epf + a_sgb + a_cash;
      const aNW = aGross - a_loan;
      const mNW = m_assets;
      const fGross = f_mf + f_stocks + f_gold + f_lic + f_cash;
      const fNW = fGross - f_loan;
      const famNW = aNW + mNW + fNW;

      if (aNW >= 10000000 && !arjunCroreMonth.month) arjunCroreMonth.month = 2026 + year;
      if (famNW >= 10000000 && !familyCroreMonth.month) familyCroreMonth.month = 2026 + year;

      timeline.push({
        year: 2026 + year, age,
        arjun: { gross: aGross, loan: a_loan, nw: aNW, mf: a_mf, epf: a_epf, stock: a_stock, sgb: a_sgb },
        mother: { nw: mNW },
        father: { gross: fGross, loan: f_loan, nw: fNW },
        family: { nw: famNW }
      });
    }

    // Monthly sim for exact arjun crorepati month
    let am_mf = arjunPortfolio.equityMF.value;
    let am_stock = arjunPortfolio.stocks.value;
    let am_epf = a_epf_mo > 0 ? ((arjunPortfolio.epf && arjunPortfolio.epf.value) || 1057000) : 0;
    let am_sgb = (arjunPortfolio.sgb && arjunPortfolio.sgb.value) || 175000;
    let am_cash = (arjunPortfolio.cash && arjunPortfolio.cash.value) || 200000;
    let am_loan = 4656108;
    let am_sip = arjun.monthlySIP || 100000;
    let am_epf_m = 27000;
    let am_ml = 174;
    const mEq = Math.pow(1 + EQUITY_CAGR, 1 / 12) - 1;
    const mEpf = Math.pow(1 + EPF_RATE, 1 / 12) - 1;
    const mSgb = Math.pow(1 + GOLD_RATE, 1 / 12) - 1;
    const mSt = Math.pow(1 + STOCK_CAGR, 1 / 12) - 1;

    let exactMonth = null;
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    for (let mo = 1; mo <= 180; mo++) {
      am_mf = am_mf * (1 + mEq) + am_sip;
      am_stock *= (1 + mSt);
      am_epf = am_epf * (1 + mEpf) + am_epf_m;
      am_sgb *= (1 + mSgb);
      if (am_loan > 0 && am_ml > 0) {
        am_loan = Math.max(0, am_loan - (a_emi - am_loan * a_roi));
        am_ml--;
      }
      if (mo % 12 === 0) am_sip = Math.round(am_sip * (1 + SIP_STEP_UP));
      const nw = am_mf + am_stock + am_epf + am_sgb + am_cash - am_loan;
      if (nw >= 10000000 && !exactMonth) {
        const mIdx = (mo - 1) % 12;
        const yr = 2026 + Math.floor((5 + mo - 1) / 12);
        exactMonth = `${months[mIdx]} ${yr}`;
        break;
      }
    }

    return {
      timeline,
      arjunCroreYear: arjunCroreMonth.month,
      familyCroreYear: familyCroreMonth.month,
      exactCroreMonth: exactMonth || `~${arjunCroreMonth.month}`,
      current: {
        arjun: { gross: arjunGross0, loan: 4656108, nw: arjunGross0 - 4656108 },
        mother: { nw: motherGross0 },
        father: { gross: fatherGross0, loan: 1400000, nw: fatherGross0 - 1400000 },
        family: { gross: arjunGross0 + motherGross0 + fatherGross0, loans: 4656108 + 1400000 }
      },
      config: { EQUITY_CAGR, EPF_RATE, GOLD_RATE, SIP_STEP_UP }
    };
  },

  renderPositionCards(sim) {
    const c = sim.current;
    const famNW = c.arjun.nw + c.mother.nw + c.father.nw;
    const container = document.getElementById('crore-position-cards');
    container.innerHTML = `
      <div class="glass-card p-5" style="border-left: 4px solid ${c.arjun.nw >= 0 ? '#10b981' : '#ef4444'};">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">👨‍💻</span>
          <span class="text-sm font-semibold text-slate-200">Arjun (Personal)</span>
        </div>
        <div class="text-2xl font-extrabold ${c.arjun.nw >= 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatINR(c.arjun.nw)}</div>
        <div class="text-xs text-slate-500 mt-1">Gross: ${this.formatCompact(c.arjun.gross)} · Loan: ${this.formatCompact(c.arjun.loan)}</div>
        <div class="mt-3 pill ${c.arjun.nw >= 0 ? 'pill-success' : 'pill-danger'}">${c.arjun.nw >= 0 ? '✅ Positive NW' : '🔴 Negative NW (loan > assets)'}</div>
        <div class="text-xs text-slate-400 mt-2">🎯 Crorepati by <span class="text-amber-400 font-bold">${sim.exactCroreMonth}</span></div>
      </div>
      <div class="glass-card p-5" style="border-left: 4px solid ${famNW >= 0 ? '#6366f1' : '#ef4444'};">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">👨‍👩‍👦</span>
          <span class="text-sm font-semibold text-slate-200">Family Combined</span>
        </div>
        <div class="text-2xl font-extrabold text-brand-400">${this.formatINR(famNW)}</div>
        <div class="text-xs text-slate-500 mt-1">Gross: ${this.formatCompact(c.family.gross)} · Loans: ${this.formatCompact(c.family.loans)}</div>
        <div class="mt-3 pill pill-info">Total debt: ${this.formatCompact(c.family.loans)}</div>
        <div class="text-xs text-slate-400 mt-2">🎯 Family ₹1Cr by <span class="text-amber-400 font-bold">~${sim.familyCroreYear}</span></div>
      </div>
      <div class="glass-card p-5" style="border-left: 4px solid #f59e0b;">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xl">⚠️</span>
          <span class="text-sm font-semibold text-slate-200">Reality Check</span>
        </div>
        <div class="text-sm text-slate-300 space-y-2 mt-2">
          <div>• Home loan wipes <span class="text-red-400 font-semibold">${(c.arjun.loan / c.arjun.gross * 100).toFixed(0)}%</span> of Arjun's assets</div>
          <div>• Total family debt: <span class="text-red-400 font-semibold">${this.formatCompact(c.family.loans)}</span></div>
          <div>• But home = unlisted asset <span class="text-emerald-400">(NW is higher)</span></div>
          <div>• Loan shrinks ₹3-4L/yr, assets grow ₹15L+/yr</div>
        </div>
      </div>
    `;
  },

  renderDebtTable(sim) {
    const c = sim.current;
    const tbody = document.getElementById('debt-tbody');
    const rows = [
      { name: 'Arjun (27)', avatar: '👨‍💻', gross: c.arjun.gross, loan: c.arjun.loan, nw: c.arjun.nw },
      { name: 'Sangeeta (48)', avatar: '👩', gross: c.mother.nw, loan: 0, nw: c.mother.nw },
      { name: 'Awadhesh (50)', avatar: '👨‍💼', gross: c.father.gross, loan: c.father.loan, nw: c.father.nw }
    ];
    const totGross = rows.reduce((s, r) => s + r.gross, 0);
    const totLoan = rows.reduce((s, r) => s + r.loan, 0);
    const totNW = rows.reduce((s, r) => s + r.nw, 0);

    tbody.innerHTML = rows.map(r => `
      <tr class="border-b border-slate-800/40">
        <td class="py-2 px-2 text-xs">${r.avatar} ${r.name}</td>
        <td class="text-right py-2 px-2 text-xs text-slate-300">${this.formatCompact(r.gross)}</td>
        <td class="text-right py-2 px-2 text-xs ${r.loan > 0 ? 'text-red-400' : 'text-slate-500'}">${r.loan > 0 ? this.formatCompact(r.loan) : '—'}</td>
        <td class="text-right py-2 px-2 text-xs font-semibold ${r.nw >= 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatCompact(r.nw)}</td>
      </tr>
    `).join('') + `
      <tr class="border-t-2 border-slate-600/50 font-bold">
        <td class="py-2 px-2 text-xs text-slate-300">FAMILY TOTAL</td>
        <td class="text-right py-2 px-2 text-xs text-white">${this.formatCompact(totGross)}</td>
        <td class="text-right py-2 px-2 text-xs text-red-400">${this.formatCompact(totLoan)}</td>
        <td class="text-right py-2 px-2 text-xs font-bold ${totNW >= 0 ? 'text-emerald-400' : 'text-red-400'}">${this.formatCompact(totNW)}</td>
      </tr>`;
  },

  renderDebtSplitChart(sim) {
    const c = sim.current;
    this.destroyChart('debtSplit');
    const ctx = document.getElementById('chart-debt-split').getContext('2d');
    this.charts.debtSplit = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Arjun', 'Sangeeta', 'Awadhesh'],
        datasets: [
          { label: 'Assets', data: [c.arjun.gross, c.mother.nw, c.father.gross], backgroundColor: '#6366f1', borderRadius: 6 },
          { label: 'Loans', data: [c.arjun.loan, 0, c.father.loan], backgroundColor: '#ef4444', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        scales: {
          x: { stacked: false, grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: v => this.formatCompact(v) } },
          y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }
        },
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true } },
          tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${App.formatINR(ctx.raw)}` } }
        }
      }
    });
  },

  renderArjunTimelineChart(sim) {
    const labels = sim.timeline.map(t => `${t.year} (${t.age})`);
    const grossData = sim.timeline.map(t => t.arjun.gross);
    const loanData = sim.timeline.map(t => t.arjun.loan);
    const nwData = sim.timeline.map(t => t.arjun.nw);

    this.destroyChart('arjunTimeline');
    const ctx = document.getElementById('chart-arjun-timeline').getContext('2d');
    this.charts.arjunTimeline = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Gross Assets',
            data: grossData,
            borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.06)',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3
          },
          {
            label: 'Net Worth (debt-adjusted)',
            data: nwData,
            borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)',
            borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10b981'
          },
          {
            label: 'Home Loan Outstanding',
            data: loanData,
            borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3, borderDash: [6, 3]
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 45 } },
          y: {
            grid: { color: 'rgba(51,65,85,0.3)' },
            ticks: { color: '#64748b', font: { size: 10 }, callback: v => this.formatCompact(v) }
          }
        },
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true } },
          tooltip: {
            backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${App.formatINR(ctx.raw)}` }
          },
          annotation: undefined
        }
      },
      plugins: [{
        id: 'croreLine',
        afterDraw(chart) {
          const yScale = chart.scales.y;
          const xScale = chart.scales.x;
          if (!yScale || !xScale) return;
          const y = yScale.getPixelForValue(10000000);
          if (y < yScale.top || y > yScale.bottom) return;
          const ctx = chart.ctx;
          ctx.save();
          ctx.setLineDash([8, 4]);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xScale.left, y);
          ctx.lineTo(xScale.right, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('₹1 CRORE 🎯', xScale.left + 8, y - 6);
          ctx.restore();
        }
      }]
    });
  },

  renderFamilyTimelineChart(sim) {
    const labels = sim.timeline.map(t => `${t.year}`);
    const famData = sim.timeline.map(t => t.family.nw);
    const arjunData = sim.timeline.map(t => t.arjun.nw);

    this.destroyChart('familyTimeline');
    const ctx = document.getElementById('chart-family-timeline').getContext('2d');
    this.charts.familyTimeline = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Family NW (debt-adjusted)',
            data: famData,
            borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.08)',
            borderWidth: 3, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#8b5cf6'
          },
          {
            label: 'Arjun NW',
            data: arjunData,
            borderColor: '#10b981',
            borderWidth: 1.5, fill: false, tension: 0.4, pointRadius: 2, borderDash: [4, 3]
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#64748b', font: { size: 10 } } },
          y: { grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: v => this.formatCompact(v) } }
        },
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true } },
          tooltip: {
            backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${App.formatINR(ctx.raw)}` }
          }
        }
      },
      plugins: [{
        id: 'croreLineFamily',
        afterDraw(chart) {
          const yScale = chart.scales.y;
          const xScale = chart.scales.x;
          if (!yScale || !xScale) return;
          [10000000, 50000000, 100000000].forEach((val, i) => {
            const y = yScale.getPixelForValue(val);
            if (y < yScale.top || y > yScale.bottom) return;
            const colors = ['#fbbf24', '#f97316', '#ef4444'];
            const labels = ['₹1 Cr', '₹5 Cr', '₹10 Cr'];
            const ctx2 = chart.ctx;
            ctx2.save();
            ctx2.setLineDash([6, 4]);
            ctx2.strokeStyle = colors[i];
            ctx2.lineWidth = 1.5;
            ctx2.globalAlpha = 0.6;
            ctx2.beginPath();
            ctx2.moveTo(xScale.left, y);
            ctx2.lineTo(xScale.right, y);
            ctx2.stroke();
            ctx2.globalAlpha = 1;
            ctx2.setLineDash([]);
            ctx2.fillStyle = colors[i];
            ctx2.font = 'bold 10px Inter, sans-serif';
            ctx2.fillText(labels[i], xScale.right - 40, y - 4);
            ctx2.restore();
          });
        }
      }]
    });
  },

  renderStackedMembersChart(sim) {
    const labels = sim.timeline.map(t => `${t.year}`);

    this.destroyChart('stackedMembers');
    const ctx = document.getElementById('chart-stacked-members').getContext('2d');
    this.charts.stackedMembers = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Arjun',
            data: sim.timeline.map(t => Math.max(0, t.arjun.nw)),
            backgroundColor: '#6366f1', borderRadius: 2
          },
          {
            label: 'Sangeeta',
            data: sim.timeline.map(t => t.mother.nw),
            backgroundColor: '#10b981', borderRadius: 2
          },
          {
            label: 'Awadhesh',
            data: sim.timeline.map(t => Math.max(0, t.father.nw)),
            backgroundColor: '#f59e0b', borderRadius: 2
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
          y: { stacked: true, grid: { color: 'rgba(51,65,85,0.3)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: v => this.formatCompact(v) } }
        },
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true } },
          tooltip: {
            backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1,
            callbacks: { label: ctx => ` ${ctx.dataset.label}: ${App.formatINR(ctx.raw)}` }
          }
        }
      }
    });
  },

  renderMilestones(sim) {
    const container = document.getElementById('milestones-container');
    const milestones = [
      { icon: '🔓', label: 'Arjun crosses ₹0 NW (debt-free on paper)', check: t => t.arjun.nw >= 0, type: 'personal' },
      { icon: '⭐', label: 'Arjun hits ₹50L net worth', check: t => t.arjun.nw >= 5000000, type: 'personal' },
      { icon: '🔥', label: 'Arjun hits ₹1 CRORE net worth', check: t => t.arjun.nw >= 10000000, type: 'personal' },
      { icon: '🏦', label: 'Home loan fully paid off', check: t => t.arjun.loan <= 0, type: 'personal' },
      { icon: '🌟', label: 'Arjun hits ₹5 CRORE net worth', check: t => t.arjun.nw >= 50000000, type: 'personal' },
      { icon: '👨‍👩‍👦', label: 'Family hits ₹1 CRORE combined NW', check: t => t.family.nw >= 10000000, type: 'family' },
      { icon: '💎', label: 'Family hits ₹5 CRORE combined NW', check: t => t.family.nw >= 50000000, type: 'family' },
      { icon: '🏆', label: 'Family hits ₹10 CRORE combined NW', check: t => t.family.nw >= 100000000, type: 'family' },
    ];

    container.innerHTML = milestones.map(ms => {
      const hit = sim.timeline.find(t => ms.check(t));
      const reached = !!hit;
      const yearText = reached ? `${hit.year} (age ${hit.age})` : 'Beyond projection';
      const dotColor = reached ? (ms.type === 'personal' ? '#10b981' : '#8b5cf6') : '#475569';
      return `
        <div class="milestone-line">
          <div class="milestone-dot" style="border-color: ${dotColor}; background: ${reached ? dotColor : 'transparent'};"></div>
          <div class="${reached ? 'milestone-reached' : 'milestone-pending'} rounded-xl p-4 ml-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-xl">${ms.icon}</span>
                <div>
                  <div class="text-sm font-medium ${reached ? 'text-white' : 'text-slate-400'}">${ms.label}</div>
                  <div class="text-xs ${reached ? 'text-emerald-400' : 'text-slate-600'} mt-0.5">${yearText}</div>
                </div>
              </div>
              ${reached
                ? `<span class="pill pill-success text-xs">${hit.year}</span>`
                : '<span class="pill text-xs" style="background:rgba(71,85,105,0.3);color:#94a3b8;border:1px solid #475569;">Pending</span>'}
            </div>
          </div>
        </div>`;
    }).join('');
  },

  renderAssumptions(sim) {
    const container = document.getElementById('assumptions-container');
    container.innerHTML = `
      <div class="space-y-2">
        <div class="text-xs text-slate-400 uppercase font-semibold mb-2">Growth Rates</div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Equity MF CAGR</span><span class="text-emerald-400">12%</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">EPF Rate</span><span class="text-emerald-400">8.15%</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Gold / SGB</span><span class="text-emerald-400">8%</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Direct Stocks</span><span class="text-emerald-400">10%</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">SIP Step-up</span><span class="text-amber-400">10%/year</span></div>
      </div>
      <div class="space-y-2">
        <div class="text-xs text-slate-400 uppercase font-semibold mb-2">Loan & Cash Flows</div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Arjun Home Loan</span><span class="text-red-400">₹46.56L @ 7.15%</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Home EMI</span><span class="text-slate-300">₹43,076/mo</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Loan Tenure Left</span><span class="text-slate-300">174 months (~14.5 yrs)</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Father's Loans</span><span class="text-red-400">₹14L (gold + car)</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Arjun Monthly SIP</span><span class="text-brand-400">₹1L (10% step-up)</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Mother Monthly SIP</span><span class="text-brand-400">₹9K</span></div>
        <div class="flex justify-between text-xs"><span class="text-slate-400">Father Monthly SIP</span><span class="text-brand-400">₹5K (planned)</span></div>
        <div class="flex justify-between text-xs mt-4"><span class="text-slate-500 italic">⚠ Home value not counted as asset</span><span></span></div>
      </div>
    `;
  },
  getMemberNW(member) {
    return Object.values(member.portfolio).reduce((sum, cat) => sum + (cat.value || 0), 0);
  },

  getMemberDebtAdjustedNW(member) {
    const gross = this.getMemberNW(member);
    const loans = member.liabilities
      ? Object.values(member.liabilities).reduce((s, l) => s + (l.value || 0), 0)
      : 0;
    return gross - loans;
  },

  calculateFamilyNW() {
    return this.data.members.reduce((sum, m) => sum + this.getMemberNW(m), 0);
  },

  formatINR(amount) {
    if (amount == null) return '—';
    const abs = Math.abs(amount);
    let formatted;
    if (abs >= 10000000) {
      formatted = (amount / 10000000).toFixed(2) + ' Cr';
    } else if (abs >= 100000) {
      formatted = (amount / 100000).toFixed(2) + ' L';
    } else {
      formatted = amount.toLocaleString('en-IN');
    }
    return '₹' + formatted;
  },

  formatCompact(amount) {
    if (amount == null) return '—';
    const abs = Math.abs(amount);
    if (abs >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
    if (abs >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
    if (abs >= 1000) return '₹' + (amount / 1000).toFixed(0) + 'K';
    return '₹' + amount;
  },

  animateValue(elementId, start, end, duration, isCurrency) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + (end - start) * eased);
      el.textContent = isCurrency ? this.formatINR(current) : current.toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  destroyChart(key) {
    if (this.charts[key]) {
      this.charts[key].destroy();
      delete this.charts[key];
    }
  }
};

// ─── LAUNCH ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
