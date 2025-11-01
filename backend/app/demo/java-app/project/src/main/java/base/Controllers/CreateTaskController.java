package base.Controllers;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.LocalDate;
import java.util.List;
import java.util.ResourceBundle;

import org.apache.hc.core5.http.ParseException;

import base.App;
import base.BaseJava.Employee;
import base.BaseJava.Project;
import base.BaseJava.Task;
import base.util.ApiService;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.ComboBox;
import javafx.scene.control.DatePicker;
import javafx.scene.control.ListCell;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

public class CreateTaskController implements Initializable {
    private final ApiService apiService = App.getApiService();
    private PrimaryController primaryController;
    private Project project;

    @FXML private TextField taskNameField;
    @FXML private TextArea descriptionArea;
    @FXML private ComboBox<String> priorityComboBox;
    @FXML private DatePicker dueDateDatePicker;
    @FXML private ComboBox<String> statusComboBox;
    @FXML private ComboBox<Employee> assigneeComboBox;

    public void setPrimaryController(PrimaryController primaryController) {
        this.primaryController = primaryController;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        priorityComboBox.setItems(FXCollections.observableArrayList("HIGH", "MEDIUM", "LOW"));
        statusComboBox.setItems(FXCollections.observableArrayList("TODO", "IN PROGRESS", "DONE"));
        try {
            List<Employee> employees = apiService.getAllEmployees();
              assigneeComboBox.setItems(FXCollections.observableArrayList(employees));
                assigneeComboBox.setCellFactory(lv -> new ListCell<Employee>() {
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
           } catch (IOException | URISyntaxException | ParseException e) {
            showAlert("Error", "Failed to load employees.", Alert.AlertType.ERROR);
        }
    }

    @FXML
    private void handleCreateTask(ActionEvent event) {
        String name = taskNameField.getText();
        String description = descriptionArea.getText();
        String priority = priorityComboBox.getValue();
        LocalDate dueDate = dueDateDatePicker.getValue();
        String status = statusComboBox.getValue();
        Employee assignee = assigneeComboBox.getValue();

         if (name.isEmpty() || description.isEmpty() || priority == null || dueDate == null || status == null || assignee == null) {
              showAlert("Error", "Please fill in all fields.", Alert.AlertType.ERROR);
            return;
        }

        try {
           Task createdTask = apiService.createTask(name, description, priority, dueDate, status, assignee.getId());
                if (createdTask != null) {
                  
                   
                   Task updatedTask =  apiService.updateTask(createdTask.getId(), createdTask.getName(), createdTask.getDescription(),
                            createdTask.getPriority(), createdTask.getDueDate().toLocalDate(), createdTask.getStatus(), createdTask.getAssignee().getId(), project.getId());

                 if (updatedTask != null) {
                     primaryController.refreshProjectList();
                    closeWindow();
                    } else {
                    showAlert("Error", "Failed to update task with project ID", Alert.AlertType.ERROR);
                  }
                
                } else {
                showAlert("Error", "Failed to create task.", Alert.AlertType.ERROR);
              }
         } catch (IOException | URISyntaxException | ParseException e) {
           showAlert("Error", "Failed to create task.", Alert.AlertType.ERROR);
           System.out.println(e);
        }
    }

    @FXML
    private void handleCancel(ActionEvent event) {
        closeWindow();
    }

    private void closeWindow() {
        Stage stage = (Stage) taskNameField.getScene().getWindow();
        stage.close();
    }

    private void showAlert(String title, String content, Alert.AlertType alertType) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}