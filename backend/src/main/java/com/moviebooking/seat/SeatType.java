package com.moviebooking.seat;

import java.math.BigDecimal;

public enum SeatType {
    STANDARD("1.00"), VIP("1.25");

    private final BigDecimal priceMultiplier;

    SeatType(String m) { this.priceMultiplier = new BigDecimal(m); }

    public BigDecimal getPriceMultiplier() { return priceMultiplier; }
}
