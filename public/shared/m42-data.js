/* PVA Academy — Stage 4 · Module 4.2 content data.

   PROVENANCE
   - Section copy, evidence labels/definitions, pattern reference, completion
     and Work Clues text: PVA_Module_4.2_Build_Brief_v1.0.md (verbatim).
   - Experience sources: Build Brief §5 (verbatim labels).
   - TASK PROMPTS, REFERENCE TAGS and REFERENCE EXPLANATIONS: DRAFT written for
     v1.0 of the build at the owner's request (3 Oct 2026), pending approval.
     Built from the Build Brief's own examples where available; does not reuse
     Skills Finder wording; never names a VA direction.

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
      t('p-answered-questions', 'Answered customer questions', ['communicate'], 'The main job was moving clear information between the customer and the business.'),
      t('p-documented-interactions', 'Documented interactions', ['organize'], 'Writing it down kept information orderly so others could find and use it.'),
      t('p-followed-support-process', 'Followed a support process', ['operate'], 'Following a set process keeps a recurring piece of work running the same way each time.'),
      t('p-updated-records-system', 'Updated records in a system', ['organize', 'operate'], 'Keeping records accurate is ORGANIZE; doing it inside the business system as part of the routine is OPERATE.', true),
      t('p-prepared-reports', 'Prepared reports', ['research', 'organize'], 'Gathering and checking the figures is RESEARCH; arranging them so others can read them is ORGANIZE.'),
      t('p-handled-schedules', 'Handled schedules', ['organize', 'communicate'], 'Arranging times is ORGANIZE; confirming them with people is COMMUNICATE.'),
      t('p-escalated-issues', 'Escalated issues', ['communicate'], 'Passing a problem to the right person, clearly, is moving information between people.'),
      t('p-coordinated-people', 'Coordinated with other people', ['communicate'], 'Keeping several people informed and in step is mainly communication.')
    ],
    business: [
      t('p-replied-buyer-messages', 'Replied to buyer messages', ['communicate'], 'Answering buyers is moving clear information between people.'),
      t('p-updated-product-details', 'Updated product details in an online store', ['operate', 'organize'], 'Keeping store listings correct inside the store system is OPERATE; keeping the details tidy and consistent is ORGANIZE.', true),
      t('p-monitored-orders', 'Monitored orders', ['operate'], 'Watching orders move through each step keeps a recurring business process running.'),
      t('p-tracked-stock', 'Tracked stock or inventory', ['organize', 'operate'], 'Keeping counts accurate is ORGANIZE; doing it as part of the ongoing selling routine is OPERATE.'),
      t('p-arranged-deliveries', 'Arranged deliveries', ['communicate', 'operate'], 'Coordinating with couriers and buyers is COMMUNICATE; doing it for every order is OPERATE.'),
      t('p-kept-receipts', 'Kept track of receipts and payments', ['organize'], 'Keeping money records orderly so they can be checked later is ORGANIZE.'),
      t('p-made-product-posts', 'Made product photos or posts', ['create'], 'Producing visual material for others to see is CREATE.')
    ],
    school: [
      t('p-researched-project', 'Researched a topic for a project', ['research'], 'Finding, checking and comparing sources so you could reach a conclusion is RESEARCH.'),
      t('p-wrote-documents', 'Wrote documents or reports', ['create'], 'Producing a useful written piece is CREATE.'),
      t('p-made-presentations', 'Made presentations or simple materials', ['create'], 'Producing slides or materials for others to use is CREATE.'),
      t('p-organized-activity', 'Organized an activity or event', ['organize', 'communicate'], 'Planning the details is ORGANIZE; getting everyone the right information is COMMUNICATE.'),
      t('p-handled-group-updates', 'Handled updates for a group', ['communicate'], 'Keeping a group informed is moving information clearly between people.'),
      t('p-compared-options', 'Compared options before a decision', ['research'], 'Checking and comparing options so someone can decide is RESEARCH.'),
      t('p-encoded-records', 'Encoded or updated records', ['organize'], 'Entering information carefully so it can be found and used is ORGANIZE.')
    ],
    freelance: [
      t('p-delivered-client-work', 'Delivered work to a client by a deadline', ['operate'], 'Getting work through each step to delivery, on time, keeps a recurring process running.'),
      t('p-client-messages', 'Managed messages with a client', ['communicate'], 'Keeping a client informed and answering questions is COMMUNICATE.'),
      t('p-organized-client-files', 'Organized files for a client', ['organize'], 'Arranging files so the client can find and use them is ORGANIZE.'),
      t('p-created-content', 'Created written or visual content', ['create'], 'Producing content for someone else to use is CREATE.'),
      t('p-looked-up-information', 'Looked up information for a client', ['research'], 'Finding and checking information so the client can act on it is RESEARCH.'),
      t('p-tracked-invoices', 'Tracked my own invoices or payments', ['organize'], 'Keeping payment records orderly so they can be checked is ORGANIZE.')
    ],
    community: [
      t('p-organized-event', 'Organized an event or activity', ['organize', 'communicate'], 'Planning the details is ORGANIZE; telling everyone what they need to know is COMMUNICATE.'),
      t('p-sent-announcements', 'Sent updates or announcements', ['communicate'], 'Getting clear information to a group is COMMUNICATE.'),
      t('p-kept-member-list', 'Kept a list of members or attendees', ['organize'], 'Keeping a list accurate and usable is ORGANIZE.'),
      t('p-collected-contributions', 'Collected and recorded contributions', ['organize'], 'Recording who gave what, so it can be checked, is ORGANIZE.'),
      t('p-made-posters-posts', 'Made posters, posts or simple materials', ['create'], 'Producing material for others to see is CREATE.'),
      t('p-coordinated-volunteers', 'Coordinated volunteers', ['communicate', 'organize'], 'Telling people where to be is COMMUNICATE; working out who does what is ORGANIZE.')
    ],
    family: [
      t('p-tracked-household-money', 'Kept track of receipts or household spending', ['organize'], 'Keeping money records orderly so they make sense later is ORGANIZE.'),
      t('p-maintained-schedule', 'Maintained a schedule for other people', ['organize', 'communicate'], 'Keeping the schedule straight is ORGANIZE; reminding people is COMMUNICATE.'),
      t('p-compared-before-buying', 'Compared options before a purchase or decision', ['research'], 'Checking prices and details so the family could decide is RESEARCH.'),
      t('p-handled-family-business-customers', 'Handled customers for a family business', ['communicate'], 'Talking with customers on the business’s behalf is COMMUNICATE.'),
      t('p-dealt-with-suppliers', 'Dealt with suppliers', ['communicate', 'operate'], 'Talking with suppliers is COMMUNICATE; keeping regular orders going is OPERATE.'),
      t('p-arranged-appointments', 'Arranged appointments or bookings', ['organize', 'communicate'], 'Fitting the times together is ORGANIZE; confirming them is COMMUNICATE.')
    ],
    'previous-va': [
      t('p-va-inbox', 'Managed a client’s inbox', ['communicate', 'organize'], 'Answering and routing messages is COMMUNICATE; sorting and labelling them is ORGANIZE.', true),
      t('p-va-data-entry', 'Entered or cleaned up data', ['organize'], 'Making information accurate and usable is ORGANIZE.'),
      t('p-va-recurring-workflow', 'Ran a recurring task in a client’s system', ['operate'], 'Keeping a routine process working inside the client’s tools is OPERATE.', true),
      t('p-va-research', 'Researched information for a client', ['research'], 'Finding and comparing information so the client could act is RESEARCH.'),
      t('p-va-content', 'Prepared content or graphics', ['create'], 'Producing material for the client to use is CREATE.'),
      t('p-va-updates', 'Sent status updates to a client', ['communicate'], 'Keeping the client informed is moving information clearly between people.')
    ],
    other: [
      t('p-other-kept-track', 'Kept track of something for other people', ['organize'], 'Keeping information orderly so others can rely on it is ORGANIZE.'),
      t('p-other-explained', 'Explained something to other people', ['communicate'], 'Helping information reach someone clearly is COMMUNICATE.'),
      t('p-other-looked-up', 'Looked up and compared information', ['research'], 'Finding and comparing information to make a decision is RESEARCH.'),
      t('p-other-made-something', 'Made something for others to use', ['create'], 'Producing useful material is CREATE.'),
      t('p-other-kept-running', 'Kept a regular routine running for others', ['operate'], 'Making sure a recurring process happens correctly is OPERATE.')
    ]
  };

  window.PVA_M42 = { PATTERNS: PATTERNS, EVIDENCE: EVIDENCE, SOURCES: SOURCES, PROMPTS: P, PROMPTS_BY_SOURCE: PROMPTS_BY_SOURCE };
})();
