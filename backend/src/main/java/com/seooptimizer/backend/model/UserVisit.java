package com.seooptimizer.backend.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data 
@NoArgsConstructor
@AllArgsConstructor
public class UserVisit {

    @Id
    private Long userId;

    private LocalDate lastVisitedDate;

    @OneToOne
    @MapsId
    private User user;

    public UserVisit(User user, LocalDate lastVisitedDate) {
        this.user = user;
        this.lastVisitedDate = lastVisitedDate;
    }
}
