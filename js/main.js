/**
 * Portfolio - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    const ageElement = document.getElementById('age');
    if(ageElement) {
        const birthYear = 2001;
        const age = new Date().getFullYear() - birthYear;
        ageElement.textContent = age;
    }
    // Typing animation for commands
    const commands = document.querySelectorAll('.command');
    
    commands.forEach((cmd, index) => {
        const text = cmd.textContent;
        cmd.textContent = '';
        cmd.style.visibility = 'visible';
        
        let charIndex = 0;
        const delay = index * 800; // Stagger each command
        
        setTimeout(() => {
            const type = () => {
                if (charIndex < text.length) {
                    cmd.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(type, 50 + Math.random() * 50); // Random speed for realism
                }
            };
            type();
        }, delay);
    });

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