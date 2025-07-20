// =================================================================================
// SCRIPT SETUP & CONSTANTS
// =================================================================================

// --- Character Sets for Password Generation ---
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// --- DOM Element Selection ---
const passwordDisplay = document.getElementById('passwordDisplay');
const copyButton = document.getElementById('copyButton');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('lengthValue');
const includeUppercase = document.getElementById('includeUppercase');
const includeLowercase = document.getElementById('includeLowercase');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const generateButton = document.getElementById('generateButton');
const strengthText = document.getElementById('strengthText');
const strengthBars = document.getElementById('strengthBars');

// =================================================================================
// EVENT LISTENERS
// =================================================================================

function initializeEventListeners() {
    lengthSlider.addEventListener('input', handleLengthChange);
    generateButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyToClipboard);

    const checkboxes = [includeUppercase, includeLowercase, includeNumbers, includeSymbols];
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateStrengthIndicator);
    });
}

// =================================================================================
// UI HELPER FUNCTIONS
// =================================================================================

/**
 * Copies the current password from the display to the clipboard.
 */
function copyToClipboard() {
    const password = passwordDisplay.textContent;
    if (!password || password === 'P4$5W0rD!') return;

    const textArea = document.createElement('textarea');
    textArea.value = password;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        const originalIcon = copyButton.innerHTML;
        copyButton.innerHTML = `<span class="text-sm text-emerald-400">Copied!</span>`;
        setTimeout(() => { copyButton.innerHTML = originalIcon; }, 1500);
    } catch (err) {
        console.error('Failed to copy password: ', err);
    }
    document.body.removeChild(textArea);
}

/**
 * Handles the change event for the length slider.
 * @param {Event} e - The input event object.
 */
function handleLengthChange(e) {
    lengthValue.textContent = e.target.value;
    updateStrengthIndicator();
}

// =================================================================================
// CORE PASSWORD LOGIC
// =================================================================================

/**
 * Generates a random password based on the selected user criteria.
 */
function generatePassword() {
    const length = parseInt(lengthSlider.value);
    const useUpper = includeUppercase.checked;
    const useLower = includeLowercase.checked;
    const useNums = includeNumbers.checked;
    const useSyms = includeSymbols.checked;

    let charset = '';
    let guaranteedChars = [];
    
    if (useUpper) { charset += uppercaseChars; guaranteedChars.push(getRandomChar(uppercaseChars)); }
    if (useLower) { charset += lowercaseChars; guaranteedChars.push(getRandomChar(lowercaseChars)); }
    if (useNums) { charset += numberChars; guaranteedChars.push(getRandomChar(numberChars)); }
    if (useSyms) { charset += symbolChars; guaranteedChars.push(getRandomChar(symbolChars)); }

    if (charset === '') {
        passwordDisplay.textContent = 'Select options';
        updateStrengthIndicator();
        return;
    }

    let password = guaranteedChars.join('');
    const remainingLength = length - password.length;

    for (let i = 0; i < remainingLength; i++) {
        password += getRandomChar(charset);
    }

    passwordDisplay.textContent = shuffleString(password);
    updateStrengthIndicator();
}

/**
 * Analyzes the current password and updates the strength indicator UI.
 */
function updateStrengthIndicator() {
    let score = 0;
    const length = parseInt(lengthSlider.value);
    const password = passwordDisplay.textContent;
    
    // Check for presence of each character type in the actual password
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;

    // Disable generate button if no options are selected
    const anyCheckboxChecked = includeUppercase.checked || includeLowercase.checked || includeNumbers.checked || includeSymbols.checked;
    generateButton.disabled = !anyCheckboxChecked;
    if (!anyCheckboxChecked) {
        setStrength('SELECT OPTIONS', 0, 'bg-gray-700');
        return;
    }

    // Determine strength level based on length and character diversity
    if (length >= 16 && score >= 4) {
        setStrength('STRONG', 4, 'bg-emerald-500');
    } else if (length >= 12 && score >= 3) {
        setStrength('STRONG', 4, 'bg-emerald-500');
    } else if (length >= 8 && score >= 2) {
        setStrength('MEDIUM', 3, 'bg-yellow-400');
    } else if (length >= 8 && score >= 1) {
        setStrength('WEAK', 2, 'bg-orange-500');
    } else {
        setStrength('TOO WEAK', 1, 'bg-red-600');
    }
}

/**
 * A helper function to set the strength UI state (text and bars).
 * @param {string} text - The text to display (e.g., 'MEDIUM').
 * @param {number} barCount - Number of active bars (0-4).
 * @param {string} colorClass - Tailwind CSS color class for the bars.
 */
function setStrength(text, barCount, colorClass) {
    strengthText.textContent = text;
    strengthBars.innerHTML = ''; 
    for (let i = 0; i < 4; i++) {
        const bar = document.createElement('div');
        bar.className = 'w-2.5 h-7 rounded-sm';
        bar.classList.add(i < barCount ? colorClass : 'bg-gray-700');
        strengthBars.appendChild(bar);
    }
}

/**
 * Gets a random character from a given string.
 * @param {string} str - The string to pick a character from.
 * @returns {string} A single random character.
 */
function getRandomChar(str) {
    return str[Math.floor(Math.random() * str.length)];
}

/**
 * Shuffles a string using the Fisher-Yates algorithm to ensure randomness.
 * @param {string} str - The string to shuffle.
 * @returns {string} The shuffled string.
 */
function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; 
    }
    return arr.join('');
}

// =================================================================================
// INITIALIZATION
// =================================================================================

/**
 * Runs when the page is fully loaded.
 */
window.onload = () => {
    initializeEventListeners();
    generatePassword(); 
};
