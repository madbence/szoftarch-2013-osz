/**
 * 
 */
package org.model;


import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

import org.manager.DBManager;
import org.model.interfaces.AbstractSolution;
import org.model.interfaces.AbstractTask;
import org.model.interfaces.IStudent;
import org.model.interfaces.Person;

/**
 * @author Tamás
 *
 */
@Entity
public class Student extends Person implements IStudent {
	
	@Id
	private String neptun;
	@OneToOne
	private AbstractSolution solution;
	@OneToOne
	private AbstractTask task;
	@OneToMany
	private List<AbstractTask> taskList;
	private boolean canChooseTask;
	private boolean taskAccepted;
	@Transient
	private DBManager manager;
	
	public Student() {
		this.name = null;
		this.email = null; 
		this.neptun = null;
		this.canChooseTask = false;
		this.taskAccepted = false;
		
		this.task = null;
		this.taskList = new ArrayList<AbstractTask>();
		this.solution = null;
		this.manager = null;
	}
	
	Student(String name, String email, String NC) {
		this.name = name;
		this.email = email; 
		this.neptun = NC;
		this.canChooseTask = false;
		this.taskAccepted = false;
		
		this.task = null;
		this.taskList = new ArrayList<AbstractTask>();
		this.solution = null;
		this.manager = null;
	}
	
	

	public String getNeptun() {
		return neptun;
	}

	public void setNeptun(String neptun) {
		this.neptun = neptun;
	}

	public AbstractSolution getSolution() {
		return solution;
	}

	/**
	 * USE ONLY FOR THE DB
	 * @param solution
	 */
	public void setSolution(AbstractSolution solution) {
		this.solution = solution;
	}

	public AbstractTask getTask() {
		return task;
	}
	
	public void setTask(AbstractTask task) {
		if(!taskAccepted) {
			taskAccepted = true;
			this.task = task;
		}
	}
	
	public List<AbstractTask> getTaskList() {
		return taskList;
	}
	
	public void setTaskList(List<AbstractTask> taskList) {
		this.taskList = taskList;
	}
	
	public boolean isCanChooseTask() {
		return canChooseTask;
	}

	public void setCanChooseTask(boolean canChooseTask) {
		this.canChooseTask = canChooseTask;
	}

	public boolean isTaskAccepted() {
		return taskAccepted;
	}
	
	/**
	 * USE ONLY FOR DB
	 * @param taskAccepted
	 */
	public void setTaskAccepted(boolean taskAccepted) {
		this.taskAccepted = taskAccepted;
	}
	
	public void setManager(DBManager manager) {
		this.manager = manager;
	}

	
	
	@Override
	public void addNewTaskToTaskList(AbstractTask task) {
		if(!taskList.contains(task)) {
			taskList.add(task);
		}
	}
	
	@Override
	public void removeTaskFromTaskList(AbstractTask task) {
		if(taskList.contains(task)) {
			taskList.remove(task);
		}
	}
	
	@Override
	public AbstractTask acceptTask(AbstractTask task) {
		if(task != null) {
			if(!taskAccepted && taskList.contains(task) && canChooseTask
					&& Calendar.getInstance().before(task.getConcreteTask().getRegistrationEndDate())) {
				taskAccepted = true;
				this.task = task;
				return task;
			}
		}
		return null;
	}

	@Override
	public AbstractSolution createSolution(String name) {
		AbstractSolution solution = new Solution();
		return solution;
	}
	
	@Override
	public boolean uploadSolution(AbstractSolution solution) {
		if(solution != null && Calendar.getInstance().before(this.task.getConcreteTask().getFinishTaskDate()) 
				&& taskAccepted && manager != null)
		{
			setSolution(solution);
			//UPLOAD SOLUTION TO DB
			manager.persistObject(solution);
			//...
			return true;
		}
		return false;
	}

	@Override
	public int checkGrade() {
		if(this.solution != null) {
			return solution.getGrade();
		}
		return 0;
	}

	@Override
	public String checkComment() {
		if(this.solution != null) {
			return solution.getComment();
		}
		return null;
	}

}
