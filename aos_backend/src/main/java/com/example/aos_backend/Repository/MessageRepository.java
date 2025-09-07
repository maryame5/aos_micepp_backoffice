package com.example.aos_backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.aos_backend.user.MessageContact;

public interface MessageRepository extends JpaRepository<MessageContact, Long> {

    List<MessageContact> findAllByOrderByCreatedDateDesc();

}
