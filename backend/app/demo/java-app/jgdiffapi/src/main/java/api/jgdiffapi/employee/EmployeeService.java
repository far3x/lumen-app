package api.jgdiffapi.employee;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }


    public Employee createEmployee(String name) {
        Employee employee = new Employee();
        employee.setName(name);
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long id, String name) {
        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee != null) {
            employee.setName(name);
            return employeeRepository.save(employee);
        }
       return null;
    }

    public void deleteEmployee(Long id){
        employeeRepository.deleteById(id);
    }
}