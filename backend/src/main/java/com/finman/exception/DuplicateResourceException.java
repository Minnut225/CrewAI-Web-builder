package com.finman.exception;

public class DuplicateResourceException extends BadRequestException {

    public DuplicateResourceException(String message) {
        super("DUPLICATE_ENTRY", message);
    }

    public DuplicateResourceException(String resourceName, String field, Object fieldValue) {
        super("DUPLICATE_ENTRY",
              String.format("%s đã tồn tại với %s: %s", resourceName, field, fieldValue),
              resourceName, field, fieldValue);
    }
}
