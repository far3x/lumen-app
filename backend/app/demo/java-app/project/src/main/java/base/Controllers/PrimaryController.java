package base.Controllers;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.ResourceBundle;
import java.util.stream.Collectors;

import org.apache.hc.core5.http.ParseException;

import base.App;
import base.BaseJava.Employee;
import base.BaseJava.Project;
import base.BaseJava.Task;
import base.util.ApiService;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonBar;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Dialog;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.MenuItem;
import javafx.scene.control.TextArea;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;

public class PrimaryController implements Initializable {

    private final ApiService apiService = App.getApiService();
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @FXML private ListView<Project> projectListView;
    @FXML private ListView<Employee> employeeListView;
    @FXML private Label projectDetailsNameLabel;
    @FXML private Label projectDetailsIDLabel;
    @FXML private TextArea projectDetailsTextArea;
    @FXML private Label projectDetailsDeadlineLabel;
    @FXML private ListView<Employee> projectDetailsMembersListView;
    @FXML private ListView<Task> projectDetailsTasksListView;
    @FXML private Label employeeDetailsNameLabel;
    @FXML private Label employeeDetailsIDLabel;
    @FXML private Label employeeDetailsProjectHistoryLabel;
    @FXML private ListView<Project> employeeDetailsProjectListView;
    @FXML private MenuItem menuLogout;
    @FXML private MenuItem menuExit;
    @FXML private MenuItem menuProjects;
    @FXML private MenuItem menuEmployees;
    @FXML private Button createProjectButton;
    @FXML private Button createEmployeeButton;
    @FXML private Button editProjectButton;
    @FXML private Button deleteProjectButton;
    @FXML private Button editEmployeeButton;
    @FXML private Button deleteEmployeeButton;
    @FXML private Button addMemberButton;
    @FXML private Button addTaskButton;

    @FXML private Label projectDetailsPriorityLabel; // Label for displaying project priority

    @FXML private VBox projectDetailsView;
    @FXML private VBox employeeDetailsView;

    @FXML private HBox todoView;
    @FXML private HBox inProgressView;
    @FXML private HBox doneView;
     

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        menuListeners();
        loadData();
        setupProjectListView();
        setupEmployeeListView();
        setupProjectDetailsEventHandlers();
        setupEmployeeDetailsEventHandlers();
        configureButtons();

