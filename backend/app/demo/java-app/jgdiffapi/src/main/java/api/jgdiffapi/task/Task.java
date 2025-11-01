package api.jgdiffapi.task;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import api.jgdiffapi.employee.Employee;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private String priority;
    private Date dueDate;
    private String status;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private Employee assignee;
}