package api.jgdiffapi.project;

import lombok.Getter;
import lombok.Setter;
import java.util.Date;
import java.util.Map;


@Getter
@Setter
public class ProjectUpdateRequest {
    private String name;
    private String description;
     private Date deadline;
     private String priority;
     private Map<String, String> members;
}