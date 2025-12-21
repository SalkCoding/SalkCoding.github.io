document.addEventListener("DOMContentLoaded", function() {
    // 1. 요소 선택
    const targets = document.querySelectorAll(".header, .section, .project-item");
    const navLinks = document.querySelectorAll(".toc-nav .toc-link");
    
    // 스크롤 감지 잠금 (클릭 시 간섭 방지)
    let isManualScrolling = false;
    let manualScrollTimer = null;

    // 2. 스크롤 감지기 (Observer)
    const observer = new IntersectionObserver((entries) => {
        if (isManualScrolling) return; // 수동 이동 중엔 감지 안 함

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                if(id) {
                    navLinks.forEach(link => {
                        link.classList.remove("active");
                        if (link.getAttribute("href") === `#${id}`) {
                            link.classList.add("active");
                        }
                    });
                }
            }
        });
    }, { rootMargin: "-40% 0px -60% 0px", threshold: 0 });

    targets.forEach(target => observer.observe(target));

    // 3. 클릭 이벤트 (핵심: 높이 변화 대기 로직)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // (1) 수동 모드 시작 (감지기 끔)
                isManualScrolling = true;
                if (manualScrollTimer) clearTimeout(manualScrollTimer);

                // (2) 메뉴 활성화
                navLinks.forEach(l => l.classList.remove("active"));
                this.classList.add("active");

                // (3) 프로젝트인지 확인
                const isProject = targetId.startsWith('#proj-');
                let delay = 0;

                // (4) 프로젝트가 닫혀있다면? -> 펼치고 기다려야 함!
                if (isProject && !targetElement.classList.contains('expanded')) {
                    if(typeof toggleProject === 'function') toggleProject(targetElement);
                    else targetElement.classList.add('expanded');
                    
                    // CSS transition 시간(0.5s)만큼 기다림 -> 높이 확정 후 이동
                    delay = 500; 
                }

                // (5) 이동 실행 (delay 후 실행)
                setTimeout(() => {
                    // 중요: 정확한 좌표 재계산 (브라우저 버그 방지용 수동 계산)
                    const headerOffset = 80; // 상단 여백
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // (6) 이동이 끝날 때쯤 감지기 다시 켬
                    // 스크롤 시간(약 0.5~0.8초) + 여유 시간 고려
                    manualScrollTimer = setTimeout(() => {
                        isManualScrolling = false;
                    }, 800);

                }, delay); // <- 여기서 0.5초 대기
            }
        });
    });
});




function toggleProject(element) {
    const allProjects = document.querySelectorAll('.project-item');
    allProjects.forEach(item => {
        if (item !== element && item.classList.contains('expanded')) {
            item.classList.remove('expanded');
        }
    });
    element.classList.toggle('expanded');
}

window.addEventListener('beforeprint', () => {
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.add('expanded');
    });
}); 