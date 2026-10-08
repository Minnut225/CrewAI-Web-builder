package com.finman.dto.response;

import com.finman.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private Long userId;
    private String name;
    private String type;
    private String icon;
    private String color;
    private Boolean isSystem;
    private Instant createdAt;
    private Instant updatedAt;

    public static CategoryResponse fromEntity(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .userId(category.getUserId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .isSystem(category.getUserId() == null)
                .build();
    }
}
