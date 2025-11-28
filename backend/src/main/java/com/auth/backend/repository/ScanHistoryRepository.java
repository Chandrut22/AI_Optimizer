package com.auth.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.auth.backend.model.ScanHistory;
import com.auth.backend.model.User;

public interface ScanHistoryRepository extends JpaRepository<ScanHistory, Integer> {
    List<ScanHistory> findByUserOrderByCreatedAtDesc(User user);
}