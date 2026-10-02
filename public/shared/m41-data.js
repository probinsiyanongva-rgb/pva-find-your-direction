/* PVA Academy — Stage 4 · Module 4.1 content data.
   Source of truth: PVA_Module_4.1_Production_Specification_v1.md (locked).
   Learner-facing text below is transcribed verbatim. IDs are stable and are
   what learner state stores, so never rename an ID once released. */
(function () {
  'use strict';

  var PATTERNS = [
    { id: 'organize', name: 'ORGANIZE', def: 'Arranging information so people can find, understand, and use it.' },
    { id: 'communicate', name: 'COMMUNICATE', def: 'Helping information move clearly between people.' },
    { id: 'research', name: 'RESEARCH', def: 'Finding, checking, comparing, and analyzing information so someone can make a decision or take action.' },
    { id: 'create', name: 'CREATE', def: 'Producing useful content or visual material.' },
    { id: 'operate', name: 'OPERATE', def: 'Keeping a recurring business process running inside the tools and systems used by the business.' }
  ];

  /* Section 1 observation options (spec §3, Post A; applied to all four posts by decision). */
  var POST_OPTIONS = [
    { id: 'obs-organizing', label: 'Organizing information' },
    { id: 'obs-communicating', label: 'Communicating and following up' },
    { id: 'obs-numbers', label: 'Working with numbers or reports' },
    { id: 'obs-recurring', label: 'Keeping recurring tasks moving' },
    { id: 'obs-creating', label: 'Creating content' }
  ];

  var POSTS = [
    {
      id: 'post-a', letter: 'A', title: 'VIRTUAL ASSISTANT — ADMIN SUPPORT',
      body: 'We’re looking for someone to help keep our small business organized. Tasks include maintaining files, updating spreadsheets, organizing appointments, preparing simple reports, and following up on outstanding items.',
      ask: 'What stands out about the actual work?',
      feedback: 'Several patterns can appear here. The important part is that the title <strong>“Virtual Assistant”</strong> does not tell you exactly what the work will look like. The task list does.'
    },
    {
      id: 'post-b', letter: 'B', title: 'VIRTUAL ASSISTANT — CUSTOMER SUPPORT',
      body: 'Respond to customer questions through email and chat, follow support guidelines, document issues, escalate problems when needed, and keep customers updated until their concerns are resolved.',
      ask: 'What kind of work is most visible here?',
      feedback: 'Communication is central, but this work also involves organized records, following a process, and making sure issues move toward resolution.'
    },
    {
      id: 'post-c', letter: 'C', title: 'VIRTUAL ASSISTANT — E-COMMERCE',
      body: 'Help process orders, update product information, monitor inventory, check customer messages, and keep our online store information accurate.',
      ask: 'What stands out about the actual work?',
      feedback: 'This title tells you the business environment, but the task list tells you what you would actually do: operate business processes, organize information, and communicate with customers.'
    },
    {
      id: 'post-d', letter: 'D', title: 'SOCIAL MEDIA VA',
      body: 'Prepare weekly content, resize graphics, schedule posts, organize content ideas, monitor comments, and coordinate requested revisions.',
      ask: 'What stands out about the actual work?',
      feedback: '“Social Media VA” sounds like one kind of work, but the actual tasks combine creating, organizing, and communicating.'
    }
  ];

  var SCENARIOS = [
    {
      id: 'scn-organizing-information', num: 1, title: 'Organizing Information',
      body: 'A client sends you several folders of documents. Some files are duplicated, some have unclear names, and others are in the wrong folders. Your task is to clean them up and arrange them so the team can find what they need.',
      mainly: 'ORGANIZE',
      explanation: 'The main job is arranging information so other people can find and use it easily.',
      thinkOf: { name: 'ORGANIZE', text: 'Making information orderly and usable.' }
    },
    {
      id: 'scn-customer-communication', num: 2, title: 'Customer Communication',
      body: 'A customer sends a question about an order. You check the support guidelines, respond clearly, document the interaction, and follow up when the issue needs another team’s help.',
      mainly: 'COMMUNICATE',
      explanation: 'Communication is central because the work helps information move clearly between the customer and the business. It also touches ORGANIZE and OPERATE because the interaction must be documented and the support process followed.',
      thinkOf: { name: 'COMMUNICATE', text: 'Helping information move clearly between people.' }
    },
    {
      id: 'scn-research-analysis', num: 3, title: 'Research and Analysis',
      body: 'A client wants to compare several competitors. You gather information from their websites, organize the findings, compare prices and product features, and highlight changes that may matter to the client.',
      mainly: 'RESEARCH',
      explanation: 'The work involves finding, checking, comparing, and analyzing information so the client can make a decision.',
      thinkOf: { name: 'RESEARCH', text: 'Finding and making sense of information that helps someone act.' },
      extra: '<p>Numbers can be part of this work. Basic reporting and noticing changes in business numbers also belong here.</p>'
    },
    {
      id: 'scn-creating-content', num: 4, title: 'Creating Content',
      body: 'A client gives you next month’s content topics. You prepare simple graphics, format captions, organize the content calendar, and prepare the files for review.',
      mainly: 'CREATE',
      explanation: 'Producing the content is the main task. The work also involves ORGANIZE because the materials need to be arranged and prepared properly.',
      thinkOf: { name: 'CREATE', text: 'Producing useful content or visual material.' }
    },
    {
      id: 'scn-keeping-process-running', num: 5, title: 'Keeping a Process Running',
      body: 'A client receives online orders throughout the day. You process the orders in the store system, check inventory information, update order statuses, and flag problems that need attention.',
      mainly: 'OPERATE',
      explanation: 'The main job is keeping an ongoing business process moving correctly inside the tools the business uses.',
      thinkOf: { name: 'OPERATE', text: 'Keeping a recurring business process running inside its systems.' },
      extra: '<div class="key-idea distinction"><h4>A useful distinction</h4>' +
        '<p><strong>ORGANIZE</strong> makes information orderly and usable.</p>' +
        '<p><strong>OPERATE</strong> keeps an ongoing business process working correctly.</p>' +
        '<p>For example:</p><ul><li>Cleaning up and arranging an order spreadsheet → <strong>ORGANIZE</strong></li>' +
        '<li>Processing and updating orders in the store system → <strong>OPERATE</strong></li></ul>' +
        '<p>The point is not to find a perfect label. The point is to explain <strong>why</strong> one pattern is more central to the work.</p></div>'
    }
  ];

  var PPC_NOTE = '<strong>Related specialization:</strong> Some VAs later develop into specialized areas such as Amazon PPC. That work requires additional training and practice beyond the general direction described here.';

  var DIRECTIONS = [
    {
      id: 'dir-general-admin', num: '01', name: 'General VA / Administrative Support',
      involves: 'Helping a business stay organized by handling recurring administrative tasks and keeping information, schedules, documents, and follow-ups moving.',
      tasks: ['Organizing files and records', 'Updating spreadsheets or trackers', 'Managing calendars and appointments', 'Preparing documents', 'Following up on outstanding items', 'Maintaining simple reports', 'Coordinating routine administrative tasks'],
      patterns: ['ORGANIZE', 'COMMUNICATE', 'RESEARCH', 'OPERATE'],
      environment: 'Often a mix of internal coordination and independent task work. Some work is async; some requires specific working hours.',
      demanding: 'The work can involve many different tasks in one role. Staying organized while switching between priorities is important.',
      path: 'Often entered directly',
      pathNote: 'This is a common starting direction, especially when a learner already has transferable administrative experience.',
      skills: 'Organization, written communication, attention to detail, basic spreadsheets, file management, and following instructions.',
      learn: 'The specific tools and workflows used by the client.'
    },
    {
      id: 'dir-customer-support', num: '02', name: 'Customer Support VA',
      involves: 'Helping customers through email, chat, tickets, or other support channels while following the business’s support process.',
      tasks: ['Answering customer questions', 'Handling support tickets', 'Following support guidelines', 'Documenting customer interactions', 'Escalating issues', 'Following up on unresolved concerns', 'Updating customer records'],
      patterns: ['COMMUNICATE', 'ORGANIZE', 'OPERATE'],
      environment: 'Often customer-facing. Some roles require live or scheduled coverage; others are primarily async.',
      demanding: 'Customer concerns can be repetitive, urgent, or emotionally difficult. Clear communication and consistency matter.',
      path: 'Often entered directly',
      pathNote: 'Customer service or BPO experience can be relevant, depending on the role.',
      skills: 'Written communication, patience, listening, problem handling, documentation, and following procedures.',
      learn: 'The client’s products, support policies, ticketing system, and escalation process.'
    },
    {
      id: 'dir-ecommerce', num: '03', name: 'E-commerce VA',
      involves: 'Supporting the recurring operations of an online store.',
      tasks: ['Processing orders', 'Updating product information', 'Monitoring inventory information', 'Checking customer messages', 'Maintaining product records', 'Preparing routine reports', 'Supporting store operations'],
      patterns: ['OPERATE', 'ORGANIZE', 'COMMUNICATE', 'RESEARCH'],
      environment: 'Usually system-heavy and process-oriented. Some tasks are async; others depend on store schedules and business needs.',
      demanding: 'Small errors can affect orders, inventory, listings, or customer experience. Accuracy and consistency matter.',
      path: 'Possible starting direction with relevant skills',
      pathNote: 'The exact starting point depends on the systems and responsibilities involved.',
      skills: 'Organization, attention to detail, spreadsheets, communication, and comfort working inside business systems.',
      learn: 'The client’s store platform, product workflow, order process, inventory process, and reporting tools.',
      related: PPC_NOTE
    },
    {
      id: 'dir-amazon', num: '04', name: 'Amazon VA',
      involves: 'Supporting a business that sells products through Amazon. The actual work can range from administrative support to listings, inventory, customer-related tasks, research, and account operations.',
      tasks: ['Updating product information', 'Supporting inventory-related tasks', 'Checking account information', 'Researching products or competitors', 'Supporting customer-related processes', 'Preparing reports', 'Maintaining recurring Seller Central workflows'],
      patterns: ['OPERATE', 'ORGANIZE', 'RESEARCH', 'COMMUNICATE'],
      environment: 'System-heavy and detail-oriented. Responsibilities vary significantly between clients.',
      demanding: 'Amazon has many interconnected systems and rules. Accuracy, attention to detail, and continued learning are important.',
      path: 'Possible starting direction with relevant preparation',
      pathNote: 'Some responsibilities are beginner-accessible; specialized work may require additional training and practice.',
      skills: 'Organization, spreadsheets, research, communication, attention to detail, and comfort learning business systems.',
      learn: 'Amazon Seller Central and the specific workflows assigned by the client.',
      related: PPC_NOTE
    },
    {
      id: 'dir-bookkeeping', num: '05', name: 'Bookkeeping / Accounting Support',
      involves: 'Helping maintain financial records and supporting routine accounting processes.',
      tasks: ['Recording or organizing financial information', 'Categorizing transactions', 'Reconciling records', 'Preparing routine reports', 'Checking financial data for inconsistencies', 'Organizing receipts or supporting documents', 'Maintaining accounting-system records'],
      patterns: ['RESEARCH', 'ORGANIZE', 'OPERATE'],
      environment: 'Usually detail-heavy and numbers-focused. Much of the work can be async, although deadlines and reporting schedules matter.',
      demanding: 'Accuracy is critical. Small errors can affect financial records and reports.',
      path: 'Often entered with relevant experience or training',
      pathNote: 'Accounting or bookkeeping background can provide useful preparation.',
      skills: 'Numerical accuracy, organization, spreadsheets, attention to detail, and basic accounting knowledge.',
      learn: 'The client’s accounting software, chart of accounts, procedures, and reporting requirements.'
    },
    {
      id: 'dir-social-content', num: '06', name: 'Social Media / Content Support',
      involves: 'Helping a business plan, prepare, organize, and publish content for social platforms.',
      tasks: ['Preparing content calendars', 'Drafting or formatting captions', 'Creating simple graphics', 'Scheduling posts', 'Organizing content assets', 'Monitoring comments or messages', 'Preparing basic performance reports'],
      patterns: ['CREATE', 'ORGANIZE', 'COMMUNICATE', 'RESEARCH'],
      environment: 'A mix of creative production, planning, and communication. Some work follows a content schedule; some is reactive.',
      demanding: 'The work can require both creativity and consistency. Content deadlines can be frequent.',
      path: 'Often entered directly with relevant skills',
      pathNote: 'Prior content, communication, or social media experience can help.',
      skills: 'Writing, visual judgment, organization, communication, basic design, and content planning.',
      learn: 'The client’s brand, content process, platforms, scheduling tools, and reporting approach.'
    },
    {
      id: 'dir-executive-assistant', num: '07', name: 'Executive / Personal Assistance',
      involves: 'Helping a business owner, executive, or professional manage information, schedules, communication, and recurring responsibilities.',
      tasks: ['Calendar management', 'Meeting coordination', 'Inbox support', 'Preparing documents', 'Follow-ups', 'Research', 'Organizing priorities and information'],
      patterns: ['ORGANIZE', 'COMMUNICATE', 'RESEARCH'],
      environment: 'Often closely connected to one person’s schedule and priorities. Some roles require availability during specific hours.',
      demanding: 'Priorities can change quickly. Discretion, reliability, and good judgment are important.',
      path: 'Possible starting direction with relevant experience',
      pathNote: 'Administrative or coordination experience can be useful preparation.',
      skills: 'Organization, communication, calendar management, judgment, discretion, and follow-through.',
      learn: 'The client’s priorities, communication preferences, systems, and working style.'
    },
    {
      id: 'dir-real-estate', num: '08', name: 'Real Estate Support',
      involves: 'Supporting real estate professionals with administrative, communication, research, and transaction-related tasks.',
      tasks: ['Updating property information', 'Organizing records', 'Scheduling appointments', 'Researching property information', 'Supporting client communication', 'Preparing documents', 'Maintaining CRM records'],
      patterns: ['ORGANIZE', 'COMMUNICATE', 'RESEARCH', 'OPERATE'],
      environment: 'A combination of administrative, communication, and system-based work. Some responsibilities may be time-sensitive.',
      demanding: 'Accuracy and timely follow-up matter because transactions can involve many moving parts.',
      path: 'Possible starting direction with relevant preparation',
      pathNote: 'Administrative, sales, or customer-service experience may transfer well.',
      skills: 'Organization, communication, research, attention to detail, and CRM familiarity.',
      learn: 'The client’s real estate workflow, CRM, transaction process, and terminology.'
    },
    {
      id: 'dir-lead-generation', num: '09', name: 'Lead Generation / Appointment Setting',
      involves: 'Helping a business identify potential prospects, organize lead information, and support the process of starting conversations or scheduling appointments.',
      tasks: ['Finding potential leads', 'Researching prospect information', 'Maintaining lead lists', 'Updating CRM records', 'Sending outreach messages using approved processes', 'Following up with prospects', 'Scheduling appointments'],
      patterns: ['RESEARCH', 'COMMUNICATE', 'ORGANIZE', 'OPERATE'],
      environment: 'Often communication-heavy and process-driven. Some roles involve targets, scheduled outreach, or live communication.',
      demanding: 'Repeated outreach and follow-up can be tiring. Rejection and performance expectations can be part of the work.',
      path: 'Often entered directly with relevant communication skills',
      pathNote: 'Sales or BPO experience can be useful preparation.',
      skills: 'Research, written communication, follow-up, organization, confidence, and CRM use.',
      learn: 'The client’s target market, CRM, outreach process, qualification rules, and appointment workflow.'
    },
    {
      id: 'dir-technical', num: '10', name: 'Technical / Specialized VA Support',
      involves: 'Supporting a business through specialized technical systems, websites, CRMs, automation tools, or other platforms.',
      tasks: ['Maintaining website content', 'Updating CRM records and settings', 'Supporting automation workflows', 'Managing platform configurations', 'Checking system issues', 'Performing recurring technical updates', 'Documenting technical processes'],
      patterns: ['OPERATE', 'RESEARCH', 'ORGANIZE'],
      patternsNote: 'Some specialized work also involves CREATE or COMMUNICATE.',
      environment: 'Usually system-heavy and detail-oriented. Work may be asynchronous, but some roles require quick response to technical issues.',
      demanding: 'The tools can be complex, and mistakes can affect business systems. Continuous learning is often part of the work.',
      path: 'Often developed after relevant experience or training',
      pathNote: 'Some technical support roles can be entry points, but many specialized responsibilities require additional preparation.',
      skills: 'Problem-solving, attention to detail, system thinking, documentation, and comfort learning software.',
      learn: 'The specific platforms involved, such as WordPress, CRM systems, automation tools, or other client-specific software.'
    }
  ];

  window.PVA_M41 = { PATTERNS: PATTERNS, POST_OPTIONS: POST_OPTIONS, POSTS: POSTS, SCENARIOS: SCENARIOS, DIRECTIONS: DIRECTIONS };
})();
