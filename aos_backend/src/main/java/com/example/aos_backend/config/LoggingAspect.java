package com.example.aos_backend.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.example.aos_backend.Service.LogService;
import com.example.aos_backend.user.Utilisateur;

import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class LoggingAspect {
    private final LogService logService;

    @Pointcut("execution(* com.example.aos_backend.Service.*.*(..)) && !execution(* com.example.aos_backend.Service.LogService.*(..))")
    public void serviceMethods() {
    }

    @Around("serviceMethods()")
    public Object logServiceActions(ProceedingJoinPoint joinPoint) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Utilisateur) {
            Utilisateur user = (Utilisateur) authentication.getPrincipal();
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String action = className + "." + methodName;

            // Log before execution
            logService.saveLog(user.getId(), action, "Started");

            try {
                Object result = joinPoint.proceed();

                // Log after successful execution
                logService.saveLog(user.getId(), action, "Completed successfully");

                return result;
            } catch (Throwable throwable) {
                // Log on error
                logService.saveLog(user.getId(), action, "Failed: " + throwable.getMessage());
                throw throwable;
            }
        } else {
            // No authenticated user, proceed without logging
            return joinPoint.proceed();
        }
    }
}
