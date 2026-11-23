package com.moviebooking.room;

import com.moviebooking.cinema.Cinema;
import com.moviebooking.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cinema_id")
    private Cinema cinema;
    @Column(nullable = false)
    private String name;
    @Column(name = "room_type", nullable = false)
    private String roomType;
    @Column(nullable = false)
    private Integer capacity;
}
