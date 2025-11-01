package base.util;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.hc.client5.http.classic.methods.HttpDelete;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.classic.methods.HttpPut;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.HttpStatus;
import org.apache.hc.core5.http.ParseException;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.net.URIBuilder;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;

import base.BaseJava.Employee;
import base.BaseJava.Project;
import base.BaseJava.Task;

public class ApiService {
    private final String baseUrl = "http://localhost:8080";
    private final ObjectMapper objectMapper;
    private final CloseableHttpClient httpClient;

    public ApiService() {
        httpClient = HttpClients.createDefault();
        objectMapper = new ObjectMapper();

        // Register a module to handle java.sql.Date
        SimpleModule module = new SimpleModule();
        module.addSerializer(Date.class, new SqlDateSerializer());
        module.addDeserializer(Date.class, new SqlDateDeserializer());
        objectMapper.registerModule(module);
    
        // Other configurations (if needed)
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.configure(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE, false);
    }

    // Authentication

    public String signup(String username, String password) throws IOException, URISyntaxException, ParseException {
        return authRequest("/signup", username, password);
    }

    public String login(String username, String password) throws IOException, URISyntaxException, ParseException {
        return authRequest("/login", username, password);
    }

    private String authRequest(String endpoint, String username, String password) throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + endpoint).build();
        HttpPost request = new HttpPost(uri);
        String json = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
        request.setEntity(new StringEntity(json, ContentType.APPLICATION_JSON));
        request.setHeader("Content-Type", "application/json");
    
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            int status = response.getCode();
            HttpEntity entity = response.getEntity();
            String responseBody = entity != null ? EntityUtils.toString(entity) : null;
    
            if (status == HttpStatus.SC_CREATED) {
                return "{\"message\":\"Account created successfully\"}";
            } else if (status == HttpStatus.SC_OK) {
                return "{\"message\":\"Login successful\"}";
            } else if (status == HttpStatus.SC_BAD_REQUEST) {
                return "{\"message\":\"Error account not created\"}";
            } else if (status == HttpStatus.SC_UNAUTHORIZED) {
                return "{\"message\":\"Login failed\"}";
            } else {
                throw new IOException("Authentication error: " + responseBody);
            }
        }
    }

    // Employee Management

    public List<Employee> getAllEmployees() throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + "/employees").build();
        HttpGet request = new HttpGet(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return Arrays.asList(objectMapper.readValue(json, Employee[].class));
            } else {
                throw new IOException("Failed to get employees: " + response.getCode());
            }
        }
    }

    public Employee getEmployeeById(int id) throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + "/employees/" + id).build();
        HttpGet request = new HttpGet(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return objectMapper.readValue(json, Employee.class);
            } else {
                throw new IOException("Failed to get employee: " + response.getCode());
            }
        }
    }

    public Employee createEmployee(String name) throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + "/employees").build();
        HttpPost request = new HttpPost(uri);
        request.setEntity(new StringEntity(name, ContentType.TEXT_PLAIN));
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return objectMapper.readValue(json, Employee.class);
            } else {
                throw new IOException("Failed to create employee: " + response.getCode());
            }
        }
    }

    public Employee updateEmployee(int id, String name) throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + "/employees/" + id).build();
        HttpPut request = new HttpPut(uri);
        request.setEntity(new StringEntity(name, ContentType.TEXT_PLAIN));
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return objectMapper.readValue(json, Employee.class);
            } else {
                throw new IOException("Failed to update employee: " + response.getCode());
            }
        }
    }

    public void deleteEmployee(int id) throws IOException, URISyntaxException {
        URI uri = new URIBuilder(baseUrl + "/employees/" + id).build();
        HttpDelete request = new HttpDelete(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() != HttpStatus.SC_OK) {
                throw new IOException("Failed to delete employee: " + response.getCode());
            }
        }
    }

    // Project Management

    public List<Project> getAllProjects() throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + "/projects").build();
        HttpGet request = new HttpGet(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return Arrays.asList(objectMapper.readValue(json, Project[].class));
            } else {
                throw new IOException("Failed to get projects: " + response.getCode());
            }
        }
    }

    public Project getProjectById(int id) throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + "/projects/" + id).build();
        HttpGet request = new HttpGet(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return objectMapper.readValue(json, Project.class);
            } else {
                throw new IOException("Failed to get project: " + response.getCode());
            }
        }
    }

    public Project createProject(String name, String description, LocalDate deadline, String priority) throws IOException, URISyntaxException, ParseException {
        // Convert LocalDate to java.sql.Date
        Date sqlDeadline = (deadline != null) ? Date.valueOf(deadline) : null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDeadline = (sqlDeadline != null) ? sqlDeadline.toString() : null;

        URI uri = new URIBuilder(baseUrl + "/projects")
                .addParameter("name", name)
                .addParameter("description", description)
                .addParameter("deadline", formattedDeadline)
                  .addParameter("priority", priority)
                .build();
        HttpPost request = new HttpPost(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return objectMapper.readValue(json, Project.class);
            } else {
                throw new IOException("Failed to create project: " + response.getCode());
            }
        }
    }

    public Project updateProject(int id, String name, String description, LocalDate deadline, String priority, Map<String, String> members) throws IOException, URISyntaxException, ParseException {
         // Convert LocalDate to java.sql.Date
        Date sqlDeadline = (deadline != null) ? Date.valueOf(deadline) : null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDeadline = (sqlDeadline != null) ? sqlDeadline.toString() : null;


        URI uri = new URIBuilder(baseUrl + "/projects/" + id).build();

         HttpPut request = new HttpPut(uri);
        // Create a JSON payload for the members
       
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", name);
        requestBody.put("description", description);
        requestBody.put("deadline", formattedDeadline);
         requestBody.put("priority", priority);
          if (members != null && !members.isEmpty()){
            requestBody.put("members", members);
          }
          String jsonRequest = objectMapper.writeValueAsString(requestBody);
         request.setEntity(new StringEntity(jsonRequest, ContentType.APPLICATION_JSON));
         request.setHeader("Content-Type", "application/json");


        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
               return objectMapper.readValue(json, Project.class);

            } else {
                throw new IOException("Failed to update project: " + response.getCode());
            }
        }
    }


    public void deleteProject(int id) throws IOException, URISyntaxException {
        URI uri = new URIBuilder(baseUrl + "/projects/" + id).build();
        HttpDelete request = new HttpDelete(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() != HttpStatus.SC_OK) {
                throw new IOException("Failed to delete project: " + response.getCode());
            }
        }
    }

    // Task Management

    public List<Task> getAllTasks() throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + "/tasks").build();
        HttpGet request = new HttpGet(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return Arrays.asList(objectMapper.readValue(json, Task[].class));
            } else {
                throw new IOException("Failed to get tasks: " + response.getCode());
            }
        }
    }

    public Task getTaskById(int id) throws IOException, URISyntaxException, ParseException {
        URI uri = new URIBuilder(baseUrl + "/tasks/" + id).build();
        HttpGet request = new HttpGet(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return objectMapper.readValue(json, Task.class);
            } else {
                throw new IOException("Failed to get task: " + response.getCode());
            }
        }
    }

    public Task createTask(String name, String description, String priority, LocalDate dueDate, String status, int assigneeId) throws IOException, URISyntaxException, ParseException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDueDate = dueDate.format(formatter);
        URI uri = new URIBuilder(baseUrl + "/tasks")
                .addParameter("name", name)
                .addParameter("description", description)
                .addParameter("priority", priority)
                .addParameter("dueDate", formattedDueDate)
                .addParameter("status", status)
                .addParameter("assigneeId", String.valueOf(assigneeId))
                .build();
        HttpPost request = new HttpPost(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                return objectMapper.readValue(json, Task.class);
            } else {
                throw new IOException("Failed to create task: " + response.getCode());
            }
        }
    }

   public Task updateTask(int id, String name, String description, String priority, LocalDate dueDate, String status, int assigneeId, int projectId) throws IOException, URISyntaxException, ParseException {
         DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDueDate = dueDate.format(formatter);
         URI uri = new URIBuilder(baseUrl + "/tasks/" + id)
                .addParameter("name", name)
                .addParameter("description", description)
                .addParameter("priority", priority)
                .addParameter("dueDate", formattedDueDate)
                .addParameter("status", status)
                 .addParameter("projectId", String.valueOf(projectId))
                .addParameter("assigneeId", String.valueOf(assigneeId))
                .build();
        HttpPut request = new HttpPut(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() == HttpStatus.SC_OK) {
                HttpEntity entity = response.getEntity();
                String json = EntityUtils.toString(entity);
                 return objectMapper.readValue(json, Task.class);
            } else {
                throw new IOException("Failed to update task: " + response.getCode());
            }
        }
    }

    public void deleteTask(int id) throws IOException, URISyntaxException {
        URI uri = new URIBuilder(baseUrl + "/tasks/" + id).build();
        HttpDelete request = new HttpDelete(uri);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            if (response.getCode() != HttpStatus.SC_OK) {
                throw new IOException("Failed to delete task: " + response.getCode());
            }
        }
    }
}