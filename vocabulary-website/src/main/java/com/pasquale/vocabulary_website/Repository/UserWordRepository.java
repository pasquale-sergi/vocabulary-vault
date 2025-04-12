package com.pasquale.vocabulary_website.Repository;

import com.pasquale.vocabulary_website.Entity.ApplicationUser;
import com.pasquale.vocabulary_website.Entity.UserWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Set;

public interface UserWordRepository  extends JpaRepository<UserWord, Long> {

    @Query("SELECT uw.ankiNoteId FROM UserWord uw WHERE uw.user = :user")
    Set<Long> findAnkiNoteIdsByUser(ApplicationUser user);
}
