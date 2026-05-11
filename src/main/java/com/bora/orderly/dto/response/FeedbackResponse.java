package com.bora.orderly.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class FeedbackResponse {
    private Long id;
    private String tableNumber;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
