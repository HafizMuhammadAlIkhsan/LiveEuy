package com.liveeuy.catalog_service.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


@Getter
@RequiredArgsConstructor 
public enum AgeRating {
    SU("Semua Umur", 0),
    R13("Remaja 13+", 13),
    D16("Dewasa 16+", 16),
    D18("Dewasa 18+", 18),
    D21("Dewasa 21+", 21);

    private final String label;
    private final int minAge;

    public boolean isAllowedForAge(int userAge) {
        return userAge >= this.minAge;
    }
}