        // Initially hide the details views
       if (projectDetailsView != null) {
            projectDetailsView.setVisible(false);
        }
        if (employeeDetailsView != null) {
            employeeDetailsView.setVisible(false);
        }
        // Setup Kanban
        setupKanbanView();
    }

    private void menuListeners() {
        menuLogout.setOnAction(event -> {
            try {
                App.setRoot("secondary");
            } catch (IOException e) {
                showAlert("Error", "Failed to load login page.", Alert.AlertType.ERROR);
            }
        });

        menuExit.setOnAction(event -> Platform.exit());

        menuProjects.setOnAction(event -> {
            projectListView.getSelectionModel().clearSelection();
            employeeListView.getSelectionModel().clearSelection();
            clearProjectDetails();
            clearEmployeeDetails();
            if (projectDetailsView != null) {
                 projectDetailsView.setVisible(false);
             }
            if (employeeDetailsView != null) {
                employeeDetailsView.setVisible(false);
            }
        });

        menuEmployees.setOnAction(event -> {
            projectListView.getSelectionModel().clearSelection();
            employeeListView.getSelectionModel().clearSelection();
            clearProjectDetails();
            clearEmployeeDetails();
           if (projectDetailsView != null) {
            projectDetailsView.setVisible(false);
           }
           if (employeeDetailsView != null) {
           employeeDetailsView.setVisible(false);
           }
        });
    }

    private void loadData() {
        loadProjects();
        loadEmployees();
    }

    private void loadProjects() {
        try {
            List<Project> projects = apiService.getAllProjects();
            ObservableList<Project> projectObservableList = FXCollections.observableArrayList(projects);
            projectListView.setItems(projectObservableList);
        } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to load projects.", Alert.AlertType.ERROR);
        }
    }

    private void loadEmployees() {
        try {
            List<Employee> employees = apiService.getAllEmployees();
            ObservableList<Employee> employeeObservableList = FXCollections.observableArrayList(employees);
            employeeListView.setItems(employeeObservableList);
        } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to load employees.", Alert.AlertType.ERROR);
        }
    }

      private void setupProjectListView() {
         projectListView.getSelectionModel().selectedItemProperty().addListener((obs, oldSelection, newSelection) -> {
            if (newSelection != null) {
                employeeListView.getSelectionModel().clearSelection();
                // Correctly fetch and display the project details here
                try {
                    Project projectHolder = apiService.getProjectById(newSelection.getId());
                     showProjectDetails(projectHolder);

                    if (employeeDetailsView != null) {
                        employeeDetailsView.setVisible(false);
                    }
                    if (projectDetailsView != null) {
                        projectDetailsView.setVisible(true);
                    }
                  
                } catch (IOException | URISyntaxException | ParseException e) {
                     showAlert("Error", "Failed to get Project Details.", Alert.AlertType.ERROR);
                }
              
            }
        });

        projectListView.setCellFactory(lv -> new ListCell<Project>() {
            @Override
            protected void updateItem(Project item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    setText(item.getName());
                }
            }
        });
    }

    private void setupEmployeeListView() {
        employeeListView.getSelectionModel().selectedItemProperty().addListener((obs, oldSelection, newSelection) -> {
            if (newSelection != null) {
                projectListView.getSelectionModel().clearSelection();
                showEmployeeDetails(newSelection);
               if (projectDetailsView != null) {
                  projectDetailsView.setVisible(false);
                }
               if (employeeDetailsView != null) {
                 employeeDetailsView.setVisible(true);
                  }
            }
        });

        employeeListView.setCellFactory(lv -> new ListCell<Employee>() {
            @Override
            protected void updateItem(Employee item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    setText(item.getName());
                }
            }
        });
    }

     private void setupProjectDetailsEventHandlers() {
        projectDetailsMembersListView.setOnMouseClicked(event -> {
            Employee selectedMember = projectDetailsMembersListView.getSelectionModel().getSelectedItem();
            if (selectedMember != null) {
                showEmployeeDetails(selectedMember);
            }
        });

        projectDetailsTasksListView.setOnMouseClicked(event -> {
            Task selectedTask = projectDetailsTasksListView.getSelectionModel().getSelectedItem();
             if (selectedTask != null) {
                showTaskDetails(selectedTask);
            }
        });
    }


    private void setupEmployeeDetailsEventHandlers() {
        employeeDetailsProjectListView.setOnMouseClicked(event -> {
            Project selectedProject = employeeDetailsProjectListView.getSelectionModel().getSelectedItem();
            if (selectedProject != null) {
                showProjectDetails(selectedProject);
            }
        });
    }


   private void showProjectDetails(Project project) {
      if (projectDetailsView != null) {
            projectDetailsView.setVisible(true);
       }
        try {
            Project projectHolder = apiService.getProjectById(project.getId());
         
             projectDetailsNameLabel.setText(projectHolder.getName());
            projectDetailsIDLabel.setText(String.valueOf(projectHolder.getId()));
            projectDetailsTextArea.setText(projectHolder.getDescription());
            if (projectDetailsPriorityLabel != null) {
            projectDetailsPriorityLabel.setText(projectHolder.getPriority());
           }
            // Format java.sql.Date to String for display
           if (projectHolder.getDeadline() != null) {
              projectDetailsDeadlineLabel.setText(projectHolder.getDeadline().toString());
            } else {
             projectDetailsDeadlineLabel.setText("");
            }

            projectDetailsMembersListView.setItems(FXCollections.observableArrayList(projectHolder.getMembers().entrySet().stream()
                   .map(entry -> {
                        try {
                            return apiService.getEmployeeById(Integer.parseInt(entry.getKey()));
                        } catch (IOException | URISyntaxException | ParseException e) {
                             throw new RuntimeException(e);
                        }
                    })
                   .collect(Collectors.toList())));


           List<Task> tasks = apiService.getAllTasks().stream()
                     .filter(task -> projectHolder.getTasks().stream().anyMatch(projectTask -> projectTask.getId() == task.getId()))
                    .collect(Collectors.toList());
             ObservableList<Task> taskList = FXCollections.observableArrayList(tasks);
             projectDetailsTasksListView.setItems(taskList);
          } catch (IOException | URISyntaxException | ParseException ex) {
            showAlert("Error", "Failed to refresh project data.", Alert.AlertType.ERROR);
        }
    }

   private void showEmployeeDetails(Employee employee) {
        if (projectDetailsView != null) {
            projectDetailsView.setVisible(false);
         }
           if (employeeDetailsView != null) {
           employeeDetailsView.setVisible(true);
          }
          employeeDetailsNameLabel.setText(employee.getName());
          employeeDetailsIDLabel.setText(String.valueOf(employee.getId()));
        
        try {
            List<Project> projects = apiService.getAllProjects().stream()
                   .filter(project -> project.getMembers().keySet().stream().anyMatch(memberId -> memberId.equals(String.valueOf(employee.getId()))))
                    .collect(Collectors.toList());
             ObservableList<Project> projectList = FXCollections.observableArrayList(projects);
            employeeDetailsProjectListView.setItems(projectList);
         } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to load employee projects.", Alert.AlertType.ERROR);
         }
    }

    private void clearProjectDetails() {
        projectDetailsNameLabel.setText("");
        projectDetailsIDLabel.setText("");
        projectDetailsTextArea.setText("");
        projectDetailsDeadlineLabel.setText("");
        if (projectDetailsPriorityLabel != null) {
            projectDetailsPriorityLabel.setText("");
        }
        projectDetailsMembersListView.setItems(null);
        projectDetailsTasksListView.setItems(null);
    }

    private void clearEmployeeDetails() {
        employeeDetailsNameLabel.setText("");
        employeeDetailsIDLabel.setText("");
        employeeDetailsProjectListView.setItems(null);
    }

    @FXML
    private void handleCreateProject(ActionEvent event) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/base/fourth.fxml"));
            Parent root = loader.load();
            CreateProjectController createProjectController = loader.getController();
            createProjectController.setPrimaryController(this);

            Stage stage = new Stage();
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setTitle("Create New Project");
            stage.setScene(new Scene(root));
            stage.showAndWait();
        } catch (IOException e) {
            showAlert("Error", "Failed to open create project window.", Alert.AlertType.ERROR);
        }
    }

    @FXML
    private void handleCreateEmployee(ActionEvent event) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/base/createEmployee.fxml"));
            Parent root = loader.load();
            CreateEmployeeController createEmployeeController = loader.getController();
            createEmployeeController.setPrimaryController(this);

            Stage stage = new Stage();
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setTitle("Create New Employee");
            stage.setScene(new Scene(root));
            stage.showAndWait();
        } catch (IOException e) {
            showAlert("Error", "Failed to open create employee window.", Alert.AlertType.ERROR);
        }
    }

    @FXML
    private void handleEditProject(ActionEvent event) {
        Project selectedProject = projectListView.getSelectionModel().getSelectedItem();
        if (selectedProject == null) {
            showAlert("No Project Selected", "Please select a project to edit.", Alert.AlertType.WARNING);
            return;
        }

        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/base/editProject.fxml"));
            Parent root = loader.load();
            EditProjectController editProjectController = loader.getController();
            editProjectController.setProject(selectedProject);
            editProjectController.setPrimaryController(this);

            Stage stage = new Stage();
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setTitle("Edit Project");
            stage.setScene(new Scene(root));
            stage.showAndWait();
        } catch (IOException e) {
            showAlert("Error", "Failed to open edit project window.", Alert.AlertType.ERROR);
        }
    }

    @FXML
    private void handleDeleteProject(ActionEvent event) {
        Project selectedProject = projectListView.getSelectionModel().getSelectedItem();
        if (selectedProject == null) {
            showAlert("No Project Selected", "Please select a project to delete.", Alert.AlertType.WARNING);
            return;
        }

        Alert confirmation = new Alert(Alert.AlertType.CONFIRMATION);
        confirmation.setTitle("Confirm Delete");
        confirmation.setHeaderText("Delete Project");
        confirmation.setContentText("Are you sure you want to delete this project?");
        confirmation.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                try {
                    apiService.deleteProject(selectedProject.getId());
                    loadProjects(); // Reload projects after deletion
                } catch (IOException | URISyntaxException e) {
                    showAlert("Error", "Failed to delete project.", Alert.AlertType.ERROR);
                }
            }
        });
    }

    @FXML
    private void handleEditEmployee(ActionEvent event) {
        Employee selectedEmployee = employeeListView.getSelectionModel().getSelectedItem();
        if (selectedEmployee == null) {
            showAlert("No Employee Selected", "Please select an employee to edit.", Alert.AlertType.WARNING);
            return;
        }

        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/base/editEmployee.fxml"));
            Parent root = loader.load();
            EditEmployeeController editEmployeeController = loader.getController();
            editEmployeeController.setEmployee(selectedEmployee);
            editEmployeeController.setPrimaryController(this);

            Stage stage = new Stage();
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setTitle("Edit Employee");
            stage.setScene(new Scene(root));
            stage.showAndWait();
        } catch (IOException e) {
            showAlert("Error", "Failed to open edit employee window.", Alert.AlertType.ERROR);
        }
    }

    @FXML
    private void handleDeleteEmployee(ActionEvent event) {
        Employee selectedEmployee = employeeListView.getSelectionModel().getSelectedItem();
        if (selectedEmployee == null) {
            showAlert("No Employee Selected", "Please select an employee to delete.", Alert.AlertType.WARNING);
            return;
        }

        Alert confirmation = new Alert(Alert.AlertType.CONFIRMATION);
        confirmation.setTitle("Confirm Delete");
        confirmation.setHeaderText("Delete Employee");
        confirmation.setContentText("Are you sure you want to delete this employee?");
        confirmation.showAndWait().ifPresent(response -> {
            if (response == ButtonType.OK) {
                try {
                    apiService.deleteEmployee(selectedEmployee.getId());
                    loadEmployees(); // Reload employees after deletion
                } catch (IOException | URISyntaxException e) {
                    showAlert("Error", "Failed to delete employee.", Alert.AlertType.ERROR);
                }
            }
        });
    }

   @FXML
    private void handleAddMember(ActionEvent event) {
        Project selectedProject = projectListView.getSelectionModel().getSelectedItem();
        if (selectedProject == null) {
            showAlert("No Project Selected", "Please select a project to add a member to.", Alert.AlertType.WARNING);
            return;
        }

        List<Employee> allEmployees;
        try {
            allEmployees = apiService.getAllEmployees();
        } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to load employees.", Alert.AlertType.ERROR);
            return;
        }
          // Filter out employees already in the project
          List<Employee> availableEmployees = allEmployees.stream()
                 .filter(emp -> !selectedProject.getMembers().containsKey(String.valueOf(emp.getId())))
                .collect(Collectors.toList());

        // Create a dialog for selecting a member
        Dialog<Employee> dialog = new Dialog<>();
        dialog.setTitle("Add Member");
        dialog.setHeaderText("Select a member to add to the project");

        // Set the button types
        ButtonType addButton = new ButtonType("Add", ButtonBar.ButtonData.OK_DONE);
        dialog.getDialogPane().getButtonTypes().addAll(addButton, ButtonType.CANCEL);

        // Create a ListView for employee selection
        ListView<Employee> employeeListView = new ListView<>();
        employeeListView.setItems(FXCollections.observableArrayList(availableEmployees));
        employeeListView.setPrefHeight(200);

        // Set the dialog content
        dialog.getDialogPane().setContent(employeeListView);

        // Convert the result to an employee when 'Add' is clicked
        dialog.setResultConverter(dialogButton -> {
            if (dialogButton == addButton) {
                return employeeListView.getSelectionModel().getSelectedItem();
            }
            return null;
        });

        // Show the dialog and process the result
        dialog.showAndWait().ifPresent(selectedEmployee -> {
             if (selectedEmployee != null) {
                try {
                     String role = "Member";
                      selectedProject.addMember(selectedEmployee, role);
                      HashMap<String, String> members = new HashMap<>(selectedProject.getMembers());
                      System.out.println("Members before update: " + members);

                         Project updatedProject = apiService.updateProject(selectedProject.getId(), selectedProject.getName(),
                                selectedProject.getDescription(), selectedProject.getDeadline().toLocalDate(), selectedProject.getPriority(), members);
                      if(updatedProject != null) {
                         System.out.println("Members after update: " + updatedProject.getMembers());
                           showProjectDetails(updatedProject);
                         loadProjects();

                      } else {
                         showAlert("Error", "Failed to add member to the project.", Alert.AlertType.ERROR);
                     }
                 } catch (IOException | URISyntaxException | ParseException e) {
                   showAlert("Error", "Failed to add member to the project.", Alert.AlertType.ERROR);
                }
            }
        });
    }


    @FXML
    private void handleAddTask(ActionEvent event) {
       Project selectedProject = projectListView.getSelectionModel().getSelectedItem();
        if (selectedProject == null) {
            showAlert("No Project Selected", "Please select a project to add a task to.", Alert.AlertType.WARNING);
            return;
        }

        try {
             FXMLLoader loader = new FXMLLoader(getClass().getResource("/base/createTask.fxml"));
            Parent root = loader.load();
            CreateTaskController createTaskController = loader.getController();
           createTaskController.setProject(selectedProject);
            createTaskController.setPrimaryController(this);

            Stage stage = new Stage();
            stage.initModality(Modality.APPLICATION_MODAL);
            stage.setTitle("Create New Task");
            stage.setScene(new Scene(root));
            stage.showAndWait();
        } catch (IOException e) {
             showAlert("Error", "Failed to open create task window.", Alert.AlertType.ERROR);
        }
    }


    private void showAlert(String title, String content, Alert.AlertType alertType) {
        Platform.runLater(() -> {
            Alert alert = new Alert(alertType);
            alert.setTitle(title);
            alert.setHeaderText(null);
            alert.setContentText(content);
            alert.showAndWait();
        });
    }

    public void refreshProjectList() {
        loadProjects();
         setupKanbanView();
    }

    public void refreshEmployeeList() {
        loadEmployees();
    }

    private void configureButtons() {
        // Disable buttons if no project is selected
        projectListView.getSelectionModel().selectedItemProperty().addListener((obs, oldVal, newVal) -> {
            boolean projectSelected = newVal != null;
            editProjectButton.setDisable(!projectSelected);
            deleteProjectButton.setDisable(!projectSelected);
            addMemberButton.setDisable(!projectSelected);
            addTaskButton.setDisable(!projectSelected);
        });

        // Disable buttons if no employee is selected
        employeeListView.getSelectionModel().selectedItemProperty().addListener((obs, oldVal, newVal) -> {
            boolean employeeSelected = newVal != null;
            editEmployeeButton.setDisable(!employeeSelected);
            deleteEmployeeButton.setDisable(!employeeSelected);
        });

        // Initial button state
        editProjectButton.setDisable(true);
        deleteProjectButton.setDisable(true);
        addMemberButton.setDisable(true);
        addTaskButton.setDisable(true);
        editEmployeeButton.setDisable(true);
        deleteEmployeeButton.setDisable(true);
    }
 private void setupKanbanView() {
    if (todoView == null || inProgressView == null || doneView == null) {
        System.err.println("Kanban view elements are not initialized.");
        return;
    }

    Project selectedProject = projectListView.getSelectionModel().getSelectedItem();
    if (selectedProject == null) {
        if (projectDetailsPriorityLabel != null) {
           projectDetailsPriorityLabel.setText("No Project Selected");
            }
            return;
        }
       try {
             Project projectHolder = apiService.getProjectById(selectedProject.getId());
               List<Task> allTasks = apiService.getAllTasks().stream().filter(task -> projectHolder.getTasks().stream().anyMatch(projectTask -> projectTask.getId() == task.getId())).collect(Collectors.toList());

            // Clear existing tasks from columns
            todoView.getChildren().clear();
            inProgressView.getChildren().clear();
            doneView.getChildren().clear();
             System.out.println("Tasks for project : " + projectHolder.getName());
            for (Task task : allTasks) {
                Label taskLabel = new Label(task.getName() + "\n" + task.getDescription());
                taskLabel.setPadding(new Insets(10));
                taskLabel.setStyle("-fx-background-color: #e0e0e0; -fx-border-color: #b0b0b0; -fx-border-radius: 5;");
                 System.out.println("Task Name: " + task.getName() + ", Status: " + task.getStatus());

                    switch (task.getStatus()) {
                        case "TODO":
                            if (todoView != null) todoView.getChildren().add(taskLabel);
                            break;
                        case "IN PROGRESS":
                            if (inProgressView != null) inProgressView.getChildren().add(taskLabel);
                            break;
                        case "DONE":
                            if(doneView != null) doneView.getChildren().add(taskLabel);
                            break;
                    }
               }
          
        } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to load tasks for Kanban view.", Alert.AlertType.ERROR);
        }
    }
  private Project getProjectForTask(Task task) {
        try {
             List<Project> projects = apiService.getAllProjects();
                for (Project project : projects) {
                   if(project.getTasks().stream().anyMatch(projectTask -> projectTask.getId() == task.getId())){
                        return project;
                    }
               }
              return null;
        } catch (IOException | URISyntaxException | ParseException e) {
           showAlert("Error", "Failed to load projects.", Alert.AlertType.ERROR);
           return null;
      }
    }
   private void showTaskDetails(Task selectedTask) {
      showAlert("Task Details",
                "Name: " + selectedTask.getName() + "\n" +
                         "Description: " + selectedTask.getDescription() + "\n" +
                       "Priority: " + selectedTask.getPriority() + "\n" +
                       "Due Date: " + selectedTask.getDueDate()+ "\n" +
                        "Status: " + selectedTask.getStatus() + "\n" +
                      "Assignee: " + selectedTask.getAssignee().getName(),
                Alert.AlertType.INFORMATION
         );
  }
}