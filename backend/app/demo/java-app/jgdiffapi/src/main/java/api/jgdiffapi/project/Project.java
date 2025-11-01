package api.jgdiffapi.project;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import api.jgdiffapi.task.Task;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private Date deadline;

    //New members field
     @ElementCollection
    @CollectionTable(name = "project_members", joinColumns = @JoinColumn(name = "project_id"))
    @MapKeyColumn(name = "employee_id")
    @Column(name = "role")
    private Map<String, String> members = new HashMap<>();

     @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
     @JoinColumn(name = "project_id")
     private List<Task> tasks = new ArrayList<>();
    
    private String priority;
}