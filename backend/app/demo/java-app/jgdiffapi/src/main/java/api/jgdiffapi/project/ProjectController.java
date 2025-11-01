package api.jgdiffapi.project;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }


    @PostMapping
    public Project createProject( @RequestParam String name,
                                  @RequestParam String description,
                                  @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date deadline,
                                   @RequestParam String priority) {
        return projectService.createProject(name, description, deadline, priority);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody ProjectUpdateRequest request) {
        return projectService.updateProject(id, request.getName(), request.getDescription(), request.getDeadline(), request.getPriority(), request.getMembers());
    }


     @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
    }
}