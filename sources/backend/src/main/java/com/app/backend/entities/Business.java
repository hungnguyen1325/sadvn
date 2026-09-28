package com.app.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "business")
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @ColumnDefault("newsequentialid()")
    @Column(name = "uuid", nullable = false)
    private UUID uuid;

    @Size(max = 255)
    @NotNull
    @Nationalized
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 20)
    @NotNull
    @Column(name = "tax_code", nullable = false, length = 20)
    private String taxCode;

    @Size(max = 255)
    @Nationalized
    @Column(name = "address")
    private String address;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "create_at", nullable = false)
    private LocalDateTime createAt;

    @NotNull
    @ColumnDefault("sysutcdatetime()")
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updateAt;
    @NotNull
    @ColumnDefault("0")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;


}