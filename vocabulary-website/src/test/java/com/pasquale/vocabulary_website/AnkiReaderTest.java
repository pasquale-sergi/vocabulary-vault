package com.pasquale.vocabulary_website;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pasquale.vocabulary_website.Utils.AnkiDatasetReader;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.List;
import java.util.Map;

// --- Test Class ---
class AnkiReaderTest {
    @Test
    void testReadAnkiDataset() throws Exception { // Use JUnit 5 annotation
        AnkiDatasetReader reader = new AnkiDatasetReader();
        // Make sure the path is correct and the file exists
        String filePath = "";
        File testFile = new File(filePath);
        if (!testFile.exists()) {
            System.err.println("Test file not found: " + filePath);
            return; // Or throw an exception
        }

        List<Map<String, Object>> notes = reader.readAnkiDataset(filePath);

        System.out.println("Successfully read " + notes.size() + " notes.");

        if (!notes.isEmpty()) {
            // Print the first few notes as JSON for inspection
            ObjectMapper jsonMapper = new ObjectMapper();
            System.out.println("First 5 notes (JSON):");
            for (int i = 0; i < Math.min(5, notes.size()); i++) {
                System.out.println(jsonMapper.writerWithDefaultPrettyPrinter().writeValueAsString(notes.get(i)));
            }
        }
    }
}
