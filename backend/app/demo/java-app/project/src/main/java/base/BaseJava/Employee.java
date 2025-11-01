package base.BaseJava;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Employee {
    private int id;
    private String name;
    private List<Project> projects;

    public Employee() {
        this.projects = new ArrayList<>();
    }

    public Employee(int id, String name) {
        this.id = id;
        this.name = name;
        this.projects = new ArrayList<>();
    }

    // Getters and setters

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

    public List<Project> getProjects() {
        return projects;
    }

    public void setProjects(List<Project> projects) {
        this.projects = projects;
    }

    public void addProject(Project project) {
        if (!projects.contains(project)) {
            projects.add(project);
        }
    }

    public void removeProject(Project project) {
        projects.remove(project);
    }

    @Override
    public String toString() {
        return name;
    }
}