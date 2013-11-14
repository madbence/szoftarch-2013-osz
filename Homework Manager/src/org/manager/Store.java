/**
 * 
 */
package org.manager;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;

import org.model.Student;
import org.model.interfaces.AbstractGroup;
import org.model.interfaces.AbstractSolution;
import org.model.interfaces.AbstractTask;
import org.model.interfaces.IStudent;

/**
 * This class contains the instances of the system
 * 
 * @author Tamás
 *
 */
public class Store {

	private List<IStudent> students;
	private List<AbstractGroup> groups;
	private List<AbstractTask> tasks;
	private List<AbstractSolution> solutions;
	
	public Store(DBManager manager) {
		
		//FILL WITH DB INSTANCES
		if(manager != null) {
			final EntityManager em = manager.getEntityManager();
			
			students = em.createQuery("SELECT * FROM Student", IStudent.class).getResultList();
			groups = em.createQuery("SELECT * FROM Group", AbstractGroup.class).getResultList();
			tasks = em.createQuery("SELECT * FROM Task", AbstractTask.class).getResultList();
			solutions = em.createQuery("SELECT * FROM Solution", AbstractSolution.class).getResultList();
		}
		//...
		
		else {
			students = new ArrayList<IStudent>();
			groups = new ArrayList<AbstractGroup>();
			tasks = new ArrayList<AbstractTask>();
			solutions = new ArrayList<AbstractSolution>();
		}
	}
	//STUDENT
	public IStudent getStudent(String neptun) {
		for(IStudent student : students) {
			if(((Student)student).getNeptun().equals(neptun)) {
				return student;
			}
		}
		return null;
	}
	
	public void addStudent(IStudent student) {
		if(!students.contains(student)) {
			students.add(student);
		}
	}
	
	public void removeStudent(IStudent student) {
		if(students.contains(student)) {
			students.remove(student);
		}
	}
	
	//GROUP
	public AbstractGroup getGroup(String groupName) {
		for(AbstractGroup group : groups) {
			if(group.getGroupName().equals(groupName)) {
				return group;
			}
		}
		return null;
	}
	
	public void addGroup(AbstractGroup group) {
		if(!groups.contains(group)) {
			groups.add(group);
		}
	}
	
	public void removeGroup(AbstractGroup group) {
		if(groups.contains(group)) {
			groups.remove(group);
		}
	}	
	
	//TASK
	public AbstractTask getTask(String title) {
		for(AbstractTask task : tasks) {
			if(task.getTitle().equals(title)) {
				return task;
			}
		}
		return null;
	}
	
	public void addTask(AbstractTask task) {
		if(!tasks.contains(task)) {
			tasks.add(task);
		}
	}
	
	public void removeTask(AbstractTask task) {
		if(tasks.contains(task)) {
			tasks.remove(task);
		}
	}
	
	//SOLUTION
	public AbstractSolution getSolution(String title) {
		for(AbstractSolution solution : solutions) {
			if(solution.getTitle().equals(title)) {
				return solution;
			}
		}
		return null;
	}
	
	public void addSolution(AbstractSolution solution) {
		if(!solutions.contains(solution)) {
			solutions.add(solution);
		}
	}
	
	public void removeSolution(AbstractSolution solution) {
		if(solutions.contains(solution)) {
			solutions.remove(solution);
		}
	}
	
}
