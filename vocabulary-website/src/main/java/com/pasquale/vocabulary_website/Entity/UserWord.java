package com.pasquale.vocabulary_website.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_words")
@Getter
@Setter
public class UserWord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private ApplicationUser user;
    @Column(name = "anki_note_id", nullable = false)
    private Long ankiNoteId;
    @Column(name = "added_at")
    private LocalDateTime created;

    public UserWord() {
        this.created = LocalDateTime.now();
    }

    public UserWord(ApplicationUser user, Long ankiNoteId) {
        this.user = user;
        this.ankiNoteId = ankiNoteId;
        this.created = LocalDateTime.now();
    }
}
