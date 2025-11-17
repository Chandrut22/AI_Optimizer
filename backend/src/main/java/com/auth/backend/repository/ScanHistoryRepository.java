package com.auth.backend.repository;

import com.auth.backend.model.ScanHistory;
import com.auth.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScanHistoryRepository extends JpaRepository<ScanHistory, Integer> {

    // Finds all history for a user, ordered by most recent first
    List<ScanHistory> findByUserOrderByCreatedAtDesc(User user);
}