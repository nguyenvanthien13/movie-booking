package com.moviebooking.cinema;

import com.moviebooking.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cinemas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cinema extends BaseEntity {
    @Column(nullable = false)
    private String name;
    private String address;
    private String city;
}
