package com.seooptimizer.backend.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.seooptimizer.backend.model.User;
import com.seooptimizer.backend.model.UserVisit;
import com.seooptimizer.backend.repository.UserRepository;
import com.seooptimizer.backend.repository.UserVisitRepository;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserVisitRepository userVisitRepository;

    public void trackDailyVisit(Long userId) {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();

        UserVisit visit = userVisitRepository.findById(userId).orElse(null);

        if (visit == null) {
            // First time ever visiting
            user.setUsageCount(user.getUsageCount() + 1);
            userRepository.save(user);

            visit = new UserVisit(user, today);
            userVisitRepository.save(visit);
        } else if (!visit.getLastVisitedDate().isEqual(today)) {
            // New day visit
            user.setUsageCount(user.getUsageCount() + 1);
            userRepository.save(user);

            visit.setLastVisitedDate(today);
            userVisitRepository.save(visit);
        }
        // else: already visited today, do nothing
    }
}
