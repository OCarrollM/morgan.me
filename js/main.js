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
    
    console.log('Portfolio loaded ✨');
});