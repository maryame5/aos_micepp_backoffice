package com.example.aos_backend.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/documents_public")
@RequiredArgsConstructor
@Tag(name = "Document Public")
public class DocumentPublicController {

}
