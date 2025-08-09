package com.example.aos_backend.Service;

import lombok.Getter;

@Getter
public enum EmailTemplateName {
    ACTIVATE_ACCOUNT("activate_account"),
    WELCOME_EMAIL("welcome_email");

    private final String name;

    EmailTemplateName(String name) {
        this.name = name;
    }
}