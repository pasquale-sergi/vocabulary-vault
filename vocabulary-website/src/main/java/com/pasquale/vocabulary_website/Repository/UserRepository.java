package com.pasquale.vocabulary_website.Repository;

import com.pasquale.vocabulary_website.Entity.ApplicationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;
@Repository
public interface UserRepository  extends JpaRepository<ApplicationUser, Long>{
    Optional<ApplicationUser> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
