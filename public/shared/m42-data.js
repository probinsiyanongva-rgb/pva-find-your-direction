/* PVA Academy — Stage 4 · Module 4.2 content data.

   PROVENANCE
   - Section copy, evidence labels/definitions, pattern reference, completion
     and Work Clues text: PVA_Module_4.2_Build_Brief_v1.0.md (verbatim).
   - Experience sources: Build Brief §5 (verbatim labels).
   - TASK PROMPTS, REFERENCE TAGS and REFERENCE EXPLANATIONS: written by Claude at
     the owner's request (3 Oct 2026); content pass v1.1 aligned with Design Brief
     v0.3 LOCKED. Still pending owner content approval. Built from the briefs' own
     examples where available; does not reuse Skills Finder wording; never names a
     VA direction; explanations follow "This task involves X because …".

   IDs are stable and stored in learner state: never rename a released ID. */
(function () {
  'use strict';

  var PATTERNS = [
    { id: 'organize', name: 'ORGANIZE', def: 'Arranging information so people can find, understand, and use it.' },
    { id: 'communicate', name: 'COMMUNICATE', def: 'Helping information move clearly between people.' },
    { id: 'research', name: 'RESEARCH', def: 'Finding, checking, comparing, and analyzing information so someone can make a decision or take action.' },
    { id: 'create', name: 'CREATE', def: 'Producing useful content or visual material.' },
    { id: 'operate', name: 'OPERATE', def: 'Keeping a recurring business process running correctly inside tools or systems.' }
  ];

  /* Display order is fixed and never used for comparison or sorting. */
  var EVIDENCE = [
    { id: 'regularly', label: 'I do this regularly', def: 'This was a recurring part of what I did, now or in the past.' },
    { id: 'done_before', label: 'I have done this before', def: 'I have personally carried out this task, but it was not a recurring part of what I did.' },
    { id: 'some_exposure', label: 'I have some exposure to it', def: 'I have encountered, observed, assisted with, or had limited hands-on experience with this task, but I have not independently done it as a completed task.' },
    { id: 'not_done_yet', label: 'I have not done this yet', def: 'I have not personally carried out this task.' }
  ];

  var SOURCES = [
    { id: 'work', label: 'Work experience' },
    { id: 'business', label: 'Business or selling experience' },
    { id: 'school', label: 'School or internship experience' },
    { id: 'freelance', label: 'Freelance experience' },
    { id: 'community', label: 'Volunteer/community experience' },
    { id: 'family', label: 'Family or personal responsibilities' },
    { id: 'previous-va', label: 'Previous VA experience' },
    { id: 'other', label: 'Other' }
  ];

  /* DRAFT — task prompts and reference tags (see PROVENANCE).
     ref: reference pattern(s), shown only AFTER the learner chooses tags.
     tool: true when the task is done inside a tool or system (shows the
     capability question). Everyday prompts sit inside the sources they belong to. */
  var P = {};
  function t(id, label, ref, why, tool) { P[id] = { id: id, label: label, ref: ref, why: why, tool: !!tool }; return id; }

  var PROMPTS_BY_SOURCE = {
    work: [
      t('p-answered-questions', 'Answered customer questions', ['communicate'], 'This task involves COMMUNICATE because the work moves clear information between a customer and the business.'),
      t('p-documented-interactions', 'Documented interactions', ['organize'], 'This task involves ORGANIZE because writing each interaction down keeps information orderly, so others can find and use it later.'),
      t('p-followed-support-process', 'Followed a support process', ['operate'], 'This task involves OPERATE because following the same steps each time keeps a recurring process working correctly, usually inside the business’s tools.'),
      t('p-updated-records-system', 'Updated records in a system', ['organize', 'operate'], 'This task involves ORGANIZE because the records have to stay accurate and usable, and OPERATE because the updating is part of a routine done inside the business’s system.', true),
      t('p-prepared-reports', 'Prepared reports', ['research', 'organize'], 'This task involves RESEARCH because you gather and check the figures, and ORGANIZE because you arrange them so others can read them.'),
      t('p-handled-schedules', 'Handled schedules', ['organize', 'communicate'], 'This task involves ORGANIZE because times have to fit together, and COMMUNICATE because people need to be told and reminded.'),
      t('p-escalated-issues', 'Escalated issues', ['communicate'], 'This task involves COMMUNICATE because the work is passing a problem clearly to the person who can solve it.'),
      t('p-coordinated-people', 'Coordinated with other people', ['communicate'], 'This task involves COMMUNICATE because the work keeps several people informed and in step.')
    ],
    business: [
      t('p-replied-buyer-messages', 'Replied to buyer messages', ['communicate'], 'This task involves COMMUNICATE because the work answers buyers clearly and keeps them informed.'),
      t('p-updated-product-details', 'Updated product details in an online store', ['operate', 'organize'], 'This task involves OPERATE because keeping listings correct is part of running the store inside its system, and ORGANIZE because the details have to stay tidy and consistent.', true),
      t('p-monitored-orders', 'Monitored orders', ['operate'], 'This task involves OPERATE because watching each order move through its steps keeps a recurring selling process working.'),
      t('p-tracked-stock', 'Tracked stock or inventory', ['organize', 'operate'], 'This task involves ORGANIZE because the counts have to be accurate, and OPERATE because tracking them is part of the ongoing selling routine.'),
      t('p-arranged-deliveries', 'Arranged deliveries', ['communicate', 'operate'], 'This task involves COMMUNICATE because you coordinate with buyers and couriers, and OPERATE because it happens for every order as part of the selling process.'),
      t('p-kept-receipts', 'Kept track of receipts and payments', ['organize'], 'This task involves ORGANIZE because money records have to be kept in order so they can be checked later.'),
      t('p-made-product-posts', 'Made product photos or posts', ['create'], 'This task involves CREATE because the work produces visual material for others to see.')
    ],
    school: [
      t('p-researched-project', 'Researched a topic for a project', ['research'], 'This task involves RESEARCH because you find, check and compare sources to reach a conclusion.'),
      t('p-wrote-documents', 'Wrote documents or reports', ['create'], 'This task involves CREATE because the work produces a useful written piece.'),
      t('p-made-presentations', 'Made presentations or simple materials', ['create'], 'This task involves CREATE because the work produces slides or materials for others to use.'),
      t('p-organized-activity', 'Organized an activity or event', ['organize', 'communicate'], 'This task involves ORGANIZE because the details have to be planned, and COMMUNICATE because everyone needs the right information.'),
      t('p-handled-group-updates', 'Handled updates for a group', ['communicate'], 'This task involves COMMUNICATE because the work keeps a group informed.'),
      t('p-compared-options', 'Compared options before a decision', ['research'], 'This task involves RESEARCH because you check and compare options so a decision can be made.'),
      t('p-encoded-records', 'Encoded or updated records', ['organize'], 'This task involves ORGANIZE because entering information carefully keeps it accurate and easy to use.')
    ],
    freelance: [
      t('p-tracked-projects', 'Kept track of my projects and deadlines', ['organize'], 'This task involves ORGANIZE because the work keeps project details and dates in order so nothing is missed.'),
      t('p-client-messages', 'Managed messages with a client', ['communicate'], 'This task involves COMMUNICATE because the work keeps a client informed and answers their questions.'),
      t('p-organized-client-files', 'Organized files for a client', ['organize'], 'This task involves ORGANIZE because the files are arranged so the client can find and use them.'),
      t('p-created-content', 'Created written or visual content', ['create'], 'This task involves CREATE because the work produces content for someone else to use.'),
      t('p-looked-up-information', 'Looked up information for a client', ['research'], 'This task involves RESEARCH because you find and check information so the client can act on it.'),
      t('p-tracked-invoices', 'Tracked my own invoices or payments', ['organize'], 'This task involves ORGANIZE because payment records have to be kept in order so they can be checked.')
    ],
    community: [
      t('p-organized-event', 'Organized an event or activity', ['organize', 'communicate'], 'This task involves ORGANIZE because the details have to be planned, and COMMUNICATE because everyone needs to know what is happening.'),
      t('p-sent-announcements', 'Sent updates or announcements', ['communicate'], 'This task involves COMMUNICATE because the work gets clear information to a group.'),
      t('p-kept-member-list', 'Kept a list of members or attendees', ['organize'], 'This task involves ORGANIZE because the list has to stay accurate and usable.'),
      t('p-collected-contributions', 'Collected and recorded contributions', ['organize'], 'This task involves ORGANIZE because recording who gave what keeps the information orderly and checkable.'),
      t('p-made-posters-posts', 'Made posters, posts or simple materials', ['create'], 'This task involves CREATE because the work produces material for others to see.'),
      t('p-coordinated-volunteers', 'Coordinated volunteers', ['communicate', 'organize'], 'This task involves COMMUNICATE because people need to know where to be, and ORGANIZE because someone has to work out who does what.')
    ],
    family: [
      t('p-tracked-household-money', 'Kept track of receipts or household spending', ['organize'], 'This task involves ORGANIZE because money records have to be kept in order so they make sense later.'),
      t('p-maintained-schedule', 'Maintained a schedule for other people', ['organize', 'communicate'], 'This task involves ORGANIZE because the schedule has to stay straight, and COMMUNICATE because people need reminders.'),
      t('p-compared-before-buying', 'Compared options before a purchase or decision', ['research'], 'This task involves RESEARCH because you check prices and details so a decision can be made.'),
      t('p-handled-family-business-customers', 'Handled customers for a family business', ['communicate'], 'This task involves COMMUNICATE because the work is talking with customers on the business’s behalf.'),
      t('p-dealt-with-suppliers', 'Dealt with suppliers', ['communicate'], 'This task involves COMMUNICATE because the work keeps information moving clearly between the business and its suppliers.'),
      t('p-arranged-appointments', 'Arranged appointments or bookings', ['organize', 'communicate'], 'This task involves ORGANIZE because times have to fit together, and COMMUNICATE because each one has to be confirmed.')
    ],
    'previous-va': [
      t('p-va-inbox', 'Managed a client’s inbox', ['communicate', 'organize'], 'This task involves COMMUNICATE because messages are answered or passed on, and ORGANIZE because they are sorted and labelled so nothing is lost.', true),
      t('p-va-data-entry', 'Entered or cleaned up data', ['organize'], 'This task involves ORGANIZE because the work makes information accurate and usable.'),
      t('p-va-recurring-workflow', 'Handled a recurring task inside a client’s system', ['operate'], 'This task involves OPERATE because the work keeps a routine process working correctly inside the client’s tools.', true),
      t('p-va-research', 'Researched information for a client', ['research'], 'This task involves RESEARCH because you find and compare information so the client can act on it.'),
      t('p-va-content', 'Prepared content or graphics', ['create'], 'This task involves CREATE because the work produces material for the client to use.'),
      t('p-va-updates', 'Sent status updates to a client', ['communicate'], 'This task involves COMMUNICATE because the work keeps the client informed.')
    ],
    other: [
      t('p-other-kept-track', 'Kept track of something for other people', ['organize'], 'This task involves ORGANIZE because keeping information in order lets others rely on it.'),
      t('p-other-explained', 'Explained something to other people', ['communicate'], 'This task involves COMMUNICATE because the work helps information reach someone clearly.'),
      t('p-other-looked-up', 'Looked up and compared information', ['research'], 'This task involves RESEARCH because you find and compare information to make a decision.'),
      t('p-other-made-something', 'Made something for others to use', ['create'], 'This task involves CREATE because the work produces useful material.'),
      t('p-other-shared-sheet', 'Kept a shared sheet or app up to date for a group', ['operate', 'organize'], 'This task involves OPERATE because keeping it current is a routine done inside a tool, and ORGANIZE because the information has to stay accurate.', true)
    ]
  };

  window.PVA_M42 = { PATTERNS: PATTERNS, EVIDENCE: EVIDENCE, SOURCES: SOURCES, PROMPTS: P, PROMPTS_BY_SOURCE: PROMPTS_BY_SOURCE };
})();
