package com.finman.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String message) {
        super("RESOURCE_NOT_FOUND", message);
    }

    public ResourceNotFoundException(String resourceName, Object resourceId) {
        super("RESOURCE_NOT_FOUND",
              String.format("%s không tồn tại với ID: %s", resourceName, resourceId),
              resourceName, resourceId);
    }

    public ResourceNotFoundException(String resourceName, String field, Object fieldValue) {
        super("RESOURCE_NOT_FOUND",
              String.format("%s không tồn tại với %s: %s", resourceName, field, fieldValue),
              resourceName, field, fieldValue);
    }
}