/**
 * Portfolio - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // custom cursor
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        const cursorDot = document.createElement('div');
        cursorDot.className = 'custom-cursor-dot';
        document.body.appendChild(cursorDot);

        let cursorX = 0, cursorY = 0;
        let dotX = 0, dotY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
        });

        document.addEventListener('mouseDown', () => cursor.classList.add('clicking'));
        document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

        const animateCursor = () => {
            const dx = cursorX - dotX;
            const dy = cursorY - dotY;
            dotX += dx * 0.15;
            dotY += dy * 0.15;

            cursor.style.left = dotX - 10 + 'px';
            cursor.style.top = dotY - 10 + 'px';
            cursorDot.style.left = cursorX - 3 + 'px';
            cursorDot.style.top = cursorY - 3 + 'px';

            requestAnimationFrame(animateCursor);
        };
        animateCursor();
    }

    // visitor counter
    const visitorCount = document.getElementById('visitor-count');
    if (visitorCount) {
        const fakeCount = Math.floor(Math.random() * 8) + 2;
        visitorCount.textContent = fakeCount;
    }

    // theme switcher
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.body.dataset.theme = btn.dataset.theme;
            localStorage.setItem('portfolio-theme', btn.dataset.theme);
        });
    });

    // load theme
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
        themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        });
    }

    // Matrix theme
    const matrixToggle = document.getElementById('matrixToggle');
    let matrixActive = false;
    let matrixCanvas, matrixCtx, matrixInterval;

    const initMatrix = () => {
        matrixCanvas = document.createElement('canvas');
        matrixCanvas.id = 'matrixCanvas';
        document.body.appendChild(matrixCanvas);
        matrixCtx = matrixCanvas.getContext('2d');

        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
        const fontSize = 14;
        const columns = matrixCanvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const drawMatrix = () => {
            matrixCtx.fillStyle = 'rgba(10, 10, 15, 0.05)';
            matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            matrixCtx.fillStyle = '#22c55e';
            matrixCtx.font = fontSize + 'px JetBrains Mono';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        matrixInterval = setInterval(drawMatrix, 50);
    };

    if (matrixToggle) {
        matrixToggle.addEventListener('click', () => {
            matrixActive = !matrixActive;
            matrixToggle.classList.toggle('active');

            if (matrixActive) {
                if (!matrixCanvas) initMatrix();
                matrixCanvas.classList.add('active');
            } else if (matrixCanvas) {
                matrixCanvas.classList.remove('active');
            }
        });
    }

    window.addEventListener('resize', () => {
        if (matrixCanvas) {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
        }
    });

    // Mobile Nav
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionIndex = parseInt(link.dataset.section);
                const terminals = document.querySelectorAll('.terminal');
                if (terminals[sectionIndex - 1]) {
                    terminals[sectionIndex -1].scrollIntoView({ behaviour: 'smooth' });
                }
                navMenu.classList.remove('active');
                navToggle.textContent = '☰';
            });
        });
    }

    const ageElement = document.getElementById('age');
    if(ageElement) {
        const birthYear = 2001;
        const age = new Date().getFullYear() - birthYear;
        ageElement.textContent = age;
    }

    const terminals = document.querySelectorAll('.terminal');
    const typedCommands = new Set();

    const typeCommand = (cmd) => {
        if (typedCommands.has(cmd)) return;
        typedCommands.add(cmd);

        const text = cmd.dataset.text || cmd.textContent;
        cmd.dataset.text = text;
        cmd.textContent = '';
        cmd.style.opacity = '1';

        let charIndex = 0;
        const type = () => {
            if (charIndex < text.length) {
                cmd.textContent += text.charAt(charIndex)
                charIndex++;
                setTimeout(type, 50 + Math.random() * 50);
            }
        };
        type();
    };

    const terminalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const commands = entry.target.querySelectorAll('.command');
                commands.forEach((cmd, index) => {
                    setTimeout(() => typeCommand(cmd), index * 300);
                });
            }
        });
    }, { threshold: 0.3 });
    terminals.forEach(terminal => terminalObserver.observe(terminal));

    // scroll triggering
    const projectItems = document.querySelectorAll('.project-item');
    const expItems = document.querySelectorAll('.exp-item');
    const animatedItems = [...projectItems, ...expItems];

    animatedItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 100);
                itemObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedItems.forEach(item => itemObserver.observe(item));

    // easter egg!
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if(e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if(konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            } 
        } else {
            konamiIndex = 0;
        }
    });

    function activateEasterEgg() {
        document.body.classList.add('rainbow-mode');

        const eggTerminal = document.createElement('div');
        eggTerminal.className = 'easter-egg-popup';
        eggTerminal.innerHTML = `
            <div class="egg-content">
                <pre class="egg-ascii">
             *     ,MMM8&&&.            *
                  MMMM88&&&&&    .
                 MMMM88&&&&&&&
     *           MMM88&&&&&&&&
                 MMM88&&&&&&&&
                 'MMM88&&&&&&'
                   'MMM8&&&'      *
          |\\___/|
          )     (             .              '
         =\\     /=
           )===(       *
          /     \\
          |     |
         /       \\
         \\       /
  _/\\_/\\_/\\__  _/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_/\\_
  |  |  |  |( (  |  |  |  |  |  |  |  |  |  |
  |  |  |  | ) ) |  |  |  |  |  |  |  |  |  |
  |  |  |  |(_(  |  |  |  |  |  |  |  |  |  |
  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
                </pre>
                <p>Congrats</p>
                <p class="egg-subtext">Thanks for exploring</p>
                <button onclick="this.parentElement.parentElement.remove(); document.body.classList.remove('rainbow-mode');">Close</button>
            </div>
        `;
        document.body.appendChild(eggTerminal);
    }
    
    console.log('Portfolio loaded ✨');
});