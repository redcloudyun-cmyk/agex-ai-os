document.addEventListener('DOMContentLoaded', () => {
  const btnRun = document.getElementById('btn-run-task');
  const promptInput = document.getElementById('prompt-input');
  let executionCount = 14;

  // ─── Manus Style Profile Trigger & Popover Menu ───
  const userProfileTrigger = document.getElementById('user-profile-trigger');
  const manusPopover = document.getElementById('manus-popover');

  if (userProfileTrigger && manusPopover) {
    userProfileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = manusPopover.style.display === 'block';
      manusPopover.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      manusPopover.style.display = 'none';
    });

    manusPopover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // ─── Run Task Button ───
  if (btnRun && promptInput) {
    btnRun.addEventListener('click', () => {
      const taskText = promptInput.value.trim();
      if (!taskText) return;
      showToast(`작업 디스패치 완료: "${taskText.substring(0, 30)}..."`);
      promptInput.value = '';
    });
  }

  // ─── Sidebar Navigation & Tab Switching ───
  const navItems = document.querySelectorAll('.nav-item, .popover-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      
      const tabId = item.getAttribute('data-tab');
      document.querySelectorAll('.tab-view').forEach(view => {
        view.style.display = 'none';
      });

      const viewMap = {
        'tab-workspace': { id: 'view-workspace', display: 'flex' },
        'tab-knowledge': { id: 'view-knowledge', display: 'block' },
        'tab-billing': { id: 'view-billing', display: 'block' },
        'tab-plugins': { id: 'view-plugins', display: 'block' },
      };

      const target = viewMap[tabId];
      const activate = (el, display) => {
        if (!el) return;
        el.style.display = display;
        el.classList.remove('view-enter');
        void el.offsetWidth;
        el.classList.add('view-enter');
      };

      if (target) {
        activate(document.getElementById(target.id), target.display);
      } else {
        activate(document.getElementById('view-workspace'), 'flex');
      }

      if (manusPopover) manusPopover.style.display = 'none';

      // 모바일: 탭 전환 후 사이드바 닫기
      closeMobileSidebar();
    });
  });

  // ─── Mobile Hamburger Menu Toggle ───
  const btnHamburger = document.getElementById('btn-hamburger');
  const sidebarLeft = document.getElementById('sidebar-left');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  function openMobileSidebar() {
    if (sidebarLeft) sidebarLeft.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
  }

  function closeMobileSidebar() {
    if (sidebarLeft) sidebarLeft.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }

  if (btnHamburger) {
    btnHamburger.addEventListener('click', openMobileSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMobileSidebar);
  }

  // ─── Voice Input (Speech-to-Text via Web Speech API) ───
  const btnVoiceInput = document.getElementById('btn-voice-input');
  let recognition = null;
  let isRecording = false;

  if (btnVoiceInput) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isRecording = true;
        btnVoiceInput.classList.add('recording');
        showToast('음성 인식 중...', true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (promptInput) {
          promptInput.value = transcript;
        }
      };

      recognition.onend = () => {
        isRecording = false;
        btnVoiceInput.classList.remove('recording');
        removeToast();
        if (promptInput && promptInput.value.trim()) {
          showToast('음성 입력 완료!');
        }
      };

      recognition.onerror = (event) => {
        isRecording = false;
        btnVoiceInput.classList.remove('recording');
        removeToast();
        if (event.error === 'not-allowed') {
          showToast('마이크 접근이 거부되었습니다. 브라우저 설정을 확인하세요.');
        } else if (event.error === 'no-speech') {
          showToast('음성이 감지되지 않았습니다. 다시 시도해주세요.');
        } else {
          showToast('음성 인식 오류: ' + event.error);
        }
      };

      btnVoiceInput.addEventListener('click', () => {
        if (isRecording) {
          recognition.stop();
        } else {
          recognition.start();
        }
      });
    } else {
      btnVoiceInput.addEventListener('click', () => {
        showToast('이 브라우저는 음성 인식을 지원하지 않습니다.');
      });
    }
  }

  // ─── Voice Output (Text-to-Speech via Web Speech API) ───
  const btnVoiceOutput = document.getElementById('btn-voice-output');
  let isSpeaking = false;

  if (btnVoiceOutput) {
    if ('speechSynthesis' in window) {
      btnVoiceOutput.addEventListener('click', () => {
        if (isSpeaking) {
          window.speechSynthesis.cancel();
          isSpeaking = false;
          btnVoiceOutput.classList.remove('speaking');
          removeToast();
          return;
        }

        // 현재 입력창의 텍스트를 읽거나, 없으면 기본 AI 응답 텍스트를 읽음
        const textToSpeak = promptInput && promptInput.value.trim()
          ? promptInput.value.trim()
          : 'AGEX AI 워크스페이스에 오신 것을 환영합니다. 원하시는 작업을 말씀해 주세요.';

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // 한국어 음성 선택
        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find(v => v.lang.startsWith('ko'));
        if (koVoice) {
          utterance.voice = koVoice;
        }

        utterance.onstart = () => {
          isSpeaking = true;
          btnVoiceOutput.classList.add('speaking');
          showToast('AI 음성 출력 중...');
        };

        utterance.onend = () => {
          isSpeaking = false;
          btnVoiceOutput.classList.remove('speaking');
          removeToast();
        };

        utterance.onerror = () => {
          isSpeaking = false;
          btnVoiceOutput.classList.remove('speaking');
          removeToast();
        };

        window.speechSynthesis.speak(utterance);
      });
    } else {
      btnVoiceOutput.addEventListener('click', () => {
        showToast('이 브라우저는 음성 출력을 지원하지 않습니다.');
      });
    }
  }

  // ─── Toast Notification System ───
  let currentToast = null;
  let toastTimer = null;

  function showToast(message, persistent) {
    removeToast();
    const toast = document.createElement('div');
    toast.className = 'voice-status-toast';

    if (persistent) {
      toast.innerHTML = `<span class="dot-recording"></span>${message}`;
    } else {
      toast.textContent = message;
    }

    document.body.appendChild(toast);
    currentToast = toast;

    if (!persistent) {
      toastTimer = setTimeout(() => {
        removeToast();
      }, 3000);
    }
  }

  function removeToast() {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    if (currentToast) {
      currentToast.remove();
      currentToast = null;
    }
  }
});
