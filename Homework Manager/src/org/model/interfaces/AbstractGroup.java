package org.model.interfaces;

import java.util.Calendar;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.manager.DBManager;
import org.model.Student;

@Entity
@Table(name = "Group")
public abstract class AbstractGroup {

	@Id
	protected String groupName;
	@OneToMany(targetEntity=Student.class)
	protected List<IStudent> students;
	@OneToOne
	protected AbstractTask task;
	@OneToMany
	protected List<AbstractTask> taskList;
	@OneToOne
	protected AbstractSolution solution;
	protected boolean taskAccepted;
	protected boolean canChooseTask;
	@Transient
	protected DBManager manager;

	public String getGroupName() {
		return groupName;
	}
	
	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}
	
	public List<IStudent> getStudents() {
		return students;
	}

	public void setStudents(List<IStudent> students) {
		this.students = students;
	}

	public AbstractTask getTask() {
		return task;
	}
	
	public void setTask(AbstractTask task) {
		if(!taskAccepted) {	
			taskAccepted = true;
			this.task = task;
			for(IStudent student : students) {
				((Student)student).setTask(task);
			}
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
	
	public void setManager(DBManager manager) {
		this.manager = manager;
	}
	
	public void addNewTaskToTaskList(AbstractTask task) {
		if(!taskList.contains(task)) {
			taskList.add(task);
			for(IStudent student : students) {
				((Student) student).addNewTaskToTaskList(task);
			}
		}
	}
	
	public void removeTaskFromTaskList(AbstractTask task) {
		if(taskList.contains(task)) {
			taskList.remove(task);
			for(IStudent student : students) {
				((Student) student).removeTaskFromTaskList(task);
			}
		}
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
	
	public boolean uploadSolution(AbstractSolution solution) {
		if(solution != null && Calendar.getInstance().before(this.task.getConcreteTask().getFinishTaskDate()) 
				&& taskAccepted && manager != null)
		{
			setSolution(solution);
			//UPLOAD SOLUTION TO THE DB
			manager.persistObject(solution);
			//....
			for(IStudent student : students) {
				((Student)student).uploadSolution(solution);
			}
			return true;
		}
		return false;
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
	
	public AbstractTask acceptTask(AbstractTask task) {
		if(task != null) {
			if(!taskAccepted && taskList.contains(task) && canChooseTask
					&& Calendar.getInstance().before(task.getConcreteTask().getRegistrationEndDate())) {
				taskAccepted = true;
				this.task = task;
				for(IStudent student : students) {
					((Student) student).acceptTask(task);
				}
				return task;
			}
		}
		return null;
	}
	
	public void setSolutionGrade(int grade) {
		if(this.solution != null)	{
			this.solution.setGrade(grade);
			for(IStudent student : students) {
				AbstractSolution solution = ((Student)student).getSolution();
				if(solution != null) {
					solution.setGrade(grade);
				}
			}
		}
	}
	
	public void setSolutionComment(String comment) {
		if(this.solution != null)	{
			this.solution.setComment(comment);
			for(IStudent student : students) {
				AbstractSolution solution = ((Student)student).getSolution();
				if(solution != null) {
					solution.setComment(comment);
				}
			}
		}
	}
}
