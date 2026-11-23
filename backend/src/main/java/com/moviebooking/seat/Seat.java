package com.moviebooking.seat;

import com.moviebooking.common.BaseEntity;
import com.moviebooking.room.Room;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Seat extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id")
    private Room room;
    @Column(name = "seat_number", nullable = false)
    private String seatNumber;
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    private SeatType seatType;
    @Column(name = "row_name", nullable = false)
    private String rowName;
    @Column(name = "column_number", nullable = false)
    private Integer columnNumber;
}
