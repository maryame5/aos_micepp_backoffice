package com.example.aos_backend.Service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Repository.MessageRepository;
import com.example.aos_backend.user.MessageContact;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MessageService {
    private final MessageRepository messageRepository;

    public List<MessageContact> getAllMessages() {

        List<MessageContact> messages = messageRepository.findAllByOrderByCreatedDateDesc();
        return messages;
    }

}
