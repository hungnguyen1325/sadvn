package com.app.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ColumnDefault("newsequentialid()")
    @Column(name = "uuid", nullable = false)
    private UUID uuid;

    @Size(max = 50)
    @NotNull
    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Size(max = 255)
    @NotNull
    @Column(name = "password", nullable = false)
    private String password;

    @ColumnDefault("sysutcdatetime()")
    @Column(name = "create_at", nullable = false)
    private LocalDateTime createAt;

    @ColumnDefault("sysutcdatetime()")
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;


}