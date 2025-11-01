package api.jgdiffapi.task;

import api.jgdiffapi.employee.Employee;
import api.jgdiffapi.employee.EmployeeRepository;
import api.jgdiffapi.project.Project;
import api.jgdiffapi.project.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }


    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }


    public Task createTask(String name, String description, String priority, Date dueDate, String status, Long assigneeId){
         Task task = new Task();
        Employee employee = employeeRepository.findById(assigneeId).orElse(null);
        if (employee != null){
            task.setAssignee(employee);
        }
        task.setName(name);
        task.setDescription(description);
        task.setPriority(priority);
        task.setDueDate(dueDate);
        task.setStatus(status);

        return taskRepository.save(task);
    }

   public Task updateTask(Long id, String name, String description, String priority, Date dueDate, String status, Long assigneeId, Long projectId) {
        Task task = taskRepository.findById(id).orElse(null);
        Project project = projectRepository.findById(projectId).orElse(null);
           if (task != null && project != null) {
            Employee employee = employeeRepository.findById(assigneeId).orElse(null);
            if (employee != null){
                task.setAssignee(employee);
            }
            task.setName(name);
            task.setDescription(description);
            task.setPriority(priority);
            task.setDueDate(dueDate);
            task.setStatus(status);
            project.getTasks().add(task); // Add task to the project
            projectRepository.save(project);
            return taskRepository.save(task);
        }
       return null;
    }

     public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}