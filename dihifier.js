const input = document.getElementById("userInput");
const button = document.getElementById("submitBtn");
const output = document.getElementById("output");

function replaceWithDih(word) {
    if (!word) return "";

    // Don't modify if the word is already 'dih'
    if (word.toLowerCase() === "dih") return word;

    let newWord = word;
    const lowerWord = word.toLowerCase();
    const vowels = "aeiou";

    // Helper function to replace a match with 'dih'
    function replaceAt(index, length) {
        return word.slice(0, index) + "dih" + word.slice(index + length);
    }

    // Check for 'd' followed by a vowel
    const dvMatch = lowerWord.match(/d[aeiou]/i);
    if (dvMatch) {
        newWord = replaceAt(dvMatch.index, 2);
    } else {
        // Check for any 'd'
        const dIndex = lowerWord.indexOf('d');
        if (dIndex !== -1) {
            newWord = replaceAt(dIndex, 1);
        } else {
            // Check for 't' followed by a vowel
            const tvMatch = lowerWord.match(/t[aeiou]/i);
            if (tvMatch) {
                newWord = replaceAt(tvMatch.index, 2);
            } else {
                // Check for any 't'
                const tIndex = lowerWord.indexOf('t');
                if (tIndex !== -1) {
                    newWord = replaceAt(tIndex, 1);
                } else {
                    // Random insertion if no d/t found
                    const pos = Math.floor(Math.random() * word.length) + 1;
                    newWord = word.slice(0, pos) + "dih" + word.slice(pos);
                }
            }
        }
    }

    // Preserve capitalization of first letter
    if (word[0] === word[0].toUpperCase()) {
        newWord = newWord[0].toUpperCase() + newWord.slice(1);
    } else {
        newWord = newWord[0].toLowerCase() + newWord.slice(1);
    }

    return newWord;
}

function dihifySentence(sentence) {
    return sentence
        .split(" ")
        .map(word => replaceWithDih(word))
        .join(" ");
}

function processInput() {
    const text = input.value;
    const result = dihifySentence(text);
    output.textContent = result;
}

// Click button
button.addEventListener("click", processInput);

// Press Enter
input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
    processInput();
    }
});