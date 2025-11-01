package base.BaseJava;

import java.sql.Date;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Project {
    private int id;
    private String name;
    private String description;
    private Date deadline; // Using java.sql.Date
    private String priority; // Added priority field
    private Map<String, String> members; // Key is String (Employee ID)
    private List<Task> tasks;

    // Constructors

    public Project() {
        this.members = new HashMap<>();
        this.tasks = new ArrayList<>();
    }

    public Project(int id, String name, String description, Date deadline, String priority) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.deadline = deadline;
        this.priority = priority;
        this.members = new HashMap<>();
        this.tasks = new ArrayList<>();
    }

    // Getters and Setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getDeadline() {
        return deadline;
    }

    public void setDeadline(Date deadline) {
        this.deadline = deadline;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Map<String, String> getMembers() {
        return members;
    }

    public void setMembers(Map<String, String> members) {
        this.members = members;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    // Other methods

    public void addMember(Employee employee, String role) {
        members.put(String.valueOf(employee.getId()), role); // Use employee ID as key
    }

    public void removeMember(Employee employee) {
        members.remove(String.valueOf(employee.getId())); // Use employee ID to remove
    }

    public void addTask(Task task) {
        tasks.add(task);
    }

    public void removeTask(Task task) {
        tasks.remove(task);
    }

    @Override
    public String toString() {
        return name;
    }
}