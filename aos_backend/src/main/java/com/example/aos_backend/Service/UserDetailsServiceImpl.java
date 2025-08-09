package com.example.aos_backend.Service;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.aos_backend.Repository.*;
import com.example.aos_backend.user.Utilisateur;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UtilisateurRepository userRepository;
    private final AdminRepository adminRepository;
    private final SupportRepository supportRepository;
    private final AgentRepository agentRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return org.springframework.security.core.userdetails.User
            .withUsername(utilisateur.getEmail())
            .password(utilisateur.getPassword())
            .authorities(utilisateur.getRoles().stream()
                .map(role -> "ROLE_" + role.getName())
                .toArray(String[]::new))
            .accountLocked(utilisateur.isAccountLocked())
            .disabled(!utilisateur.isEnabled())
            .build();
    }

    public String getUserRoleType(String email) throws UsernameNotFoundException {
        Optional<Utilisateur> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        if (adminRepository.existsByUtilisateur(user.get())) return "ADMIN";
        if (supportRepository.existsByUtilisateur(user.get())) return "SUPPORT";
        if (agentRepository.existsByUtilisateur(user.get())) return "AGENT";
        return "UNKNOWN";
}
}