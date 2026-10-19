// Turns a company (name, website text, brand) into a complete portal spec: industry, customer
// organisations (tenants), datasets with column descriptions, dashboard pages and AI prompts.
// Also generates the synthetic rows, seeded, so the same portal.json always gives the same data.
// Runs in the browser (wizard, single file) and in Node (Vercel functions). No dependencies.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LuzmoTrialGen = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // ---------- seeded randomness ----------
  function hash(str) {
    let h = 1779033703 ^ String(str).length;
    for (let i = 0; i < String(str).length; i++) {
      h = Math.imul(h ^ String(str).charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h >>> 0) || 1;
  }
  function rng(seed) {
    let a = hash(seed);
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const gauss = (r) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
  function pick(r, weights) {
    const entries = Array.isArray(weights) ? weights.map((v) => [v, 1]) : Object.entries(weights);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let x = r() * total;
    for (const [v, w] of entries) { x -= w; if (x <= 0) return v; }
    return entries[entries.length - 1][0];
  }
  const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'portal';
  const pretty = (name) => name.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

  // ---------- column helpers for the industry library ----------
  // kind: id | tenant | date | dim | measure | flag. Roles steer the automatic dashboards:
  // legend (stacked series), donut (status split), breakdown (bar and heat-table axes),
  // kpi (KPI tile), primary (main measure of the dataset).
  const id = (name, prefix, description) => ({ name, kind: 'id', prefix, description });
  const tenant = (name, description) => ({ name, kind: 'tenant', description });
  const date = (name, description, o = {}) => ({ name, kind: 'date', description, months: 18, trend: 0.025, ...o });
  const dim = (name, values, description, o = {}) => ({ name, kind: 'dim', values, description, ...o });
  const num = (name, description, o = {}) => ({ name, kind: 'measure', agg: 'sum', format: ',.0f', sd: 0.4, decimals: 0, min: 0, ...o, description });
  const flag = (name, description, o = {}) => ({ name, kind: 'flag', agg: 'average', format: '.0%', rate: 0.1, ...o, description });

  function supportTickets(tenantCol, tenantDesc, extra = {}) {
    return {
      key: 'support_tickets', label: 'Support tickets', rows: 3200,
      description: `One row per support ticket raised by a ${tenantDesc}. Use it for ticket volume, response and resolution times, satisfaction and SLA breaches.`,
      columns: [
        id('ticket_id', 'TCK', 'Unique ticket id'),
        tenant(tenantCol, `${pretty(tenantDesc)} (tenant) that raised the ticket`),
        date('created_at', 'Date the ticket was created', { trend: 0.015 }),
        dim('category', extra.categories || { 'How-to question': 5, Bug: 3, Billing: 2, Integration: 2, 'Feature request': 2, Access: 1 }, 'Topic of the ticket', { role: 'legend' }),
        dim('priority', { Low: 4, Medium: 4, High: 2, Urgent: 0.6 }, 'Priority set by the support team', { role: 'breakdown' }),
        dim('channel', { Email: 4, Chat: 4, Phone: 1.5, Portal: 2 }, 'Channel the ticket came in through', { role: 'breakdown' }),
        dim('status', { Resolved: 8, Pending: 1.2, Open: 1 }, 'Resolved, Pending or Open', { role: 'donut' }),
        num('first_response_hours', 'Hours until the first reply', { mean: 3.2, sd: 0.7, decimals: 1, agg: 'average', format: '.1f', factors: { priority: { Urgent: 0.25, High: 0.5, Low: 1.4 } } }),
        num('resolution_hours', 'Hours until the ticket was resolved', { mean: 26, sd: 0.8, decimals: 1, agg: 'average', format: '.1f', kpi: true, primary: true, factors: { category: { Bug: 1.8, Integration: 1.5, 'How-to question': 0.6 } } }),
        num('csat', 'Customer satisfaction 1 to 5, empty if not rated', { mean: 4.2, sd: 0.18, decimals: 0, min: 1, max: 5, agg: 'average', format: '.1f', kpi: true, label: 'CSAT', blankRate: 0.35 }),
        flag('is_sla_breached', '1 if the SLA was breached, else 0. Average gives the SLA breach rate', { rate: 0.08, kpi: true, label: 'SLA breach rate', factors: { priority: { Urgent: 2.4, High: 1.6, Low: 0.5 } } })
      ]
    };
  }

  // ---------- industry library ----------
  // Each industry describes what a typical customer of a software company in that space looks like,
  // so the portal shows numbers the trial user recognises. Detection uses the keywords.
  const INDUSTRIES = {
    saas: {
      label: 'SaaS and software', keywords: ['saas', 'software', 'platform', 'cloud', 'subscription', 'workflow', 'integrations', 'api', 'automation', 'workspace', 'collaboration', 'teams', 'productivity', 'app', 'crm', 'erp'],
      tenantNoun: 'customer account', tenantColumn: 'account', persona: 'workspace admin', area: 'product usage',
      tenantNames: ['Northwind Labs', 'Bluepeak Systems', 'Corvid Analytics', 'Helio Retail Group', 'Fernhill Health', 'Quantis Finance', 'Orbital Media', 'Ridgeway Logistics', 'Lumen Legal', 'Stratus Energy'],
      datasets: [
        {
          key: 'product_usage', label: 'Product usage', rows: 7000,
          description: 'One row per user session in the product, per customer account. Use it for activity, feature adoption, time spent and errors.',
          columns: [
            id('session_id', 'SES', 'Unique session id'),
            tenant('account', 'Customer account (tenant) the user belongs to'),
            date('session_date', 'Date of the session', { trend: 0.03 }),
            dim('feature', { Dashboards: 5, Reports: 4, Automations: 3, Integrations: 2, Search: 3, Admin: 1, API: 1.5 }, 'Feature used most in the session', { role: 'legend' }),
            dim('team', { Sales: 3, Marketing: 2, Support: 3, Finance: 1.5, Operations: 2, Product: 1.5 }, 'Team of the user', { role: 'breakdown' }),
            dim('user_role', { Admin: 1, Editor: 3, Viewer: 6 }, 'Role of the user in the product', { role: 'breakdown' }),
            dim('device', { Desktop: 7, Mobile: 2, Tablet: 1 }, 'Device used', { role: 'donut' }),
            dim('plan', { Starter: 1, Growth: 1, Enterprise: 1 }, 'Subscription plan of the account', { perTenant: true }),
            num('minutes_active', 'Active minutes in the session', { mean: 14, sd: 0.5, decimals: 1, kpi: true, primary: true, label: 'Active minutes', factors: { feature: { Dashboards: 1.3, Admin: 0.5, API: 0.4 } } }),
            num('actions', 'Number of actions in the session', { mean: 22, sd: 0.5, kpi: true }),
            flag('is_error', '1 if the user hit an error, else 0. Average gives the error rate', { rate: 0.035, kpi: true, label: 'Error rate', factors: { feature: { API: 2.2, Integrations: 1.8 } } }),
            flag('is_new_user', '1 if this was the first session of the user, else 0', { rate: 0.06, label: 'New user share' })
          ]
        },
        supportTickets('account', 'customer account')
      ]
    },
    ecommerce: {
      label: 'E-commerce and retail', keywords: ['shop', 'store', 'ecommerce', 'e-commerce', 'retail', 'marketplace', 'checkout', 'cart', 'merchant', 'brand', 'products', 'fashion', 'orders', 'd2c', 'omnichannel'],
      tenantNoun: 'merchant', tenantColumn: 'merchant', persona: 'e-commerce manager', area: 'sales and conversion',
      tenantNames: ['Urban Thread', 'Nordic Nest Home', 'Peak Outdoor Co', 'Glow Beauty Lab', 'Volt Electronics', 'Little Sprout Kids', 'Brew & Bean', 'Stride Footwear', 'Casa Verde Living', 'Pixel Gadgets'],
      datasets: [
        {
          key: 'orders', label: 'Orders', rows: 7500,
          description: 'One row per order placed at a merchant. Use it for revenue, order volume, basket size, returns and channels.',
          columns: [
            id('order_id', 'ORD', 'Unique order id'),
            tenant('merchant', 'Merchant (tenant) that sold the order'),
            date('order_date', 'Date the order was placed', { trend: 0.03 }),
            dim('channel', { 'Web shop': 6, 'Mobile app': 4, Marketplace: 2.5, Social: 1.2 }, 'Sales channel', { role: 'legend' }),
            dim('category', { Apparel: 4, Footwear: 2, Home: 2.5, Beauty: 2, Electronics: 1.5, Sports: 1.5 }, 'Product category', { role: 'breakdown' }),
            dim('country', { Netherlands: 4, Germany: 3, Belgium: 2, France: 2, 'United Kingdom': 1.5, Spain: 1 }, 'Shipping country', { role: 'breakdown' }),
            dim('customer_type', { New: 4, Returning: 6 }, 'New or returning customer'),
            dim('order_status', { Delivered: 14, Shipped: 2, Returned: 2.2, Cancelled: 0.8 }, 'Delivered, Shipped, Returned or Cancelled', { role: 'donut' }),
            num('revenue', 'Order value incl. discounts, in the store currency', { mean: 72, sd: 0.55, decimals: 2, kpi: true, primary: true, factors: { category: { Electronics: 2.6, Footwear: 1.4, Beauty: 0.6 }, order_status: { Cancelled: 0 } } }),
            num('items', 'Number of items in the order', { mean: 2.2, sd: 0.45, min: 1 }),
            num('discount', 'Discount given on the order', { mean: 6, sd: 0.8, decimals: 2 }),
            flag('is_returned', '1 if the order was returned, else 0. Average gives the return rate', { when: { column: 'order_status', values: ['Returned'] }, kpi: true, label: 'Return rate' })
          ]
        },
        {
          key: 'web_sessions', label: 'Traffic and conversion', rows: 6000,
          description: 'One row per visitor session on a merchant\'s shop. Use it for traffic, sources, bounce rate and conversion rate.',
          columns: [
            id('session_id', 'WEB', 'Unique session id'),
            tenant('merchant', 'Merchant (tenant) whose shop was visited'),
            date('session_date', 'Date of the visit', { trend: 0.02 }),
            dim('traffic_source', { 'Organic search': 5, 'Paid search': 3, Social: 3, Email: 1.5, Direct: 3, Affiliate: 1 }, 'Where the visitor came from', { role: 'legend' }),
            dim('device', { Mobile: 6, Desktop: 3.5, Tablet: 0.8 }, 'Device used', { role: 'donut' }),
            dim('landing_page', { Home: 3, Category: 3, Product: 4, Campaign: 1.5 }, 'Type of landing page', { role: 'breakdown' }),
            num('pageviews', 'Pages viewed in the session', { mean: 4.5, sd: 0.6, min: 1, kpi: true, primary: true }),
            num('session_seconds', 'Session length in seconds', { mean: 170, sd: 0.7, agg: 'average', format: ',.0f', label: 'Avg. session seconds' }),
            flag('is_converted', '1 if the session led to an order, else 0. Average gives the conversion rate', { rate: 0.028, kpi: true, label: 'Conversion rate', factors: { traffic_source: { Email: 1.9, 'Paid search': 1.3, Social: 0.6 }, device: { Desktop: 1.4 } } }),
            flag('is_bounce', '1 if the visitor left after one page, else 0. Average gives the bounce rate', { rate: 0.41, kpi: true, label: 'Bounce rate' })
          ]
        }
      ]
    },
    logistics: {
      label: 'Logistics and supply chain', keywords: ['logistics', 'shipping', 'freight', 'transport', 'delivery', 'warehouse', 'fulfilment', 'fulfillment', 'supply chain', 'carrier', 'fleet', 'parcel', 'tracking', '3pl', 'cargo'],
      tenantNoun: 'shipper', tenantColumn: 'shipper', persona: 'logistics manager', area: 'shipments and warehouse performance',
      tenantNames: ['Hanseatic Goods', 'Polder Fresh Foods', 'Alpine Sports Supply', 'Meridian Pharma', 'Brightline Electronics', 'Rhine Valley Wines', 'Oakridge Furniture', 'Coastline Apparel', 'Vector Auto Parts', 'Sunfield Garden'],
      datasets: [
        {
          key: 'shipments', label: 'Shipments', rows: 7000,
          description: 'One row per shipment handled for a shipper. Use it for volumes, on-time delivery, transit times, cost and damage.',
          columns: [
            id('shipment_id', 'SHP', 'Unique shipment id'),
            tenant('shipper', 'Shipper (tenant) that booked the shipment'),
            date('ship_date', 'Date the shipment left the hub', { trend: 0.02 }),
            dim('service_level', { 'Same day': 1, 'Next day': 4, Standard: 6, Economy: 2.5 }, 'Booked service level', { role: 'legend' }),
            dim('origin_hub', { Rotterdam: 4, Antwerp: 3, Duisburg: 2, Venlo: 2, Hamburg: 2 }, 'Hub the shipment left from', { role: 'breakdown' }),
            dim('destination_country', { Netherlands: 3, Germany: 4, Belgium: 2, France: 2.5, Poland: 1.5, Italy: 1.5 }, 'Destination country', { role: 'breakdown' }),
            dim('carrier_type', { 'Own fleet': 5, 'Partner carrier': 4, Courier: 2 }, 'Who carried the last mile'),
            dim('delivery_status', { 'Delivered on time': 13, 'Delivered late': 2, 'In transit': 1.5, Exception: 0.5 }, 'Delivery status', { role: 'donut' }),
            num('weight_kg', 'Shipment weight in kg', { mean: 85, sd: 0.9, decimals: 1, label: 'Weight (kg)' }),
            num('cost', 'Freight cost of the shipment', { mean: 140, sd: 0.6, decimals: 2, kpi: true, primary: true, factors: { service_level: { 'Same day': 2.4, 'Next day': 1.5, Economy: 0.7 } } }),
            num('transit_hours', 'Hours from pickup to delivery', { mean: 38, sd: 0.4, decimals: 1, agg: 'average', format: '.1f', kpi: true, label: 'Avg. transit hours', factors: { service_level: { 'Same day': 0.2, 'Next day': 0.6, Economy: 1.8 } } }),
            flag('is_on_time', '1 if delivered on time, else 0. Average gives the on-time rate', { when: { column: 'delivery_status', values: ['Delivered on time'] }, kpi: true, label: 'On-time rate' }),
            flag('is_damaged', '1 if the shipment was reported damaged, else 0', { rate: 0.012, label: 'Damage rate' })
          ]
        },
        {
          key: 'warehouse_orders', label: 'Warehouse orders', rows: 5000,
          description: 'One row per order picked in a warehouse for a shipper. Use it for order lines, pick times, pick errors and same-day dispatch.',
          columns: [
            id('pick_id', 'PCK', 'Unique pick order id'),
            tenant('shipper', 'Shipper (tenant) that owns the stock'),
            date('order_date', 'Date the order was picked', { trend: 0.02 }),
            dim('warehouse', { 'Rotterdam DC': 4, 'Venlo DC': 3, 'Duisburg DC': 2.5, 'Lyon DC': 1.5 }, 'Warehouse', { role: 'breakdown' }),
            dim('order_type', { B2C: 6, B2B: 3, Returns: 1.2 }, 'Type of order', { role: 'donut' }),
            dim('pick_method', { Manual: 4, 'Zone picking': 3, Robot: 2 }, 'How the order was picked', { role: 'legend' }),
            num('order_lines', 'Number of order lines', { mean: 3.5, sd: 0.7, min: 1, kpi: true, primary: true, label: 'Order lines' }),
            num('pick_minutes', 'Minutes to pick the order', { mean: 7, sd: 0.5, decimals: 1, agg: 'average', format: '.1f', kpi: true, label: 'Avg. pick minutes', factors: { pick_method: { Robot: 0.45, 'Zone picking': 0.75 } } }),
            flag('is_pick_error', '1 if a pick error was found, else 0. Average gives the pick error rate', { rate: 0.012, kpi: true, label: 'Pick error rate', factors: { pick_method: { Robot: 0.3 } } }),
            flag('is_same_day_dispatch', '1 if dispatched the same day, else 0', { rate: 0.86, label: 'Same-day dispatch' })
          ]
        }
      ]
    },
    healthcare: {
      label: 'Healthcare', keywords: ['health', 'healthcare', 'care', 'clinic', 'patient', 'hospital', 'medical', 'doctor', 'therapy', 'pharma', 'dental', 'nursing', 'ehr', 'telehealth', 'wellbeing'],
      tenantNoun: 'care organisation', tenantColumn: 'care_organisation', persona: 'practice manager', area: 'appointments and claims',
      tenantNames: ['Riverside Medical Group', 'Lindenhof Clinics', 'Harbor Physio', 'Greenfield Family Practice', 'Northstar Dental', 'Mercy Care Partners', 'Willow Mental Health', 'Summit Orthopaedics', 'Bayview Care Homes', 'Clearwater Dermatology'],
      datasets: [
        {
          key: 'appointments', label: 'Appointments', rows: 7000,
          description: 'One row per patient appointment at a care organisation. Use it for volumes, no-shows, waiting times, duration and patient satisfaction.',
          columns: [
            id('appointment_id', 'APT', 'Unique appointment id'),
            tenant('care_organisation', 'Care organisation (tenant) where the appointment took place'),
            date('appointment_date', 'Date of the appointment', { trend: 0.015 }),
            dim('department', { 'General practice': 5, Cardiology: 1.5, Orthopaedics: 2, Physiotherapy: 3, Dermatology: 1.5, 'Mental health': 2 }, 'Department', { role: 'breakdown' }),
            dim('appointment_type', { 'First visit': 3, 'Follow-up': 5, Telehealth: 2.5, Procedure: 1 }, 'Type of appointment', { role: 'legend' }),
            dim('location', { 'Main site': 5, 'North site': 2.5, 'South site': 2.5 }, 'Site', { role: 'breakdown' }),
            dim('status', { Completed: 15, 'No-show': 1.4, Cancelled: 1.6, Rescheduled: 1 }, 'Completed, No-show, Cancelled or Rescheduled', { role: 'donut' }),
            num('wait_days', 'Days between booking and appointment', { mean: 11, sd: 0.6, agg: 'average', format: '.1f', kpi: true, label: 'Avg. wait days', factors: { department: { Orthopaedics: 2.1, Dermatology: 1.8, 'General practice': 0.4 } } }),
            num('duration_minutes', 'Duration of the appointment in minutes', { mean: 24, sd: 0.4, kpi: true, primary: true, label: 'Care minutes', factors: { appointment_type: { Procedure: 2.5, 'First visit': 1.5, Telehealth: 0.6 }, status: { 'No-show': 0, Cancelled: 0 } } }),
            num('patient_satisfaction', 'Patient satisfaction 1 to 5, empty if not rated', { mean: 4.3, sd: 0.15, min: 1, max: 5, agg: 'average', format: '.1f', kpi: true, label: 'Patient satisfaction', blankRate: 0.4 }),
            flag('is_no_show', '1 if the patient did not show up, else 0. Average gives the no-show rate', { when: { column: 'status', values: ['No-show'] }, label: 'No-show rate' })
          ]
        },
        {
          key: 'claims', label: 'Claims', rows: 4500,
          description: 'One row per claim a care organisation submitted to a payer. Use it for claim value, denials and days to payment.',
          columns: [
            id('claim_id', 'CLM', 'Unique claim id'),
            tenant('care_organisation', 'Care organisation (tenant) that submitted the claim'),
            date('submitted_at', 'Date the claim was submitted', { trend: 0.015 }),
            dim('payer', { 'Public insurer': 5, 'Private insurer A': 2.5, 'Private insurer B': 2, 'Self-pay': 1 }, 'Who pays the claim', { role: 'legend' }),
            dim('claim_type', { Consultation: 5, Treatment: 3, Diagnostics: 2, Medication: 1.5 }, 'Type of care claimed', { role: 'breakdown' }),
            dim('claim_status', { Paid: 12, Pending: 2.5, Denied: 1.2, Appealed: 0.5 }, 'Paid, Pending, Denied or Appealed', { role: 'donut' }),
            num('amount', 'Claimed amount', { mean: 180, sd: 0.7, decimals: 2, kpi: true, primary: true, factors: { claim_type: { Treatment: 2.2, Diagnostics: 1.6, Medication: 0.5 } } }),
            num('days_to_payment', 'Days from submission to payment', { mean: 28, sd: 0.4, agg: 'average', format: '.1f', kpi: true, label: 'Avg. days to payment' }),
            flag('is_denied', '1 if the claim was denied, else 0. Average gives the denial rate', { when: { column: 'claim_status', values: ['Denied'] }, kpi: true, label: 'Denial rate' })
          ]
        }
      ]
    },
    hr: {
      label: 'HR and workforce', keywords: ['hr', 'human resources', 'recruiting', 'recruitment', 'hiring', 'talent', 'payroll', 'workforce', 'employee', 'people', 'onboarding', 'ats', 'candidates', 'jobs', 'staffing'],
      tenantNoun: 'client company', tenantColumn: 'company', persona: 'HR manager', area: 'hiring and workforce',
      tenantNames: ['Brightwave Telecom', 'Delta Freight', 'Greenleaf Foods', 'Quanta Consulting', 'Harbour Bank', 'Nova Retail', 'Atlas Engineering', 'Bloom Hospitality', 'Crestline Insurance', 'Pioneer Manufacturing'],
      datasets: [
        {
          key: 'applications', label: 'Hiring pipeline', rows: 6000,
          description: 'One row per job application at a client company. Use it for applications, pipeline stages, hire rate, time to hire and sources.',
          columns: [
            id('application_id', 'APP', 'Unique application id'),
            tenant('company', 'Client company (tenant) that posted the job'),
            date('applied_at', 'Date the candidate applied', { trend: 0.02 }),
            dim('department', { Engineering: 3, Sales: 3, Operations: 3, Finance: 1.5, Marketing: 1.5, 'Customer service': 2.5 }, 'Department of the vacancy', { role: 'breakdown' }),
            dim('job_level', { Junior: 4, Medior: 4, Senior: 2.5, Lead: 1 }, 'Seniority of the vacancy', { role: 'breakdown' }),
            dim('source', { LinkedIn: 4, Referral: 2, 'Job board': 4, 'Careers site': 3, Agency: 1 }, 'Where the candidate came from', { role: 'legend' }),
            dim('stage', { Applied: 6, Screening: 4, Interview: 2.5, Offer: 0.8, Hired: 0.9, Rejected: 6 }, 'Current pipeline stage', { role: 'donut' }),
            num('days_in_process', 'Days since the candidate applied or until hired', { mean: 24, sd: 0.5, agg: 'average', format: '.1f', kpi: true, label: 'Avg. days in process' }),
            num('cost_per_application', 'Sourcing cost allocated to the application', { mean: 45, sd: 0.8, decimals: 2, kpi: true, primary: true, label: 'Sourcing cost', factors: { source: { Agency: 6, LinkedIn: 1.6, Referral: 0.7, 'Careers site': 0.3 } } }),
            flag('is_hired', '1 if the candidate was hired, else 0. Average gives the hire rate', { when: { column: 'stage', values: ['Hired'] }, kpi: true, label: 'Hire rate' })
          ]
        },
        {
          key: 'workforce', label: 'Absence and engagement', rows: 5000,
          description: 'One row per employee per month at a client company. Use it for absence, overtime, engagement and attrition.',
          columns: [
            id('record_id', 'EMP', 'Unique record id'),
            tenant('company', 'Client company (tenant) the employee works for'),
            date('month', 'Month of the record', { trend: 0.005 }),
            dim('department', { Engineering: 3, Sales: 3, Operations: 4, Finance: 1.5, Marketing: 1.5, 'Customer service': 3 }, 'Department', { role: 'breakdown' }),
            dim('location', { Amsterdam: 3, Rotterdam: 2, Utrecht: 2, Remote: 2 }, 'Work location', { role: 'legend' }),
            dim('contract', { Permanent: 7, Temporary: 2, Freelance: 1 }, 'Contract type', { role: 'donut' }),
            num('absence_days', 'Sick or unplanned absence days in the month', { mean: 0.9, sd: 1.1, decimals: 1, kpi: true, primary: true, label: 'Absence days' }),
            num('overtime_hours', 'Overtime hours in the month', { mean: 5, sd: 0.9, decimals: 1, kpi: true, label: 'Overtime hours' }),
            num('engagement_score', 'Pulse survey engagement score 1 to 10', { mean: 7.3, sd: 0.15, decimals: 1, min: 1, max: 10, agg: 'average', format: '.1f', kpi: true, label: 'Engagement' }),
            flag('is_leaver', '1 if the employee left that month, else 0. Average gives monthly attrition', { rate: 0.014, label: 'Attrition' })
          ]
        }
      ]
    },
    fintech: {
      label: 'Payments and fintech', keywords: ['payments', 'payment', 'fintech', 'banking', 'bank', 'finance', 'invoice', 'invoicing', 'lending', 'card', 'wallet', 'transactions', 'accounting', 'insurance', 'treasury', 'checkout'],
      tenantNoun: 'merchant', tenantColumn: 'merchant', persona: 'finance manager', area: 'payments and disputes',
      tenantNames: ['Cobalt Coffee Roasters', 'Meridian Travel', 'Nimbus Software', 'Fjord Fashion', 'Sprout Grocery', 'Velo Bikes', 'Lantern Books', 'Apex Fitness Clubs', 'Harvest Home Goods', 'Tidal Telecom'],
      datasets: [
        {
          key: 'transactions', label: 'Transactions', rows: 8000,
          description: 'One row per payment transaction processed for a merchant. Use it for volume, payment methods, fees, failures and fraud flags.',
          columns: [
            id('transaction_id', 'TXN', 'Unique transaction id'),
            tenant('merchant', 'Merchant (tenant) that received the payment'),
            date('transaction_date', 'Date of the transaction', { trend: 0.03 }),
            dim('payment_method', { Card: 6, iDEAL: 3, 'Apple Pay': 2.5, 'Bank transfer': 1.5, 'Buy now pay later': 1 }, 'Payment method', { role: 'legend' }),
            dim('channel', { Online: 6, 'In store': 3, 'In app': 2.5 }, 'Where the payment happened', { role: 'breakdown' }),
            dim('country', { Netherlands: 4, Germany: 3, Belgium: 2, France: 2, Spain: 1 }, 'Country of the payer', { role: 'breakdown' }),
            dim('status', { Settled: 18, Refunded: 1, Chargeback: 0.25, Failed: 1.2 }, 'Settled, Refunded, Chargeback or Failed', { role: 'donut' }),
            num('amount', 'Transaction amount', { mean: 58, sd: 0.8, decimals: 2, kpi: true, primary: true, label: 'Payment volume' }),
            num('fee', 'Processing fee charged', { mean: 0.9, sd: 0.5, decimals: 2, kpi: true, label: 'Fees', factors: { payment_method: { Card: 1.6, 'Buy now pay later': 3, iDEAL: 0.4 } } }),
            flag('is_failed', '1 if the payment failed, else 0. Average gives the failure rate', { when: { column: 'status', values: ['Failed'] }, kpi: true, label: 'Failure rate' }),
            flag('is_fraud_flagged', '1 if the risk engine flagged the payment, else 0', { rate: 0.006, label: 'Fraud flag rate', factors: { channel: { Online: 1.8, 'In store': 0.3 } } })
          ]
        },
        {
          key: 'disputes', label: 'Disputes', rows: 2500,
          description: 'One row per payment dispute or chargeback for a merchant. Use it for dispute volume, reasons, win rate and days open.',
          columns: [
            id('dispute_id', 'DSP', 'Unique dispute id'),
            tenant('merchant', 'Merchant (tenant) the dispute is about'),
            date('opened_at', 'Date the dispute was opened', { trend: 0.01 }),
            dim('reason', { Fraud: 3, 'Product not received': 3, 'Not as described': 2, Duplicate: 1, 'Subscription cancelled': 1.5 }, 'Dispute reason', { role: 'legend' }),
            dim('payment_method', { Card: 7, 'Apple Pay': 2, 'Buy now pay later': 1.5 }, 'Payment method', { role: 'breakdown' }),
            dim('outcome', { Won: 4, Lost: 3, Pending: 2 }, 'Won, Lost or Pending', { role: 'donut' }),
            num('disputed_amount', 'Disputed amount', { mean: 95, sd: 0.7, decimals: 2, kpi: true, primary: true }),
            num('days_open', 'Days the dispute has been open or took to close', { mean: 21, sd: 0.5, agg: 'average', format: '.1f', kpi: true, label: 'Avg. days open' }),
            flag('is_won', '1 if the merchant won the dispute, else 0. Average gives the win rate', { when: { column: 'outcome', values: ['Won'] }, kpi: true, label: 'Win rate' })
          ]
        }
      ]
    },
    edtech: {
      label: 'Education and learning', keywords: ['learning', 'education', 'course', 'courses', 'training', 'academy', 'school', 'students', 'lms', 'e-learning', 'elearning', 'university', 'skills', 'certification', 'teachers'],
      tenantNoun: 'organisation', tenantColumn: 'organisation', persona: 'L&D manager', area: 'learning and compliance',
      tenantNames: ['Zorggroep Rivierland', 'Delta Logistics', 'Gemeente Waalstad', 'Polderfood', 'Brightwave Telecom', 'Kustbank', 'Nordtech Engineering', 'Helder Onderwijs', 'Vita Care', 'Metro Retail'],
      datasets: [
        {
          key: 'enrollments', label: 'Learning activity', rows: 7000,
          description: 'One row per course enrollment of an employee or student. Use it for enrollments, completion rate, learning hours, scores and satisfaction.',
          columns: [
            id('enrollment_id', 'ENR', 'Unique enrollment id'),
            tenant('organisation', 'Organisation (tenant) the learner belongs to'),
            date('enrolled_at', 'Date of enrollment', { trend: 0.02 }),
            dim('department', { Operations: 4, Sales: 2, 'Customer service': 3, Finance: 1.5, IT: 2, HR: 1 }, 'Department of the learner', { role: 'breakdown' }),
            dim('category', { 'Compliance & safety': 4, Leadership: 2, 'Digital skills': 3, Communication: 2, 'Product knowledge': 2 }, 'Topic area of the course', { role: 'breakdown' }),
            dim('learning_method', { 'E-learning': 6, 'Virtual classroom': 2, Classroom: 1.5, Blended: 1.5, Coaching: 0.6 }, 'Learning method', { role: 'legend' }),
            dim('status', { Completed: 9, 'In progress': 3, 'Not started': 1.5, Overdue: 1 }, 'Completed, In progress, Not started or Overdue', { role: 'donut' }),
            num('hours_spent', 'Learning time in hours', { mean: 3.5, sd: 0.7, decimals: 1, kpi: true, primary: true, label: 'Learning hours', factors: { learning_method: { Classroom: 2.5, Blended: 2, 'E-learning': 0.6 } } }),
            num('score', 'Assessment score 0 to 100, empty if not assessed', { mean: 78, sd: 0.12, min: 20, max: 100, agg: 'average', format: '.0f', kpi: true, label: 'Avg. score', blankRate: 0.4 }),
            flag('is_completed', '1 if completed, else 0. Average gives the completion rate', { when: { column: 'status', values: ['Completed'] }, kpi: true, label: 'Completion rate' }),
            flag('is_overdue', '1 if the course is past its deadline, else 0', { when: { column: 'status', values: ['Overdue'] }, label: 'Overdue rate' })
          ]
        },
        supportTickets('organisation', 'organisation', { categories: { 'Login and access': 4, 'Course content': 3, Certificates: 2, Billing: 1, 'Technical issue': 2 } })
      ]
    },
    marketing: {
      label: 'Marketing and advertising', keywords: ['marketing', 'advertising', 'ads', 'campaign', 'campaigns', 'agency', 'seo', 'social media', 'leads', 'lead generation', 'brand awareness', 'media', 'influencer', 'martech', 'growth'],
      tenantNoun: 'client', tenantColumn: 'client', persona: 'marketing manager', area: 'campaigns and leads',
      tenantNames: ['Fresh Bites Meal Kits', 'Arcadia Hotels', 'Kinetic Sportswear', 'Lumière Cosmetics', 'Evergreen Insurance', 'Byte Academy', 'Harbor Homes', 'Solace Skincare', 'Trailhead Outdoors', 'Novus Auto'],
      datasets: [
        {
          key: 'campaign_performance', label: 'Campaign performance', rows: 7000,
          description: 'One row per campaign per day for a client. Use it for impressions, clicks, spend, conversions and revenue by channel.',
          columns: [
            id('row_id', 'CMP', 'Unique row id'),
            tenant('client', 'Client (tenant) that runs the campaign'),
            date('date', 'Day of the campaign results', { trend: 0.02 }),
            dim('channel', { Search: 4, Social: 4, Display: 2, Video: 1.5, Email: 1.5, Affiliate: 1 }, 'Marketing channel', { role: 'legend' }),
            dim('campaign_goal', { Awareness: 2, Consideration: 2.5, Conversion: 4, Retargeting: 2 }, 'Goal of the campaign', { role: 'breakdown' }),
            dim('region', { Benelux: 4, DACH: 3, France: 2, Nordics: 1.5, UK: 2 }, 'Target region', { role: 'breakdown' }),
            dim('device', { Mobile: 6, Desktop: 3.5, 'Connected TV': 0.6 }, 'Device', { role: 'donut' }),
            num('impressions', 'Ad impressions', { mean: 9000, sd: 0.8, kpi: true, factors: { channel: { Display: 3, Video: 2, Email: 0.3 } } }),
            num('clicks', 'Clicks', { mean: 160, sd: 0.8, kpi: true }),
            num('spend', 'Media spend', { mean: 240, sd: 0.7, decimals: 2, kpi: true, primary: true }),
            num('conversions', 'Conversions attributed to the campaign', { mean: 6, sd: 0.9, factors: { campaign_goal: { Conversion: 2, Retargeting: 1.6, Awareness: 0.2 } } }),
            num('revenue', 'Revenue attributed to the campaign', { mean: 520, sd: 0.9, decimals: 2, factors: { campaign_goal: { Conversion: 2, Retargeting: 1.7, Awareness: 0.2 } } })
          ]
        },
        {
          key: 'leads', label: 'Leads', rows: 4500,
          description: 'One row per lead generated for a client. Use it for lead volume, funnel stages, lead score, win rate and pipeline value.',
          columns: [
            id('lead_id', 'LED', 'Unique lead id'),
            tenant('client', 'Client (tenant) that received the lead'),
            date('created_at', 'Date the lead was created', { trend: 0.025 }),
            dim('source', { 'Paid search': 3, 'Paid social': 3, Webinar: 1.5, 'Content download': 2.5, Referral: 1, Events: 1 }, 'Lead source', { role: 'legend' }),
            dim('segment', { SMB: 5, 'Mid-market': 3, Enterprise: 1.2 }, 'Company size of the lead', { role: 'breakdown' }),
            dim('stage', { MQL: 6, SQL: 3, Opportunity: 1.5, Won: 0.8, Lost: 2.5 }, 'Funnel stage', { role: 'donut' }),
            num('lead_score', 'Lead score 0 to 100', { mean: 55, sd: 0.3, min: 0, max: 100, agg: 'average', format: '.0f', kpi: true, label: 'Avg. lead score' }),
            num('pipeline_value', 'Pipeline value of the lead', { mean: 3200, sd: 0.9, decimals: 0, kpi: true, primary: true, factors: { segment: { Enterprise: 5, 'Mid-market': 2 } } }),
            flag('is_won', '1 if the lead became a customer, else 0. Average gives the win rate', { when: { column: 'stage', values: ['Won'] }, kpi: true, label: 'Win rate' })
          ]
        }
      ]
    },
    manufacturing: {
      label: 'Manufacturing and industrial', keywords: ['manufacturing', 'industrial', 'factory', 'production', 'machines', 'machine', 'iot', 'sensors', 'maintenance', 'equipment', 'plant', 'automation', 'oem', 'engineering', 'industry 4.0'],
      tenantNoun: 'plant', tenantColumn: 'plant', persona: 'plant manager', area: 'production and maintenance',
      tenantNames: ['Eindhoven Precision', 'Baltic Steelworks', 'Rhône Packaging', 'Silesia Components', 'Tilburg Plastics', 'Nordic Paper Mill', 'Bavaria Drives', 'Lombardy Textiles', 'Ghent Chemicals', 'Aarhus Foods Plant'],
      datasets: [
        {
          key: 'production_runs', label: 'Production runs', rows: 6500,
          description: 'One row per production run on a line at a plant. Use it for output, downtime, energy use, scrap and first pass yield.',
          columns: [
            id('run_id', 'RUN', 'Unique production run id'),
            tenant('plant', 'Plant (tenant) where the run took place'),
            date('run_date', 'Date of the run', { trend: 0.01 }),
            dim('production_line', { 'Line 1': 3, 'Line 2': 3, 'Line 3': 2.5, 'Line 4': 2, 'Line 5': 1.5 }, 'Production line', { role: 'breakdown' }),
            dim('product_family', { Standard: 5, Premium: 2, Custom: 1.5, Spare: 1 }, 'Product family', { role: 'legend' }),
            dim('shift', { Early: 4, Late: 4, Night: 2.5 }, 'Shift', { role: 'breakdown' }),
            dim('run_status', { Completed: 14, 'Stopped early': 1.5, Rework: 1 }, 'Completed, Stopped early or Rework', { role: 'donut' }),
            num('units_produced', 'Units produced in the run', { mean: 820, sd: 0.4, kpi: true, primary: true, label: 'Units produced' }),
            num('downtime_minutes', 'Unplanned downtime in minutes', { mean: 18, sd: 1.1, kpi: true, label: 'Downtime minutes', factors: { shift: { Night: 1.6 }, run_status: { 'Stopped early': 4 } } }),
            num('energy_kwh', 'Energy used in kWh', { mean: 1400, sd: 0.4, label: 'Energy (kWh)' }),
            flag('is_first_pass', '1 if the run passed quality first time, else 0. Average gives first pass yield', { rate: 0.94, kpi: true, label: 'First pass yield', factors: { run_status: { Rework: 0 } } })
          ]
        },
        {
          key: 'maintenance', label: 'Maintenance', rows: 3500,
          description: 'One row per maintenance work order at a plant. Use it for work orders, unplanned maintenance, repair time and cost.',
          columns: [
            id('work_order_id', 'WO', 'Unique work order id'),
            tenant('plant', 'Plant (tenant) the asset belongs to'),
            date('opened_at', 'Date the work order was opened', { trend: 0.005 }),
            dim('asset_type', { 'CNC machine': 3, Press: 2, Conveyor: 3, Robot: 2, Compressor: 1.5, 'Packaging line': 2 }, 'Asset type', { role: 'breakdown' }),
            dim('maintenance_type', { Preventive: 5, Corrective: 3, Predictive: 2 }, 'Preventive, Corrective or Predictive', { role: 'legend' }),
            dim('priority', { Low: 3, Medium: 4, High: 2, Critical: 0.6 }, 'Priority', { role: 'donut' }),
            num('repair_hours', 'Hours to complete the work order', { mean: 4.5, sd: 0.7, decimals: 1, agg: 'average', format: '.1f', kpi: true, label: 'Avg. repair hours', factors: { maintenance_type: { Corrective: 1.9, Predictive: 0.7 } } }),
            num('cost', 'Parts and labour cost', { mean: 650, sd: 0.8, decimals: 2, kpi: true, primary: true, factors: { maintenance_type: { Corrective: 2.2 } } }),
            flag('is_unplanned', '1 if the work order was corrective (unplanned), else 0', { when: { column: 'maintenance_type', values: ['Corrective'] }, kpi: true, label: 'Unplanned share' })
          ]
        }
      ]
    },
    realestate: {
      label: 'Real estate and property', keywords: ['real estate', 'property', 'properties', 'proptech', 'rent', 'rental', 'lease', 'tenants', 'housing', 'building', 'facility', 'facilities', 'landlord', 'apartments', 'office space'],
      tenantNoun: 'property owner', tenantColumn: 'owner', persona: 'asset manager', area: 'rent collection and maintenance',
      tenantNames: ['Canal House Estates', 'Vesta Living', 'Brickline Offices', 'Dune Residential', 'Parkview Properties', 'Granite Logistics Parks', 'Haven Student Housing', 'Meadow Retail Centres', 'Skyline Apartments', 'Oak & Iron Real Estate'],
      datasets: [
        {
          key: 'rent_invoices', label: 'Rent collection', rows: 6000,
          description: 'One row per rent invoice for a unit owned by a property owner. Use it for rent roll, late payments and arrears.',
          columns: [
            id('invoice_id', 'INV', 'Unique invoice id'),
            tenant('owner', 'Property owner (tenant) that issued the invoice'),
            date('due_date', 'Date the rent was due', { trend: 0.008 }),
            dim('property_type', { Residential: 6, Office: 2, Retail: 1.5, Logistics: 1 }, 'Property type', { role: 'legend' }),
            dim('city', { Amsterdam: 4, Rotterdam: 3, Utrecht: 2.5, 'The Hague': 2, Eindhoven: 1.5 }, 'City', { role: 'breakdown' }),
            dim('unit_size', { Small: 4, Medium: 4, Large: 2 }, 'Unit size', { role: 'breakdown' }),
            dim('payment_status', { 'Paid on time': 14, 'Paid late': 3, Outstanding: 1 }, 'Paid on time, Paid late or Outstanding', { role: 'donut' }),
            num('rent_amount', 'Invoiced rent', { mean: 1350, sd: 0.4, decimals: 2, kpi: true, primary: true, label: 'Rent invoiced', factors: { property_type: { Office: 4, Retail: 3, Logistics: 6 }, unit_size: { Large: 1.8, Small: 0.7 } } }),
            num('days_late', 'Days paid after the due date', { mean: 3, sd: 1.2, agg: 'average', format: '.1f', kpi: true, label: 'Avg. days late', factors: { payment_status: { 'Paid on time': 0 } } }),
            flag('is_outstanding', '1 if the invoice is still unpaid, else 0. Average gives the arrears rate', { when: { column: 'payment_status', values: ['Outstanding'] }, kpi: true, label: 'Arrears rate' })
          ]
        },
        {
          key: 'maintenance_requests', label: 'Maintenance requests', rows: 3500,
          description: 'One row per maintenance request from a resident or occupier. Use it for request volume, resolution time, cost and ratings.',
          columns: [
            id('request_id', 'REQ', 'Unique request id'),
            tenant('owner', 'Property owner (tenant) responsible for the unit'),
            date('reported_at', 'Date the request was reported', { trend: 0.01 }),
            dim('category', { Plumbing: 3, Electrical: 2, Heating: 2.5, Cleaning: 2, Security: 1, 'Doors and windows': 1.5 }, 'Type of request', { role: 'legend' }),
            dim('property_type', { Residential: 6, Office: 2, Retail: 1.5 }, 'Property type', { role: 'breakdown' }),
            dim('status', { Closed: 9, 'In progress': 1.5, Open: 1 }, 'Closed, In progress or Open', { role: 'donut' }),
            num('resolution_hours', 'Hours until the request was closed', { mean: 48, sd: 0.7, decimals: 1, agg: 'average', format: '.1f', kpi: true, label: 'Avg. resolution hours' }),
            num('cost', 'Repair cost', { mean: 180, sd: 0.9, decimals: 2, kpi: true, primary: true }),
            num('rating', 'Occupier rating 1 to 5, empty if not rated', { mean: 4, sd: 0.2, min: 1, max: 5, agg: 'average', format: '.1f', kpi: true, label: 'Avg. rating', blankRate: 0.45 })
          ]
        }
      ]
    },
    hospitality: {
      label: 'Hospitality and travel', keywords: ['hotel', 'hotels', 'hospitality', 'travel', 'booking', 'bookings', 'restaurant', 'restaurants', 'guests', 'tourism', 'reservations', 'vacation', 'airline', 'events', 'venue'],
      tenantNoun: 'property', tenantColumn: 'property', persona: 'revenue manager', area: 'bookings and guest reviews',
      tenantNames: ['Hotel Grachtenhuis', 'Seaside Resort Zandvoort', 'Alpine Lodge Tirol', 'City Hub Antwerp', 'Hotel Lumen Berlin', 'Château Vert', 'Harbour Inn Hamburg', 'Riviera Suites Nice', 'Forest Retreat Veluwe', 'Old Town Boutique Prague'],
      datasets: [
        {
          key: 'bookings', label: 'Bookings', rows: 7000,
          description: 'One row per booking at a property. Use it for room nights, revenue, channels, lead time and cancellations.',
          columns: [
            id('booking_id', 'BKG', 'Unique booking id'),
            tenant('property', 'Property (tenant) that was booked'),
            date('stay_date', 'Arrival date', { trend: 0.02 }),
            dim('channel', { Direct: 4, 'Booking platform': 5, 'Travel agent': 1.5, Corporate: 1.5 }, 'Booking channel', { role: 'legend' }),
            dim('room_type', { Standard: 5, Superior: 3, Suite: 1, Family: 1.5 }, 'Room type', { role: 'breakdown' }),
            dim('guest_segment', { Leisure: 6, Business: 3, Group: 1 }, 'Guest segment', { role: 'breakdown' }),
            dim('booking_status', { Stayed: 12, Cancelled: 2.5, 'No-show': 0.5 }, 'Stayed, Cancelled or No-show', { role: 'donut' }),
            num('room_nights', 'Number of room nights', { mean: 2.4, sd: 0.5, min: 1, kpi: true, label: 'Room nights' }),
            num('revenue', 'Room revenue of the booking', { mean: 310, sd: 0.5, decimals: 2, kpi: true, primary: true, factors: { room_type: { Suite: 2.4, Superior: 1.3, Family: 1.5 }, booking_status: { Cancelled: 0 } } }),
            num('lead_time_days', 'Days between booking and arrival', { mean: 34, sd: 0.7, agg: 'average', format: '.0f', label: 'Avg. lead time (days)', factors: { guest_segment: { Business: 0.35 } } }),
            flag('is_cancelled', '1 if the booking was cancelled, else 0. Average gives the cancellation rate', { when: { column: 'booking_status', values: ['Cancelled'] }, kpi: true, label: 'Cancellation rate' })
          ]
        },
        {
          key: 'guest_reviews', label: 'Guest reviews', rows: 3500,
          description: 'One row per guest review of a property. Use it for ratings, sentiment, topics and response rate.',
          columns: [
            id('review_id', 'REV', 'Unique review id'),
            tenant('property', 'Property (tenant) that was reviewed'),
            date('review_date', 'Date of the review', { trend: 0.015 }),
            dim('platform', { 'Booking platform': 5, 'Review site': 3, 'Own survey': 2, Maps: 2 }, 'Where the review was posted', { role: 'legend' }),
            dim('topic', { Room: 3, Staff: 3, Breakfast: 2, Location: 2, Cleanliness: 2.5, Value: 2 }, 'Main topic of the review', { role: 'breakdown' }),
            dim('sentiment', { Positive: 7, Neutral: 2, Negative: 1.5 }, 'Positive, Neutral or Negative', { role: 'donut' }),
            num('rating', 'Guest rating 1 to 10', { mean: 8.2, sd: 0.12, decimals: 1, min: 1, max: 10, agg: 'average', format: '.1f', kpi: true, primary: true, label: 'Avg. rating', factors: { sentiment: { Negative: 0.6, Neutral: 0.85 } } }),
            flag('is_responded', '1 if the property responded to the review, else 0. Average gives the response rate', { rate: 0.68, kpi: true, label: 'Response rate' })
          ]
        }
      ]
    },
    generic: {
      label: 'Other (generic B2B platform)', keywords: [],
      tenantNoun: 'customer', tenantColumn: 'customer', persona: 'operations manager', area: 'platform activity',
      tenantNames: ['Acme Industries', 'Globex Services', 'Initech Solutions', 'Umbrella Partners', 'Stark Distribution', 'Wayne Holdings', 'Hooli Retail', 'Vandelay Imports', 'Soylent Foods', 'Wonka Brands'],
      datasets: [
        {
          key: 'activity', label: 'Platform activity', rows: 7000,
          description: 'One row per transaction a customer processed on the platform. Use it for volume, value, processing time and failures.',
          columns: [
            id('transaction_id', 'TRX', 'Unique transaction id'),
            tenant('customer', 'Customer (tenant) that processed the transaction'),
            date('transaction_date', 'Date of the transaction', { trend: 0.025 }),
            dim('product_area', { 'Core platform': 5, Reporting: 3, Integrations: 2, 'Mobile app': 2.5, Admin: 1 }, 'Part of the platform used', { role: 'legend' }),
            dim('region', { EMEA: 5, 'North America': 3, LATAM: 1, APAC: 1.5 }, 'Region', { role: 'breakdown' }),
            dim('user_type', { Admin: 1, 'Power user': 3, 'Standard user': 6 }, 'Type of user', { role: 'breakdown' }),
            dim('status', { Successful: 16, Warning: 1.5, Failed: 0.8 }, 'Successful, Warning or Failed', { role: 'donut' }),
            num('value', 'Business value of the transaction', { mean: 120, sd: 0.7, decimals: 2, kpi: true, primary: true }),
            num('processing_seconds', 'Processing time in seconds', { mean: 2.4, sd: 0.5, decimals: 2, agg: 'average', format: '.2f', kpi: true, label: 'Avg. processing seconds' }),
            flag('is_failed', '1 if the transaction failed, else 0. Average gives the failure rate', { when: { column: 'status', values: ['Failed'] }, kpi: true, label: 'Failure rate' })
          ]
        },
        supportTickets('customer', 'customer')
      ]
    }
  };

  // ---------- industry detection ----------
  function detectIndustry(text) {
    const t = ` ${String(text || '').toLowerCase().replace(/[^a-z0-9.&\- ]+/g, ' ')} `;
    const scores = {};
    for (const [key, ind] of Object.entries(INDUSTRIES)) {
      let score = 0;
      const hits = [];
      for (const kw of ind.keywords) {
        const re = new RegExp(`[^a-z]${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^a-z]`, 'g');
        const n = (t.match(re) || []).length;
        if (n) { score += Math.min(n, 6) * (kw.includes(' ') ? 2 : 1); hits.push(kw); }
      }
      scores[key] = { score, hits };
    }
    // Generic SaaS words show up on almost every website, so SaaS needs a clear lead.
    if (scores.saas) scores.saas.score *= 0.6;
    const ranked = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
    const [best, info] = ranked[0];
    const key = info.score >= 2 ? best : 'generic';
    return { key, label: INDUSTRIES[key].label, hits: key === 'generic' ? [] : info.hits.slice(0, 6), ranked: ranked.slice(0, 4).map(([k, v]) => ({ key: k, score: +v.score.toFixed(1) })) };
  }

  // ---------- colours ----------
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function parseHex(hex) {
    const h = String(hex || '').replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    if (!/^[0-9a-f]{6}$/i.test(full)) return null;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const toHex = (rgb) => `#${rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  const mix = (a, b, t) => { const x = parseHex(a); const y = parseHex(b); return x && y ? toHex(x.map((v, i) => v + (y[i] - v) * t)) : a; };
  function luminance(hex) {
    const c = parseHex(hex);
    if (!c) return 0;
    const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  const contrast = (a, b) => { const x = luminance(a); const y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const normHex = (hex, fallback) => (parseHex(hex) ? toHex(parseHex(hex)) : fallback);

  // Fills in everything the portal needs from the three brand colours.
  function completeBrand(b) {
    const primary = normHex(b.primary, '#3B2A8C');
    const accent = normHex(b.accent, mix(primary, '#00BFA6', 0.6));
    const cta = normHex(b.cta, accent);
    const third = cta === accent ? mix(primary, accent, 0.5) : cta;
    const onPrimary = contrast(primary, '#FFFFFF') >= 3 ? '#FFFFFF' : '#111111';
    return {
      ...b,
      primary, accent, cta, onPrimary,
      onCta: contrast(cta, '#FFFFFF') >= 2.6 ? '#FFFFFF' : '#111111',
      background: normHex(b.background, mix(primary, '#FFFFFF', 0.965)),
      surface: normHex(b.surface, '#FFFFFF'),
      text: normHex(b.text, '#16181D'),
      muted: normHex(b.muted, '#5B6472'),
      font: b.font || 'Inter',
      headingFont: b.headingFont || b.font || 'Inter',
      palette: b.palette?.length ? b.palette : [primary, accent, third, mix(primary, '#FFFFFF', 0.45), mix(accent, '#FFFFFF', 0.45), mix(third, '#FFFFFF', 0.45), mix(primary, '#000000', 0.35), mix(accent, '#000000', 0.3)]
    };
  }

  // ---------- portal spec ----------
  const LUZMO_TYPE = { id: 'hierarchy', tenant: 'hierarchy', dim: 'hierarchy', date: 'datetime', measure: 'numeric', flag: 'numeric' };
  const labelOf = (c) => c.label || pretty(c.name);
  // Lower-cases a label for use mid-sentence but keeps acronyms like SLA or CSAT.
  const lc = (s) => s.split(' ').map((w) => (/[A-Z].*[A-Z]/.test(w) ? w : w.toLowerCase())).join(' ');

  function slotFor(dataset, c, extra = {}) {
    if (c.kind === 'measure' || c.kind === 'flag') return { dataset, column: c.name, agg: c.agg, format: c.format, label: labelOf(c), ...extra };
    return { dataset, column: c.name, ...extra };
  }

  // One page per dataset: KPI row, trend by the legend dimension, status donut, two breakdowns and a heat table.
  function autoPage(key, ds, { first = false, tenantNoun = 'customer' } = {}) {
    const cols = ds.columns;
    const idCol = cols.find((c) => c.kind === 'id');
    const dateCol = cols.find((c) => c.kind === 'date');
    const legend = cols.find((c) => c.role === 'legend');
    const donut = cols.find((c) => c.role === 'donut');
    const breakdowns = cols.filter((c) => c.role === 'breakdown');
    const primary = cols.find((c) => c.primary) || cols.find((c) => c.kind === 'measure');
    const rate = cols.find((c) => c.kind === 'flag' && c.kpi) || cols.find((c) => c.kind === 'flag');
    const count = { dataset: key, column: idCol.name, agg: 'count', format: ',.0f', label: pretty(ds.label) };
    const kpis = [count, ...cols.filter((c) => c.kpi).map((c) => slotFor(key, c))].slice(0, 4);
    const charts = kpis.map((m) => ({ type: 'evolution-number', title: m.label, w: 12 / kpis.length, h: 1, slots: { measure: [m], evolution: [{ dataset: key, column: dateCol.name, level: 3 }] } }));
    const main = primary ? slotFor(key, primary) : count;
    charts.push({
      type: 'column-chart', title: `${main.label} per month${legend ? ` by ${lc(labelOf(legend))}` : ''}`, w: donut ? 8 : 12, h: 2,
      slots: { measure: [main], 'x-axis': [{ dataset: key, column: dateCol.name, level: 3 }], ...(legend ? { legend: [{ dataset: key, column: legend.name }] } : {}) },
      options: { mode: 'stacked' }
    });
    if (donut) charts.push({ type: 'donut-chart', title: labelOf(donut), w: 4, h: 2, slots: { measure: [count], category: [{ dataset: key, column: donut.name }] } });
    const b1 = breakdowns[0] || legend;
    const b2 = breakdowns[1] || legend;
    if (b1) charts.push({ type: 'bar-chart', title: `${main.label} by ${lc(labelOf(b1))}`, w: 6, h: 2, slots: { measure: [main], 'y-axis': [{ dataset: key, column: b1.name }] } });
    if (b2) {
      const m = rate ? slotFor(key, rate) : count;
      charts.push({ type: 'bar-chart', title: `${m.label} by ${lc(labelOf(b2))}`, w: 6, h: 2, slots: { measure: [m], 'y-axis': [{ dataset: key, column: b2.name }] } });
    }
    if (b1 && legend && b1 !== legend) {
      charts.push({ type: 'heat-table', title: `${main.label} by ${lc(labelOf(b1))} and ${lc(labelOf(legend))}`, w: 12, h: 2, slots: { measure: [main], 'y-axis': [{ dataset: key, column: b1.name }], 'x-axis': [{ dataset: key, column: legend.name }] } });
    }
    // Drill-downs. Clicking a bar or slice filters the whole dashboard (interactivity.select), down to
    // the detail table at the bottom. The first page also gets a chart per tenant: in the
    // "All organisations" view, clicking a bar there drills into that organisation in the portal.
    const tenantCol = cols.find((c) => c.kind === 'tenant');
    if (first && tenantCol) {
      charts.push({ type: 'bar-chart', title: `${main.label} by ${lc(pretty(tenantNoun))}`, w: 12, h: 2, drill: 'tenant', slots: { measure: [main], 'y-axis': [{ dataset: key, column: tenantCol.name }] } });
    }
    const detail = [idCol, dateCol, legend, donut, ...breakdowns, primary, rate].filter(Boolean).filter((c, i, a) => a.indexOf(c) === i).slice(0, 8);
    charts.push({ type: 'regular-table', title: `${pretty(ds.label)}: detail`, w: 12, h: 3, slots: { columns: detail.map((c) => (c.kind === 'date' ? { dataset: key, column: c.name, level: 5, label: labelOf(c) } : { dataset: key, column: c.name, label: c.kind === 'flag' ? pretty(c.name.replace(/^is_/, '')) : labelOf(c) })) } });
    for (const c of charts) if (['bar-chart', 'column-chart', 'donut-chart', 'heat-table'].includes(c.type)) c.options = { ...(c.options || {}), interactivity: { select: true } };
    return { id: key.replace(/_/g, '-'), title: ds.label, subtitle: ds.description.replace(/^One row per [^.]*\. Use it for /, '').replace(/\.$/, '').replace(/^\w/, (c) => c.toUpperCase()), charts };
  }

  function aiPrompts(P) {
    const asks = [];
    const builds = [];
    let add = null;
    for (const [key, ds] of Object.entries(P.datasets)) {
      const cols = ds.columns;
      const primary = cols.find((c) => c.primary) || cols.find((c) => c.kind === 'measure');
      const rate = cols.find((c) => c.kind === 'flag' && c.kpi);
      const b = cols.find((c) => c.role === 'breakdown');
      const legend = cols.find((c) => c.role === 'legend');
      if (primary && b) asks.push(`Which ${lc(labelOf(b))} has the highest ${lc(labelOf(primary))}?`);
      if (rate) asks.push(`How did the ${lc(labelOf(rate))} change over the last 6 months?`);
      if (primary && legend) builds.push(`Build a dashboard on ${lc(labelOf(primary))} by ${lc(labelOf(legend))} and month`);
      if (!add && primary) add = `Add a chart with ${lc(labelOf(primary))} per month to this dashboard`;
      if (key && asks.length > 6) break;
    }
    return { aiSuggestions: asks.slice(0, 4), aiBuildSuggestions: builds.slice(0, 2), aiAddSuggestion: add };
  }

  function iqLines(P) {
    const lines = [];
    for (const ds of Object.values(P.datasets)) {
      for (const c of ds.columns) {
        if (c.kind === 'flag') lines.push(`${labelOf(c)} is the average of ${c.name}.`);
        else if (c.kind === 'measure' && c.agg === 'average') lines.push(`${labelOf(c)} is the average of ${c.name}, never the sum.`);
      }
    }
    return lines;
  }

  const DEFAULT_FEATURES = { templates: true, tenants: true, ede: true, ack: true, ai: true, exports: true, howto: true, myDashboards: true };

  function currencyFor(website) {
    const host = String(website || '').toLowerCase();
    if (/\.(co\.uk|uk)(\/|$)/.test(host)) return 'GBP';
    if (/\.(com|us|io|ai|co)(\/|$)/.test(host)) return 'USD';
    return 'EUR';
  }

  // input: { company, website, moduleName, aiName, brand, industry, tenantNames, email, features, seed, currency }
  function buildPortal(input) {
    const company = String(input.company || '').trim() || 'Your company';
    const industry = INDUSTRIES[input.industry] ? input.industry : 'generic';
    const ind = INDUSTRIES[industry];
    const seed = input.seed || `${slugify(company)}-${industry}`;
    const r = rng(`${seed}-tenants`);
    let names = (input.tenantNames || []).map((n) => String(n).trim()).filter(Boolean);
    if (!names.length) {
      const pool = [...ind.tenantNames];
      while (names.length < 5 && pool.length) names.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    }
    names = [...new Set(names)].slice(0, 8);
    const tenants = names.map((name, i) => ({ name, size: +(1.6 - i * 0.22 + r() * 0.3).toFixed(2) }));
    const moduleName = String(input.moduleName || '').trim() || `${company} Insights`;
    const logoText = String(input.brand?.logoText || company).trim();
    const brand = completeBrand({ ...(input.brand || {}), productName: moduleName, logoText, aiName: String(input.aiName || '').trim() || `${logoText} AI` });
    const datasets = {};
    for (const ds of ind.datasets) {
      datasets[ds.key] = {
        name: `${moduleName} | ${ds.label}`,
        label: ds.label,
        description: ds.description,
        rows: ds.rows,
        columns: ds.columns.map((c) => ({ ...c, type: LUZMO_TYPE[c.kind] }))
      };
    }
    const P = {
      version: 1,
      slug: slugify(moduleName),
      company,
      website: input.website || '',
      language: 'en',
      timezone: input.timezone || 'Europe/Amsterdam',
      currency: input.currency || currencyFor(input.website),
      contactEmail: input.email || '',
      industry,
      industryLabel: ind.label,
      area: ind.area,
      seed,
      brand,
      tenantLabel: pretty(ind.tenantNoun),
      tenantPersona: ind.persona,
      tenants,
      tenantColumn: ind.tenantColumn,
      datasets,
      pages: [],
      features: { ...DEFAULT_FEATURES, ...(input.features || {}) },
      links: { technicalCall: 'https://calendly.com/d/cygt-jjc-tr4/luzmo-technical-call-1h', requestIq: 'https://calendly.com/d/cygt-jjc-tr4/luzmo-technical-call-1h' },
      createdAt: new Date().toISOString()
    };
    P.pages = Object.entries(datasets).map(([key, ds], i) => autoPage(key, ds, { first: i === 0, tenantNoun: ind.tenantNoun }));
    Object.assign(P, aiPrompts(P));
    P.iqContext = iqLines(P);
    return P;
  }

  // ---------- synthetic rows ----------
  function isoDay(d) { return `${d.toISOString().slice(0, 10)}T00:00:00.000Z`; }

  // Rows as arrays in column order. `now` anchors the date range so data always runs up to today.
  function generateRows(P, key, { now = Date.now() } = {}) {
    const ds = P.datasets[key];
    const r = rng(`${P.seed}-${key}`);
    const end = new Date(now);
    end.setUTCHours(0, 0, 0, 0);
    const cols = ds.columns;
    // Each tenant gets its own mix, size and performance so "Viewing as" shows different numbers.
    const profiles = P.tenants.map((t) => {
      const p = { name: t.name, size: t.size, weights: {}, fixed: {}, mult: {} };
      for (const c of cols) {
        if (c.kind === 'dim' && c.perTenant) p.fixed[c.name] = pick(r, c.values);
        else if (c.kind === 'dim') p.weights[c.name] = Object.fromEntries(Object.entries(c.values).map(([v, w]) => [v, w * (0.5 + r())]));
        else if (c.kind === 'measure' || c.kind === 'flag') p.mult[c.name] = 1 + (r() - 0.5) * 0.5;
      }
      return p;
    });
    const tenantWeights = Object.fromEntries(profiles.map((p, i) => [i, p.size]));
    const n = ds.rows;
    const rows = [];
    for (let i = 0; i < n; i++) {
      const p = profiles[pick(r, tenantWeights)];
      const v = {};
      let monthIdx = 0;
      for (const c of cols) {
        if (c.kind === 'tenant') v[c.name] = p.name;
        else if (c.kind === 'id') v[c.name] = `${c.prefix}-${String(i + 1).padStart(6, '0')}`;
        else if (c.kind === 'dim') v[c.name] = c.perTenant ? p.fixed[c.name] : pick(r, p.weights[c.name]);
        else if (c.kind === 'date') {
          const months = c.months || 18;
          const growth = 1 + (c.trend || 0);
          const w = {};
          for (let m = 0; m < months; m++) w[m] = growth ** m;
          monthIdx = Number(pick(r, w));
          const back = months - 1 - monthIdx;
          const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - back, 1));
          const daysInMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
          const maxDay = back === 0 ? end.getUTCDate() : daysInMonth;
          d.setUTCDate(1 + Math.floor(r() * maxDay));
          v[c.name] = isoDay(d);
          v.__month = monthIdx;
        }
      }
      for (const c of cols) {
        if (c.kind === 'measure') {
          if (c.blankRate && r() < c.blankRate) { v[c.name] = null; continue; }
          let x = c.mean * Math.exp(gauss(r) * (c.sd || 0.3) - ((c.sd || 0.3) ** 2) / 2);
          if (c.sd < 0.2) x = c.mean * (1 + gauss(r) * c.sd);
          for (const [col, f] of Object.entries(c.factors || {})) if (f[v[col]] !== undefined) x *= f[v[col]];
          x *= p.mult[c.name];
          if (c.max !== undefined) x = Math.min(c.max, x);
          if (c.min !== undefined) x = Math.max(c.min, x);
          const k = 10 ** (c.decimals || 0);
          v[c.name] = Math.round(x * k) / k;
        } else if (c.kind === 'flag') {
          if (c.when) { v[c.name] = c.when.values.includes(v[c.when.column]) ? 1 : 0; continue; }
          let rate = c.rate * p.mult[c.name];
          for (const [col, f] of Object.entries(c.factors || {})) if (f[v[col]] !== undefined) rate *= f[v[col]];
          // Small improvement over time on the "bad" flags, so trends read like a real product.
          if (c.rate < 0.5) rate *= 1.15 - 0.3 * ((v.__month || 0) / 18);
          v[c.name] = r() < clamp(rate, 0, 0.98) ? 1 : 0;
        }
      }
      rows.push(cols.map((c) => v[c.name] ?? null));
    }
    return rows;
  }

  function generateData(P, opts) {
    return Object.fromEntries(Object.keys(P.datasets).map((k) => [k, generateRows(P, k, opts)]));
  }

  return {
    INDUSTRIES, DEFAULT_FEATURES, detectIndustry, buildPortal, generateRows, generateData,
    completeBrand, mix, contrast, luminance, parseHex, toHex, slugify, pretty, labelOf, rng, hash, currencyFor
  };
});
