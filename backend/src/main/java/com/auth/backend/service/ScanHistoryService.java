package com.auth.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auth.backend.dto.ScanHistoryDto;
import com.auth.backend.model.ScanHistory;
import com.auth.backend.model.User;
import com.auth.backend.repository.ScanHistoryRepository;
import com.auth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScanHistoryService {

    private final UserRepository userRepository;
    private final ScanHistoryRepository scanHistoryRepository;

    @Transactional
    public ScanHistoryDto createScan(String email, String url) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        ScanHistory newScan = ScanHistory.builder()
                .url(url)
                .user(user)
                .build();

        ScanHistory savedScan = scanHistoryRepository.save(newScan);
        return ScanHistoryDto.fromEntity(savedScan);
    }

    @Transactional(readOnly = true)
    public List<ScanHistoryDto> getScanHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return scanHistoryRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(ScanHistoryDto::fromEntity) 
                .collect(Collectors.toList());
    }
}