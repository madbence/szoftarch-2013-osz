/**
 * 
 */
package org.model;

import java.util.Calendar;
import java.util.List;

import org.manager.DBManager;
import org.manager.Store;
import org.model.interfaces.AbstractConcreteTask;
import org.model.interfaces.AbstractGroup;
import org.model.interfaces.AbstractTask;
import org.model.interfaces.IStudent;
import org.model.interfaces.ITeacher;
import org.model.interfaces.Person;

/**
 * @author Tamás
 *
 */
public class Teacher extends Person implements ITeacher {

	private Store storeManager;
	private DBManager manager;
	
	public Teacher() {
		storeManager = null;
		manager = null;
	}
	
	public void setStoreManager(Store storeManager) {
		this.storeManager = storeManager;
	}
	
	public void setManager(DBManager manager) {
		this.manager = manager;
	}
	
	public Teacher(Store storeManager, DBManager manager) {
		this.storeManager = storeManager;
		this.manager = manager;
	}
	
	@Override
	public IStudent createStudent(String name, String email, String NC) {
		IStudent student = new Student(name, email, NC);
		storeManager.addStudent(student);
		//SAVE THE STUDENT TO THE DB
		if(manager != null) {
			manager.persistObject(student);
		}
		//...
		return student;
	}

	@Override
	public void setStudentCanChoose(IStudent student, boolean canChoose) {
		if(student != null) {
			((Student)student).setCanChooseTask(canChoose);
		}
	}
	
	@Override
	public AbstractGroup createGroup(String groupName) {
		AbstractGroup group = new Group(groupName);
		storeManager.addGroup(group);
		//SAVE THE GROUP TO THE DB
		if(manager != null) {
			manager.persistObject(group);
		}
		//...
		return group;
	}
	
	@Override
	public AbstractGroup addStudentsToGroup(AbstractGroup group, List<IStudent> students) {
		if(group != null) {
			group.setStudents(students);
			return group;
		}
		return null;
	}

	@Override
	public AbstractGroup addStudentToGroup(AbstractGroup group, IStudent student) {
		if(group != null) {
			if(!group.getStudents().contains(student)) {
				group.getStudents().add(student);
				return group;
			}
		}
		return null;
	}

	@Override
	public AbstractGroup removeStudentFromGroup(AbstractGroup group,
			IStudent student) {
		if(group != null) {
			if(group.getStudents().contains(student)) {
				group.getStudents().remove(student);
				return group;
			}
		}
		return null;
	}

	@Override
	public AbstractTask createTask(String title, String shortDescription) {
		AbstractTask task = new Task(title, shortDescription);
		storeManager.addTask(task);
		//SAVE THE TASK TO THE DB
		if(manager != null) {
			manager.persistObject(task);
		}
		//...
		return task;
	}

	@Override
	public AbstractConcreteTask createConcreteTask(String title,
			String description, int maxStudent, Calendar regEndDate, Calendar finishTaskDate) {
		AbstractConcreteTask cTask = new ConcreteTask(title, description, maxStudent, regEndDate, finishTaskDate);
		return cTask;
	}

	@Override
	public boolean addConcreteTasktoTask(AbstractTask task,
			AbstractConcreteTask concreteTask) {
		if(task != null && concreteTask != null) {
			task.setConcreteTask(concreteTask);
			//OverWrite the Task in the DB
			if(manager != null) {
				manager.persistObject(task);
			}
			//...
			return true;
		}
		return false;
	}
	
	@Override
	public boolean addTaskToGroup(AbstractGroup group, AbstractTask task) {
		
		if(group != null && task != null) {
			if(!group.isTaskAccepted()) {
				group.addNewTaskToTaskList(task);
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean removeTaskFromGroup(AbstractGroup group, AbstractTask task) {
		
		if(group != null && task != null) {
			if(!group.isTaskAccepted()) {
				group.removeTaskFromTaskList(task);
				return true;
			}
		}
		return false;
		
	}
	
	@Override
	public boolean addTaskToStudent(IStudent student, AbstractTask task) {
		
		if(student != null && task != null) {
			if( !((Student)student).isTaskAccepted() ) {
				student.addNewTaskToTaskList(task);
				return true;
			}
		}
		return false;
	}
	
	@Override
	public boolean removeTaskFromStudent(IStudent student, AbstractTask task) {
		
		if(student != null && task != null) {
			if( !((Student)student).isTaskAccepted() ) {
				student.removeTaskFromTaskList(task);
				return true;
			}
		}
		return false;
		
	}

	@Override
	public boolean addGradeForStudentSolution(IStudent student, int grade) {
		if(student != null && ((Student)student).isTaskAccepted()) {
			if(Calendar.getInstance().after(((Student)student).getTask().getConcreteTask().getFinishTaskDate()) && ((Student)student).getSolution() != null) {
				((Student)student).getSolution().setGrade(grade);
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean addCoomentForStudentSolution(IStudent student, String comment) {
		if(student != null && ((Student)student).isTaskAccepted()) {
			if(Calendar.getInstance().after(((Student)student).getTask().getConcreteTask().getFinishTaskDate()) && ((Student)student).getSolution() != null) {
				((Student)student).getSolution().setComment(comment);
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean addGradeForGroupSolution(AbstractGroup group, int grade) {
		if(group != null && group.isTaskAccepted()) {
			if(Calendar.getInstance().after(group.getTask().getConcreteTask().getFinishTaskDate()) && group.getSolution() != null) {
				group.setSolutionGrade(grade);
				return true;
			}
		}
		return false;
	}

	@Override
	public boolean addCommentForGroupSolution(AbstractGroup group, String comment) {
		if(group != null && group.isTaskAccepted()) {
			if(Calendar.getInstance().after(group.getTask().getConcreteTask().getFinishTaskDate()) && group.getSolution() != null) {
				group.setSolutionComment(comment);
				return true;
			}
		}
		return false;
	}

	
}
