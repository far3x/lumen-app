package api.jgdiffapi.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }


    @PostMapping
    public Task createTask( @RequestParam String name,
                            @RequestParam String description,
                            @RequestParam String priority,
                            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date dueDate,
                            @RequestParam String status,
                            @RequestParam Long assigneeId
    ){
       return taskService.createTask(name, description, priority, dueDate, status, assigneeId);
    }


    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestParam String name,
                           @RequestParam String description,
                           @RequestParam String priority,
                           @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date dueDate,
                           @RequestParam String status,
                           @RequestParam Long assigneeId,
                             @RequestParam Long projectId
    ) {
        return taskService.updateTask(id, name, description, priority, dueDate, status, assigneeId, projectId);
    }


     @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id){
        taskService.deleteTask(id);
    }
}