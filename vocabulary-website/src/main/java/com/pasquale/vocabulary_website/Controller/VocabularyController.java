package com.pasquale.vocabulary_website.Controller;

import com.pasquale.vocabulary_website.Entity.ApplicationUser;
import com.pasquale.vocabulary_website.Entity.VocabularyItem;
import com.pasquale.vocabulary_website.Repository.UserRepository;
import com.pasquale.vocabulary_website.Service.UserDetailsImpl;
import com.pasquale.vocabulary_website.Service.UserService;
import com.pasquale.vocabulary_website.Service.VocabularyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/vocabulary")
@CrossOrigin(origins = "*",  maxAge = 3600)
public class VocabularyController {
    @Autowired
    private VocabularyService vocabularyService;


    @Autowired
    private UserRepository userRepository;

    @GetMapping("/new-words")
    public ResponseEntity<List<VocabularyItem>> getNewWords(@RequestParam(defaultValue = "10") int count) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated.");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        try {
            ApplicationUser currentUser = userRepository.findByUsername(userDetails.getUsername()).orElseThrow(() -> new UsernameNotFoundException("User not found with this username"));

            List<VocabularyItem> newWords = vocabularyService.getNewWordsForUser(currentUser, count );
            return ResponseEntity.ok(newWords);
        }catch (UsernameNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with this username.");

        }catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error.");
        }

    }

}
