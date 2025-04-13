// exerciseUtils.js

// Generate multiple choice exercises from BACKEND vocabulary
export function generateMCExercisesFromBackend(vocabulary) {
    if (!vocabulary || vocabulary.length === 0) return [];

    return vocabulary.map((item) => {
        let sentence = item.sampleSentence || "";
        let blankSentence = "Could not generate sentence.";

        if (sentence) {
            const firstSentencePart = sentence.split(".")[0].split("(")[0].trim();
            if (firstSentencePart && item.german) {
                const regex = new RegExp(item.german.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
                if (firstSentencePart.match(regex)) {
                    blankSentence = firstSentencePart.replace(regex, "______");
                } else {
                    blankSentence = `${firstSentencePart} (Fill in: ______)`;
                }
            } else {
                blankSentence = "Sentence unavailable (Fill in: ______)";
            }
        }

        const options = [item.german];
        const distractors = vocabulary.map(v => v.german).filter(g => g !== item.german);
        while (options.length < 4 && distractors.length > 0) {
            const randomIndex = Math.floor(Math.random() * distractors.length);
            options.push(distractors.splice(randomIndex, 1)[0]);
        }
        const shuffledOptions = options.sort(() => Math.random() - 0.5);

        return { sentence: blankSentence, options: shuffledOptions, correctAnswer: item.german };
    });
}

// Generate writing exercises from BACKEND vocabulary
export function generateWritingExercisesFromBackend(vocabulary) {
    if (!vocabulary || vocabulary.length === 0) return [];
    return vocabulary.map((item) => ({
        english: item.english || "Translation unavailable",
        correctAnswer: item.german,
    }));
}
