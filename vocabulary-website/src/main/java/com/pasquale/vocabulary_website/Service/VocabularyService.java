package com.pasquale.vocabulary_website.Service;

import com.pasquale.vocabulary_website.Entity.ApplicationUser;
import com.pasquale.vocabulary_website.Entity.UserWord;
import com.pasquale.vocabulary_website.Entity.VocabularyItem;
import com.pasquale.vocabulary_website.Repository.UserWordRepository;
import com.pasquale.vocabulary_website.Utils.AnkiDatasetReader;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VocabularyService {
    private static final Logger log = LoggerFactory.getLogger(VocabularyService.class);

    @Autowired
    private AnkiDatasetReader ankiReader;

    @Autowired
    private UserWordRepository userWordRepository;

    @Value("${anki.dataset.path}")
    private String ankiDatasetPath;


    private List<VocabularyItem> allVocabulary = Collections.emptyList();

    private Map<Long, VocabularyItem> vocabularyMap = Collections.emptyMap();

    @PostConstruct // Load data when the service starts
    public void loadVocabularyData() {
        log.info("Loading Anki vocabulary data from: {}", ankiDatasetPath);
        try {
            List<Map<String, Object>> rawData = ankiReader.readAnkiDataset(ankiDatasetPath);

            // Transform raw map data into VocabularyItem objects
            this.allVocabulary = rawData.stream()
                    .map(VocabularyItem::new) // <-- Use explicit lambda
                    .filter(item -> item.getNoteId() != 0)
                    .toList();

            // Populate the map for quick lookups
            this.vocabularyMap = this.allVocabulary.stream()
                    .collect(Collectors.toMap(VocabularyItem::getNoteId, item -> item));


            log.info("Successfully loaded {} vocabulary items.", allVocabulary.size());

        } catch (IOException | SQLException e) {
            log.error("Failed to load Anki dataset: {}", e.getMessage(), e);
            // Decide how to handle this error (e.g., throw exception, keep empty list)
            this.allVocabulary = Collections.emptyList();
            this.vocabularyMap = Collections.emptyMap();
        }
    }

    @Transactional // Ensure saving user words and fetching is atomic if needed
    public List<VocabularyItem> getNewWordsForUser(ApplicationUser user, int count) {
        if (allVocabulary.isEmpty()) {
            log.warn("Vocabulary data is not loaded. Cannot provide words.");
            return Collections.emptyList();
        }

        // 1. Get IDs of words the user has already seen
        Set<Long> seenNoteIds = userWordRepository.findAnkiNoteIdsByUser(user);
        log.debug("User {} has seen {} words.", user.getUsername(), seenNoteIds.size());

        List<VocabularyItem> newWords = new ArrayList<>();
        List<UserWord> wordsToSave = new ArrayList<>();
        Set<Long> selectedNewIds = new HashSet<>(); // Track IDs selected in *this* request

        // Create a mutable copy to shuffle or work with indices
        List<VocabularyItem> availableVocabulary = new ArrayList<>(this.allVocabulary);
        Collections.shuffle(availableVocabulary); // Randomize the order

        for (VocabularyItem item : availableVocabulary) {
            if (newWords.size() >= count) {
                break; // We have enough words
            }

            // Check if the word is new for the user AND not already picked in this batch
            if (!seenNoteIds.contains(item.getNoteId()) && !selectedNewIds.contains(item.getNoteId())) {
                newWords.add(item);
                selectedNewIds.add(item.getNoteId());
                wordsToSave.add(new UserWord(user, item.getNoteId()));
            }
        }

        // 3. Save the newly assigned words to the database
        if (!wordsToSave.isEmpty()) {
            userWordRepository.saveAll(wordsToSave);
            log.info("Saved {} new words for user {}", wordsToSave.size(), user.getUsername());
        } else {
            log.info("No new words found for user {} (or vocabulary exhausted).", user.getUsername());
        }

        return newWords;
    }
}
