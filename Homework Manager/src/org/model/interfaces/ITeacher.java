/**
 * 
 */
package org.model.interfaces;

import java.util.Calendar;
import java.util.List;

/**
 * @author Tamás
 *
 */
public interface ITeacher {

	public IStudent createStudent(String name, String email, String NC);
	
	public void setStudentCanChoose(IStudent student, boolean canChoose);
	
	public AbstractGroup createGroup(String groupName);
	
	public AbstractGroup addStudentsToGroup(AbstractGroup group, List<IStudent> students);
	
	public AbstractGroup addStudentToGroup(AbstractGroup group, IStudent student);
	
	public AbstractGroup removeStudentFromGroup(AbstractGroup group, IStudent student);
	
	public AbstractTask createTask(String title, String shortDescription);
	
	public AbstractConcreteTask createConcreteTask(String title, String description, int maxStudent, Calendar regEndDate, Calendar finishTaskDate);

	public boolean addConcreteTasktoTask(AbstractTask task, AbstractConcreteTask concreteTask);
	
	public boolean addTaskToGroup(AbstractGroup group, AbstractTask task);
	
	public boolean removeTaskFromGroup(AbstractGroup group, AbstractTask task);
	
	public boolean addTaskToStudent(IStudent student, AbstractTask task);
	
	public boolean removeTaskFromStudent(IStudent student, AbstractTask task);
	
	public boolean addGradeForStudentSolution(IStudent student, int grade);
	
	public boolean addCoomentForStudentSolution(IStudent student, String comment);
	
	public boolean addGradeForGroupSolution(AbstractGroup group, int grade);
	
	public boolean addCommentForGroupSolution(AbstractGroup group, String comment);

}
