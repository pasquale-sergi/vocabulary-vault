package com.pasquale.vocabulary_website.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
public class VocabularyItem {
    private Long noteId;
    private long modelId;
    private String german;
    private String english;
    private String sampleSentence;
    private String audio;

    public VocabularyItem() {}

    public VocabularyItem(Map<String, Object> ankiNote){
        this.noteId = (Long) ankiNote.getOrDefault("noteId", 0L);
        this.modelId = (Long) ankiNote.getOrDefault("modelId", 0L);

        if (ankiNote.get("fields") instanceof Map) {
            @SuppressWarnings("unchecked")
                    Map<String, String> fields = (Map<String, String>) ankiNote.get("fields");
            this.german = fields.getOrDefault("German", "");
            this.english = fields.getOrDefault("English", "");
            this.audio = fields.getOrDefault("Audio", "");

            this.sampleSentence = fields.getOrDefault("Sample sentence", "");
        }
    }

    public VocabularyItem(VocabularyItem original) {
        this.noteId = original.noteId;
        this.modelId = original.modelId;
        this.german = original.german;
        this.english = original.english;
        this.audio = original.audio; // Copy the original audio value initially
        this.sampleSentence = original.sampleSentence;
    }
}
