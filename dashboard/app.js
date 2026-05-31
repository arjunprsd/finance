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
    // Update active states
    document.querySelectorAll('.sidebar-link, .mobile-link').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });

    if (view === 'family') {
      document.getElementById('family-view').classList.remove('hidden');
      document.getElementById('member-view').classList.add('hidden');
      document.getElementById('page-title').textContent = 'Family Overview';
      document.getElementById('page-subtitle').textContent = 'Consolidated portfolio across all members';
      this.renderFamilyView();
    } else {
      document.getElementById('family-view').classList.add('hidden');
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

    // Update header NW
    const totalNW = this.calculateFamilyNW();
    document.getElementById('header-nw').textContent = this.formatINR(totalNW);
    document.getElementById('family-count').textContent = this.data.members.length;
  },

  // ─── FAMILY DASHBOARD ────────────────────────────────────
  renderFamilyView() {
    const members = this.data.members;
    const totalNW = this.calculateFamilyNW();
    const totalSIP = members.reduce((sum, m) => sum + (m.monthlySIP || 0), 0);

    // Hero stats
    this.animateValue('family-nw', 0, totalNW, 1200, true);
    document.getElementById('family-sip').textContent = this.formatINR(totalSIP) + '/mo';
    document.getElementById('family-count').textContent = members.length;

    // Calculate 6-month change
    const firstMonth = members.reduce((sum, m) => sum + (m.historical[0]?.netWorth || 0), 0);
    const growthPct = ((totalNW - firstMonth) / firstMonth * 100).toFixed(1);
    const changeEl = document.getElementById('family-nw-change');
    changeEl.innerHTML = `<span class="${growthPct >= 0 ? 'text-emerald-400' : 'text-red-400'}">
      ${growthPct >= 0 ? '▲' : '▼'} ${growthPct >= 0 ? '+' : ''}${growthPct}% in 6 months</span>
      <span class="text-slate-500 text-xs ml-1">(${this.formatINR(totalNW - firstMonth)})</span>`;

    // Member cards
    this.renderMemberCards(members, totalNW);

    // Charts
    this.renderFamilyAllocationChart(members);
    this.renderFamilyGrowthChart(members);

    // Alerts
    this.renderFamilyAlerts(members);
  },

  renderMemberCards(members, totalNW) {
    const container = document.getElementById('member-cards');
    container.innerHTML = members.map(m => {
      const nw = this.getMemberNW(m);
      const pct = (nw / totalNW * 100).toFixed(1);
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
          <div class="text-xl font-bold text-white mb-1">${this.formatINR(nw)}</div>
          <div class="flex items-center justify-between">
            <span class="text-xs ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}">
              ${growth >= 0 ? '▲' : '▼'} ${growth >= 0 ? '+' : ''}${growth}% (6M)
            </span>
            <span class="text-xs text-slate-500">${pct}% of total</span>
          </div>
          <div class="progress-bar mt-3">
            <div class="progress-fill bg-brand-500" style="width: ${pct}%"></div>
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

    const nw = this.getMemberNW(m);

    // Hero
    document.getElementById('member-avatar').textContent = m.avatar;
    document.getElementById('member-name').textContent = m.name;
    document.getElementById('member-info').textContent = `Age ${m.age} · ${m.role}`;
    document.getElementById('member-risk').textContent = m.riskProfile;
    this.animateValue('member-nw', 0, nw, 800, true);
    document.getElementById('member-sip').textContent = this.formatINR(m.monthlySIP) + '/mo';
    document.getElementById('member-income').textContent = m.monthlyIncome > 0 ? this.formatINR(m.monthlyIncome) : 'N/A';
    document.getElementById('member-savings-rate').textContent = m.savingsRate > 0 ? m.savingsRate + '%' : 'N/A';

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

  // ─── UTILITIES ────────────────────────────────────────────
  getMemberNW(member) {
    return Object.values(member.portfolio).reduce((sum, cat) => sum + (cat.value || 0), 0);
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
