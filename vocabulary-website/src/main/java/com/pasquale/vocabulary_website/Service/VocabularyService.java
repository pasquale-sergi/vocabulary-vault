package com.pasquale.vocabulary_website.Service;

import com.pasquale.vocabulary_website.Entity.ApplicationUser;
import com.pasquale.vocabulary_website.Entity.UserWord;
import com.pasquale.vocabulary_website.Entity.VocabularyItem;
import com.pasquale.vocabulary_website.ForvoLogic.ForvoItem;
import com.pasquale.vocabulary_website.ForvoLogic.ForvoResponse;
import com.pasquale.vocabulary_website.Repository.UserWordRepository;
import com.pasquale.vocabulary_website.Utils.AnkiDatasetReader;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.sql.SQLException;
import java.time.Duration;
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

    private final WebClient webClient;
    private final String forvoApiKey;

    private List<VocabularyItem> allVocabulary = Collections.emptyList();

    private Map<Long, VocabularyItem> vocabularyMap = Collections.emptyMap();

    @Autowired
    public VocabularyService(
            AnkiDatasetReader ankiDatasetReader,
            UserWordRepository userWordRepository,
            WebClient.Builder webClientBuilder,
            @Value("${forvo.api.key}") String forvoApiKey,
            @Value("${forvo.api.baseurl}") String forvoBaseUrl

    ){
        this.ankiReader = ankiDatasetReader;
        this.userWordRepository = userWordRepository;
        this.webClient = webClientBuilder.baseUrl(forvoBaseUrl).build();
        this.forvoApiKey = forvoApiKey;

    }


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


        List<VocabularyItem> enrichedWords = newWords.stream()
                .map(item -> {
                    VocabularyItem enrichedItem = new VocabularyItem(item); // Creates a copy
                    String germanWord = cleanWordForApi(item.getGerman());

                    if (germanWord != null && !germanWord.isEmpty()) {
                        try {
                            // Step 1: Get the Optional<Optional<String>>
                            Optional<Optional<String>> outerOptional = fetchPronunciationUrl(germanWord)
                                    .blockOptional(Duration.ofSeconds(5));

                            // Step 2: Check outer Optional AND THEN inner Optional
                            if (outerOptional.isPresent()) {
                                Optional<String> innerOptional = outerOptional.get(); // Get the inner Optional<String>

                                if (innerOptional.isPresent()) {
                                    // Step 3: Get the actual String URL from the inner Optional
                                    String actualUrl = innerOptional.get();
                                    log.debug("Found Forvo URL for '{}': {}", germanWord, actualUrl);
                                    // Step 4: Set the extracted String URL on the item
                                    enrichedItem.setAudio(actualUrl);
                                    log.debug("DEBUG: Set enrichedItem audio to: {}", enrichedItem.getAudio());
                                } else {
                                    // Inner Optional was empty (Forvo returned no URL)
                                    log.warn("No Forvo URL found for word: {}", germanWord);
                                    log.debug("DEBUG: Keeping original audio for {}: {}", germanWord, enrichedItem.getAudio());
                                    // Keep original audio (already in copy)
                                }
                            } else {
                                // Outer Optional was empty (blockOptional timed out or Mono completed empty)
                                log.warn("Forvo fetch timed out or completed empty for word: {}", germanWord);
                                log.debug("DEBUG: Keeping original audio for {}: {}", germanWord, enrichedItem.getAudio());
                                // Keep original audio (already in copy)
                            }
                        } catch (Exception e) {
                            log.error("Error processing Forvo pronunciation for '{}': {}", germanWord, e.getMessage());
                            log.debug("DEBUG: Keeping original audio for {} due to exception: {}", germanWord, enrichedItem.getAudio());
                            // Keep original audio value (already present in the copy)
                        }
                    } else {
                        log.debug("DEBUG: Skipping Forvo for null/empty German word from item ID {}", item.getNoteId());
                    }
                    return enrichedItem; // Return the (potentially) modified copy
                })
                .collect(Collectors.toList());

        // 3. Save the newly assigned words to the database
        if (!wordsToSave.isEmpty()) {
            userWordRepository.saveAll(wordsToSave);
            log.info("Saved {} new words for user {}", wordsToSave.size(), user.getUsername());
        } else {
            log.info("No new words found for user {} (or vocabulary exhausted).", user.getUsername());
        }

        return enrichedWords;
    }

    private String cleanWordForApi(String word) {
        // ... (keep existing cleaning logic) ...
        if (word == null) return null;
        word = word.replaceFirst("^(der|die|das|ein|eine)\\s+", "").trim();
        word = word.replaceAll("\\(.*\\)", "").trim();
        return word;
    }

    private Mono<Optional<String>> fetchPronunciationUrl(String word) {
        log.debug("Fetching Forvo pronunciation for: {} (Country: DEU)", word);
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        // Path includes required params as path variables
                        .path("/key/{key}/format/json/action/word-pronunciations/word/{word}/language/de")
                        // Add optional country filter as a query parameter
                        .queryParam("country", "DEU") // <-- ADDED COUNTRY FILTER
                        .build(forvoApiKey, word)) // Pass values for path variables {key} and {word}
                .retrieve()
                .bodyToMono(ForvoResponse.class) // Use simplified POJO
                .map(forvoResponse -> {
                    if (forvoResponse != null && forvoResponse.getItems() != null && !forvoResponse.getItems().isEmpty()) {
                        // Find first non-null, non-empty mp3 path
                        return forvoResponse.getItems().stream()
                                .map(ForvoItem::getPathMp3) // Use simplified POJO
                                .filter(Objects::nonNull)
                                .filter(url -> !url.isEmpty())
                                .findFirst();
                    }
                    return Optional.<String>empty();
                })
                .doOnError(WebClientResponseException.class, e -> {
                    log.error("Forvo API error for word '{}': Status {}, Body {}", word, e.getStatusCode(), e.getResponseBodyAsString(), e);
                })
                .onErrorResume(e -> {
                    log.error("Failed to get Forvo data for word '{}' due to: {}", word, e.getMessage());
                    return Mono.just(Optional.empty()); // Return empty on error
                });
    }
}
