package api.jgdiffapi.project;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public Project getProjectById(Long id) {
        return projectRepository.findById(id).orElse(null);
    }

     public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }
    public Project createProject(String name, String description, Date deadline, String priority) {
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setDeadline(deadline);
        project.setPriority(priority);
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, String name, String description, Date deadline, String priority, Map<String, String> members) {
         Project project = projectRepository.findById(id).orElse(null);
        if (project != null) {
            project.setName(name);
            project.setDescription(description);
            project.setDeadline(deadline);
            project.setPriority(priority);
             if (members != null && !members.isEmpty()){
              project.setMembers(members);
             }
            return projectRepository.save(project);
        }
         return null;
    }


    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}