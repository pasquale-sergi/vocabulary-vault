package com.pasquale.vocabulary_website.Utils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;


import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
@Component
public class AnkiDatasetReader {

    private static final ObjectMapper mapper = new ObjectMapper();
    // Field separator used in Anki notes.flds column
    private static final String FIELD_SEPARATOR = "\u001f";

    public List<Map<String, Object>> readAnkiDataset(String apkgFilePath) throws IOException, SQLException {
        Path tempDbPath = null;
        Connection connection = null;
        List<Map<String, Object>> notesData = new ArrayList<>();

        try {
            // 1. Extract the SQLite database file from the .apkg (zip)
            tempDbPath = extractCollectionDb(apkgFilePath);
            if (tempDbPath == null) {
                System.err.println("Could not find collection.anki2 or collection.anki21 in the package.");
                return Collections.emptyList();
            }

            // 2. Connect to the extracted SQLite database
            String dbUrl = "jdbc:sqlite:" + tempDbPath.toAbsolutePath();
            // Ensure SQLite JDBC driver is in the classpath
            // Class.forName("org.sqlite.JDBC"); // Usually not needed with modern JDBC
            connection = DriverManager.getConnection(dbUrl);
            System.out.println("Connected to Anki database.");

            // 3. Get Note Type (Model) definitions from 'col' table
            Map<Long, Map<String, Object>> models = getModels(connection);
            if (models.isEmpty()) {
                System.err.println("Could not read models from collection.");
                return Collections.emptyList();
            }

            // 4. Query the 'notes' table
            String sql = "SELECT id, mid, flds FROM notes"; // mid = model id, flds = fields
            try (Statement stmt = connection.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {

                while (rs.next()) {
                    long noteId = rs.getLong("id");
                    long modelId = rs.getLong("mid");
                    String fieldsString = rs.getString("flds");

                    Map<String, Object> noteMap = new LinkedHashMap<>(); // Use LinkedHashMap to preserve field order
                    noteMap.put("noteId", noteId);
                    noteMap.put("modelId", modelId);

                    // Get the field names for this note's model
                    Map<String, Object> model = models.get(modelId);
                    if (model != null && model.containsKey("flds")) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> fieldsDefinition = (List<Map<String, Object>>) model.get("flds");
                        String[] fieldValues = fieldsString.split(FIELD_SEPARATOR, -1); // -1 to keep trailing empty strings

                        Map<String, String> fieldsMap = new LinkedHashMap<>();
                        for (int i = 0; i < fieldsDefinition.size(); i++) {
                            String fieldName = (String) fieldsDefinition.get(i).getOrDefault("name", "field_" + i);
                            String fieldValue = (i < fieldValues.length) ? fieldValues[i] : ""; // Handle cases where data might have fewer fields than definition
                            fieldsMap.put(fieldName, fieldValue);
                        }
                        noteMap.put("fields", fieldsMap);
                    } else {
                        // Fallback if model definition not found (less useful)
                        noteMap.put("rawFields", fieldsString);
                    }
                    notesData.add(noteMap);
                }
            }

        } catch (Exception e) { // Catch broader exceptions for simplicity here
            System.err.println("Error processing Anki dataset: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for debugging
        } finally {
            // 5. Clean up: Close connection and delete temporary file
            if (connection != null) {
                try {
                    connection.close();
                    System.out.println("Database connection closed.");
                } catch (SQLException e) {
                    System.err.println("Error closing database connection: " + e.getMessage());
                }
            }
            if (tempDbPath != null) {
                try {
                    Files.delete(tempDbPath);
                    System.out.println("Deleted temporary database file: " + tempDbPath);
                } catch (IOException e) {
                    System.err.println("Error deleting temporary database file: " + e.getMessage());
                }
            }
        }
        return notesData;
    }

    // Helper to extract the SQLite DB file
    private Path extractCollectionDb(String apkgFilePath) throws IOException {
        Path tempFile = Files.createTempFile("anki_collection_", ".db");
        boolean found = false;
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(apkgFilePath))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String entryName = entry.getName();
                // Look for the main database file
                if (entryName.equals("collection.anki2") || entryName.equals("collection.anki21")) {
                    System.out.println("Extracting: " + entryName);
                    Files.copy(zis, tempFile, StandardCopyOption.REPLACE_EXISTING);
                    found = true;
                    break; // Found the file, no need to continue
                }
                zis.closeEntry(); // Important to close entry if not reading fully
            }
        }
        return found ? tempFile : null;
    }

    // Helper to get model definitions from the 'col' table
    private Map<Long, Map<String, Object>> getModels(Connection connection) throws SQLException, IOException {
        String sql = "SELECT models FROM col LIMIT 1"; // Models are stored as JSON in the 'models' column
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                String modelsJson = rs.getString("models");
                // The JSON keys are string representations of the model IDs
                TypeReference<Map<String, Map<String, Object>>> typeRef = new TypeReference<>() {};
                Map<String, Map<String, Object>> modelsWithStringKeys = mapper.readValue(modelsJson, typeRef);

                // Convert keys from String to Long for easier lookup
                Map<Long, Map<String, Object>> modelsWithLongKeys = new HashMap<>();
                for (Map.Entry<String, Map<String, Object>> entry : modelsWithStringKeys.entrySet()) {
                    try {
                        modelsWithLongKeys.put(Long.parseLong(entry.getKey()), entry.getValue());
                    } catch (NumberFormatException e) {
                        System.err.println("Warning: Could not parse model ID: " + entry.getKey());
                    }
                }
                return modelsWithLongKeys;

            }
        }
        return Collections.emptyMap();
    }
}

