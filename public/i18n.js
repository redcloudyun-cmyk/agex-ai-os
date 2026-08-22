// AGEX Console i18n — lightweight dictionary-based localization.
// No build step in this project, so translations are applied at runtime by
// walking [data-i18n*] attributes rather than templating at render time.
(function () {
  const STORAGE_KEY = 'agex_locale';

  const translations = {
    ko: {
      'nav.newTask': '새 작업 시작',
      'nav.groupWorkspace': '워크스페이스',
      'nav.workspace': 'AI 워크스페이스',
      'nav.agents': '나의 에이전트',
      'nav.knowledge': '지식 및 파일 (Knowledge)',
      'nav.plugins': '플러그인 연동',
      'nav.library': '작업 히스토리 / 라이브러리',
      'nav.groupRecent': '최근 프로젝트',
      'nav.recentLanding': '회사 랜딩페이지 디자인 구축',
      'nav.recentWebsite': 'How to Create Website',
      'nav.recentReport': '금융 시장 분석 리포트 발행',

      'user.role': '개인 / Admin',
      'user.avatarInitial': '윤',
      'page.title': 'AGEX AI 워크스페이스 6.0 - Control Canvas',

      'header.hamburgerLabel': '메뉴 열기',
      'header.langToggle': 'EN',

      'popover.credit': '크레딧 사용량',
      'popover.chargeBtn': '크레딧 충전',
      'popover.iam': '계정 & Zero-Trust IAM',
      'popover.skills': '스킬 & SKILL.md 관리',
      'popover.settings': '시스템 설정 (Durable 런타임 / 모델 라우터)',
      'popover.help': '도움받기',
      'popover.logout': '로그아웃',

      'hero.badge': 'Durable Runtime 연결됨',
      'hero.titleSuffix': 'AI 워크스페이스 6.0',
      'hero.subtitle': '하나의 프롬프트로 리서치, 문서 작성, 코드 실행까지 — AGEX 멀티에이전트가 대신 처리합니다.',

      'input.placeholder': '무엇이든 물어보고 만들어보세요 (AGEX Durable Runtime 통과)...',
      'input.defaultText': '금융 시장 동향을 분석하고 구조화된 리포트를 생성해줘',
      'input.attach': '첨부',
      'input.newAgent': '새로운 Super Agent',
      'input.voiceInputTitle': '음성으로 입력 (Speech-to-Text)',
      'input.voiceOutputTitle': 'AI 응답을 음성으로 듣기 (Text-to-Speech)',
      'input.run': '대화 / 실행',

      'suites.colTeam': 'AI 팀',
      'suites.colOffice': '오피스 스위트',
      'suites.slides': 'AI 슬라이드',
      'suites.colBuild': '빌드 스위트',
      'suites.codeReactor': '코드 리액터',
      'suites.colContent': '콘텐츠 제작',
      'suites.chat': 'AI 채팅',
      'suites.colTools': '도구 및 확장',
      'suites.allAgents': '모든 에이전트',

      'banner.title': 'SecondBrain Note. 카드처럼 얇은 AGEX AI 보이스 레코더 & 멀티에이전트 노드',
      'banner.desc': '한 번 누르면 최대 35시간까지 녹음됩니다. 유료 회원은 무제한 AI 전사 및 요약이 가능합니다.',
      'banner.cta': '자세히 보기',

      'knowledge.heading': '지식 저장소 및 문서 연결 (Knowledge Base)',
      'knowledge.desc': 'AI 에이전트가 답변 및 작업 시 참조할 문서(PDF, Word, TXT) 및 DB 연결을 관리합니다.',
      'knowledge.listTitle': '업로드된 문서 목록',
      'knowledge.uploadBtn': '+ 문서 업로드',
      'knowledge.thDoc': '문서명',
      'knowledge.thSecurity': '보안 등급',
      'knowledge.thSize': '크기',
      'knowledge.thStatus': '상태',

      'billing.heading': '사용량 및 요금제 (Billing & Usage)',
      'billing.desc': '현재 플랜, 남은 토큰 크레딧 및 이번 달 사용료 내역입니다.',
      'billing.planTitle': '현재 구독 플랜',
      'billing.planSub': '월 $120.00 / 10,000 Credits 포함',
      'billing.creditTitle': '남은 토큰 크레딧',
      'billing.creditSub': '다음 갱신일: 2026-09-01',

      'plugins.heading': '플러그인 및 서비스 연동',
      'plugins.desc': 'Slack, GitHub, Google Workspace 등 외부 서비스를 연결합니다. 연동된 Plugin은 에이전트가 Tool로 호출할 수 있습니다.',
      'plugins.slackDesc': '채널 알림 수신 및 슬래시 커맨드로 에이전트 실행',
      'plugins.githubDesc': '저장소 컨텍스트 조회, 코드 수정 및 PR 초안 생성',
      'plugins.gworkspaceDesc': 'Docs, Sheets, Calendar 연동으로 문서 생성 및 일정 관리',
      'plugins.notionDesc': '지식 저장소 페이지를 Knowledge Base에 자동 동기화',
      'plugins.connected': '연결됨',
      'plugins.connectBtn': '연동하기',

      'agents.heading': '나의 에이전트 (My Agents)',
      'agents.desc': 'TENANT 스코프로 등록된 에이전트 목록입니다. 각 에이전트는 Durable Runtime을 통해서만 실행됩니다.',
      'agents.researchName': '리서치 애널리스트',
      'agents.researchDesc': '시장 동향을 조사하고 구조화된 리포트를 작성하는 멀티에이전트 워크플로우.',
      'agents.codeDesc': '저장소 컨텍스트를 읽고 코드 수정·테스트·PR 초안까지 처리하는 빌드 에이전트.',
      'agents.knowledgeDesc': '업로드된 문서를 인덱싱하고 질의에 맞는 근거를 찾아 인용과 함께 답합니다.',
      'agents.newTitle': '새 에이전트 만들기',
      'agents.newDesc': '역할, 도구, 모델을 정의해서 나만의 에이전트를 등록합니다.',

      'library.heading': '작업 히스토리 / 라이브러리',
      'library.desc': 'Durable Runtime에서 실행 완료 또는 진행 중인 작업 기록입니다.',
      'library.thTask': '작업명',
      'library.thType': '유형',
      'library.thStatus': '상태',
      'library.thDate': '생성일',
      'library.statusDone': '완료',
      'library.statusInProgress': '진행 중',
      'library.statusWaiting': '대기',
      'library.taskArchSummary': '제품 아키텍처 명세서 요약',

      'iam.heading': '계정 & Zero-Trust IAM',
      'iam.desc': '현재 계정의 역할과 Permission 범위입니다. Cross-Tenant 접근은 기본적으로 차단됩니다.',
      'iam.roleTitle': '현재 역할',
      'iam.crossTitle': 'Cross-Tenant 접근',
      'iam.crossSub': '정책 위반 시 자동 차단',
      'iam.grantedTitle': '부여된 Permission',
      'iam.perm1': 'Resource 생성 / 게시 (Agent, Workflow, Knowledge)',
      'iam.perm2': 'Published Version 직접 수정',
      'iam.perm3': 'Billing / Entitlement 관리',
      'iam.perm4': 'IRREVERSIBLE_WRITE 작업 승인',
      'iam.allow': '허용',
      'iam.deny': '거부',
      'iam.approvalNeeded': '승인 필요',

      'skills.heading': '스킬 & SKILL.md 관리',
      'skills.desc': '에이전트가 참조하는 재사용 가능한 스킬 정의입니다.',
      'skills.desc1': '시장 데이터를 수집해 구조화된 리포트 템플릿으로 정리합니다.',
      'skills.desc2': '업로드 문서를 청크로 분할하고 Knowledge Base에 인덱싱합니다.',
      'skills.desc3': '코드 변경 사항을 정리해 PR 설명 초안을 생성합니다.',
      'skills.active': '활성',
      'skills.reviewing': '검토 중',

      'toast.dispatched': '작업 디스패치 완료:',
      'toast.listening': '음성 인식 중...',
      'toast.voiceDone': '음성 입력 완료!',
      'toast.micDenied': '마이크 접근이 거부되었습니다. 브라우저 설정을 확인하세요.',
      'toast.noSpeech': '음성이 감지되지 않았습니다. 다시 시도해주세요.',
      'toast.recognitionError': '음성 인식 오류:',
      'toast.sttUnsupported': '이 브라우저는 음성 인식을 지원하지 않습니다.',
      'toast.speaking': 'AI 음성 출력 중...',
      'toast.ttsUnsupported': '이 브라우저는 음성 출력을 지원하지 않습니다.',
      'toast.defaultSpeak': 'AGEX AI 워크스페이스에 오신 것을 환영합니다. 원하시는 작업을 말씀해 주세요.',
      'toast.connectDone': '연동 완료',

      'ad.label': '광고',
      'ad.headline': '광고 없이 AGEX Pro로 더 빠르게 작업하세요',
      'ad.cta': '업그레이드',
      'toast.upgraded': 'AGEX Pro로 업그레이드되었습니다.',
    },
    en: {
      'nav.newTask': 'New Task',
      'nav.groupWorkspace': 'Workspace',
      'nav.workspace': 'AI Workspace',
      'nav.agents': 'My Agents',
      'nav.knowledge': 'Knowledge & Files',
      'nav.plugins': 'Plugin Integrations',
      'nav.library': 'Task History / Library',
      'nav.groupRecent': 'Recent Projects',
      'nav.recentLanding': 'Company Landing Page Design',
      'nav.recentWebsite': 'How to Create Website',
      'nav.recentReport': 'Financial Market Analysis Report',

      'user.role': 'Personal / Admin',
      'user.avatarInitial': 'B',
      'page.title': 'AGEX AI Workspace 6.0 - Control Canvas',

      'header.hamburgerLabel': 'Open menu',
      'header.langToggle': '한국어',

      'popover.credit': 'Credit Usage',
      'popover.chargeBtn': 'Add Credits',
      'popover.iam': 'Account & Zero-Trust IAM',
      'popover.skills': 'Skills & SKILL.md',
      'popover.settings': 'System Settings (Runtime / Model Router)',
      'popover.help': 'Help',
      'popover.logout': 'Log Out',

      'hero.badge': 'Durable Runtime Connected',
      'hero.titleSuffix': 'AI Workspace 6.0',
      'hero.subtitle': 'One prompt handles research, writing, and code execution — AGEX multi-agents do it for you.',

      'input.placeholder': 'Ask or build anything (routed through the AGEX Durable Runtime)...',
      'input.defaultText': 'Analyze financial market trends and generate a structured report',
      'input.attach': 'Attach',
      'input.newAgent': 'New Super Agent',
      'input.voiceInputTitle': 'Voice Input (Speech-to-Text)',
      'input.voiceOutputTitle': 'Listen to AI Response (Text-to-Speech)',
      'input.run': 'Chat / Run',

      'suites.colTeam': 'AI Team',
      'suites.colOffice': 'Office Suite',
      'suites.slides': 'AI Slides',
      'suites.colBuild': 'Build Suite',
      'suites.codeReactor': 'Code Reactor',
      'suites.colContent': 'Content Creation',
      'suites.chat': 'AI Chat',
      'suites.colTools': 'Tools & Extensions',
      'suites.allAgents': 'All Agents',

      'banner.title': 'SecondBrain Note. A card-thin AGEX AI voice recorder & multi-agent node.',
      'banner.desc': 'One tap records up to 35 hours. Paid members get unlimited AI transcription and summaries.',
      'banner.cta': 'Learn More',

      'knowledge.heading': 'Knowledge Base & Document Connections',
      'knowledge.desc': "Manage the documents (PDF, Word, TXT) and DB connections your agents reference.",
      'knowledge.listTitle': 'Uploaded Documents',
      'knowledge.uploadBtn': '+ Upload Document',
      'knowledge.thDoc': 'Document',
      'knowledge.thSecurity': 'Classification',
      'knowledge.thSize': 'Size',
      'knowledge.thStatus': 'Status',

      'billing.heading': 'Billing & Usage',
      'billing.desc': "Your current plan, remaining token credits, and this month's usage.",
      'billing.planTitle': 'Current Plan',
      'billing.planSub': '$120.00/mo · includes 10,000 credits',
      'billing.creditTitle': 'Remaining Token Credits',
      'billing.creditSub': 'Next renewal: 2026-09-01',

      'plugins.heading': 'Plugins & Integrations',
      'plugins.desc': 'Connect external services like Slack, GitHub, and Google Workspace. Connected plugins can be invoked by agents as tools.',
      'plugins.slackDesc': 'Receive channel notifications and run agents via slash commands',
      'plugins.githubDesc': 'Read repo context, edit code, and draft PRs',
      'plugins.gworkspaceDesc': 'Generate documents and manage schedules via Docs, Sheets, Calendar',
      'plugins.notionDesc': 'Auto-sync knowledge pages into the Knowledge Base',
      'plugins.connected': 'Connected',
      'plugins.connectBtn': 'Connect',

      'agents.heading': 'My Agents',
      'agents.desc': 'Agents registered under TENANT scope. Every agent runs only through the Durable Runtime.',
      'agents.researchName': 'Research Analyst',
      'agents.researchDesc': 'A multi-agent workflow that researches market trends and writes structured reports.',
      'agents.codeDesc': 'A build agent that reads repo context and handles code edits, tests, and PR drafts.',
      'agents.knowledgeDesc': 'Indexes uploaded documents and answers queries with cited evidence.',
      'agents.newTitle': 'Create New Agent',
      'agents.newDesc': 'Define a role, tools, and model to register your own agent.',

      'library.heading': 'Task History / Library',
      'library.desc': 'A record of tasks completed or in progress on the Durable Runtime.',
      'library.thTask': 'Task',
      'library.thType': 'Type',
      'library.thStatus': 'Status',
      'library.thDate': 'Created',
      'library.statusDone': 'Done',
      'library.statusInProgress': 'In Progress',
      'library.statusWaiting': 'Waiting',
      'library.taskArchSummary': 'Product Architecture Spec Summary',

      'iam.heading': 'Account & Zero-Trust IAM',
      'iam.desc': "The current account's role and permission scope. Cross-tenant access is blocked by default.",
      'iam.roleTitle': 'Current Role',
      'iam.crossTitle': 'Cross-Tenant Access',
      'iam.crossSub': 'Automatically blocked on policy violation',
      'iam.grantedTitle': 'Granted Permissions',
      'iam.perm1': 'Create / Publish Resources (Agent, Workflow, Knowledge)',
      'iam.perm2': 'Directly Edit Published Versions',
      'iam.perm3': 'Manage Billing / Entitlements',
      'iam.perm4': 'Approve IRREVERSIBLE_WRITE Actions',
      'iam.allow': 'Allowed',
      'iam.deny': 'Denied',
      'iam.approvalNeeded': 'Approval Needed',

      'skills.heading': 'Skills & SKILL.md',
      'skills.desc': 'Reusable skill definitions your agents can reference.',
      'skills.desc1': 'Collects market data and organizes it into a structured report template.',
      'skills.desc2': 'Splits uploaded documents into chunks and indexes them into the Knowledge Base.',
      'skills.desc3': 'Summarizes code changes and drafts a PR description.',
      'skills.active': 'Active',
      'skills.reviewing': 'In Review',

      'toast.dispatched': 'Task dispatched:',
      'toast.listening': 'Listening...',
      'toast.voiceDone': 'Voice input complete!',
      'toast.micDenied': 'Microphone access was denied. Check your browser settings.',
      'toast.noSpeech': 'No speech detected. Please try again.',
      'toast.recognitionError': 'Speech recognition error:',
      'toast.sttUnsupported': "This browser doesn't support speech recognition.",
      'toast.speaking': 'Playing AI voice output...',
      'toast.ttsUnsupported': "This browser doesn't support voice output.",
      'toast.defaultSpeak': "Welcome to the AGEX AI Workspace. Tell me what you'd like to do.",
      'toast.connectDone': 'connected',

      'ad.label': 'Ad',
      'ad.headline': 'Go ad-free and work faster with AGEX Pro',
      'ad.cta': 'Upgrade',
      'toast.upgraded': 'Upgraded to AGEX Pro.',
    },
  };

  function detectLocale() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ko' || saved === 'en') return saved;
    return (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  }

  let currentLocale = detectLocale();

  function t(key) {
    return (translations[currentLocale] && translations[currentLocale][key]) || translations.en[key] || key;
  }

  function applyLocale() {
    document.documentElement.lang = currentLocale;
    document.title = t('page.title');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-value]').forEach((el) => {
      el.value = t(el.getAttribute('data-i18n-value'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    });

    document.querySelectorAll('[data-i18n-lang-toggle]').forEach((el) => {
      el.textContent = t('header.langToggle');
    });
  }

  function getLocale() {
    return currentLocale;
  }

  function setLocale(locale) {
    if (locale !== 'ko' && locale !== 'en') return;
    currentLocale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    applyLocale();
  }

  function toggleLocale() {
    setLocale(currentLocale === 'ko' ? 'en' : 'ko');
  }

  window.AGEX_I18N = { t, getLocale, setLocale, toggleLocale, applyLocale };
})();
